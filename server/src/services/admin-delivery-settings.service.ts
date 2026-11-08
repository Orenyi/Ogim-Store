import DeliverySettingsModel from "../models/DeliverySettings.js";

export interface AdminDeliverySettings {
  defaultFee: number;
  freeDeliveryThreshold: number | null;
  currency: "NGN";
  allowStandardDelivery: boolean;
  allowExpressDelivery: boolean;
  expressDeliveryFee: number;
  defaultEstimatedDelivery: string;
}

export type AdminDeliverySettingsInput = Partial<AdminDeliverySettings>;

export class AdminDeliverySettingsServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "AdminDeliverySettingsServiceError";
    this.statusCode = statusCode;
  }
}

const DEFAULT_DELIVERY_SETTINGS: AdminDeliverySettings = {
  defaultFee: 2500,
  freeDeliveryThreshold: 500000,
  currency: "NGN",
  allowStandardDelivery: true,
  allowExpressDelivery: false,
  expressDeliveryFee: 5000,
  defaultEstimatedDelivery: "2–3 days",
};

function toDeliverySettings(document: {
  defaultFee: number;
  freeDeliveryThreshold: number | null;
  currency: string;
  allowStandardDelivery: boolean;
  allowExpressDelivery: boolean;
  expressDeliveryFee: number;
  defaultEstimatedDelivery: string;
}): AdminDeliverySettings {
  return {
    defaultFee: document.defaultFee,
    freeDeliveryThreshold: document.freeDeliveryThreshold,
    currency: "NGN",
    allowStandardDelivery: document.allowStandardDelivery,
    allowExpressDelivery: document.allowExpressDelivery,
    expressDeliveryFee: document.expressDeliveryFee,
    defaultEstimatedDelivery: document.defaultEstimatedDelivery,
  };
}

function validateSettingsInput(input: AdminDeliverySettingsInput): void {
  const allowedFields = [
    "defaultFee",
    "freeDeliveryThreshold",
    "currency",
    "allowStandardDelivery",
    "allowExpressDelivery",
    "expressDeliveryFee",
    "defaultEstimatedDelivery",
  ];

  for (const field of Object.keys(input)) {
    if (!allowedFields.includes(field)) {
      throw new AdminDeliverySettingsServiceError(
        `Unsupported delivery setting: ${field}.`,
      );
    }
  }

  const feeFields = ["defaultFee", "expressDeliveryFee"] as const;

  for (const field of feeFields) {
    const value = input[field];

    if (
      value !== undefined &&
      (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0)
    ) {
      throw new AdminDeliverySettingsServiceError(
        `${field} must be a valid non-negative whole number.`,
      );
    }
  }

  if (input.freeDeliveryThreshold !== undefined) {
    const threshold = input.freeDeliveryThreshold;

    if (
      threshold !== null &&
      (typeof threshold !== "number" ||
        !Number.isSafeInteger(threshold) ||
        threshold < 0)
    ) {
      throw new AdminDeliverySettingsServiceError(
        "Free delivery threshold must be null or a valid non-negative whole number.",
      );
    }
  }

  const booleanFields = [
    "allowStandardDelivery",
    "allowExpressDelivery",
  ] as const;

  for (const field of booleanFields) {
    const value = input[field];

    if (value !== undefined && typeof value !== "boolean") {
      throw new AdminDeliverySettingsServiceError(
        `${field} must be a boolean value.`,
      );
    }
  }

  if (input.currency !== undefined && input.currency !== "NGN") {
    throw new AdminDeliverySettingsServiceError(
      "Only NGN currency is supported.",
    );
  }

  if (input.defaultEstimatedDelivery !== undefined) {
    if (
      typeof input.defaultEstimatedDelivery !== "string" ||
      !input.defaultEstimatedDelivery.trim()
    ) {
      throw new AdminDeliverySettingsServiceError(
        "Default estimated delivery is required.",
      );
    }

    if (input.defaultEstimatedDelivery.trim().length > 100) {
      throw new AdminDeliverySettingsServiceError(
        "Default estimated delivery cannot exceed 100 characters.",
      );
    }
  }
}

/**
 * Retrieves the store's delivery settings.
 *
 * Creates the default settings document automatically
 * when no configuration exists.
 */
export async function getAdminDeliverySettings(): Promise<AdminDeliverySettings> {
  const settings = await DeliverySettingsModel.findOneAndUpdate(
    { key: "default" },
    {
      $setOnInsert: {
        key: "default",
        ...DEFAULT_DELIVERY_SETTINGS,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  ).lean();

  if (!settings) {
    throw new AdminDeliverySettingsServiceError(
      "Unable to retrieve delivery settings.",
      500,
    );
  }

  return toDeliverySettings(settings);
}

/**
 * Updates the store's delivery settings.
 *
 * Only supplied fields are updated.
 * Missing fields retain their existing values.
 */
export async function updateAdminDeliverySettings(
  input: AdminDeliverySettingsInput,
): Promise<AdminDeliverySettings> {
  validateSettingsInput(input);

  if (Object.keys(input).length === 0) {
    throw new AdminDeliverySettingsServiceError(
      "Provide at least one delivery setting to update.",
    );
  }

  // Ensure the default document exists before updating it.
  await getAdminDeliverySettings();

  const update: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (key === "defaultEstimatedDelivery" && typeof value === "string") {
      update[key] = value.trim();
    } else {
      update[key] = value;
    }
  }

  const settings = await DeliverySettingsModel.findOneAndUpdate(
    { key: "default" },
    { $set: update },
    {
      new: true,
      runValidators: true,
    },
  ).lean();

  if (!settings) {
    throw new AdminDeliverySettingsServiceError(
      "Unable to update delivery settings.",
      500,
    );
  }

  return toDeliverySettings(settings);
}
