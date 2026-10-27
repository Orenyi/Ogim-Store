import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { ContactDeliveryDetails } from "../components/checkout/ContactDeliveryForm";

export type DeliveryMethod = "standard" | "express" | "same-day";

export interface CheckoutDeliveryOption {
  id: DeliveryMethod;
  label: string;
  description: string;
  fee: number;
}

export type CheckoutStep = 1 | 2 | 3 | 4;

interface CheckoutContextValue {
  contactDetails: ContactDeliveryDetails;
  deliveryMethod: DeliveryMethod | null;
  currentStep: CheckoutStep;

  deliveryOptions: CheckoutDeliveryOption[];
  selectedDeliveryOption: CheckoutDeliveryOption | null;
  deliveryFee: number;

  updateContactDetails: (details: Partial<ContactDeliveryDetails>) => void;
  setDeliveryMethod: (method: DeliveryMethod) => void;
  setCurrentStep: (step: CheckoutStep) => void;
  resetCheckout: () => void;
}

interface CheckoutProviderProps {
  children: ReactNode;
}

const initialContactDetails: ContactDeliveryDetails = {
  fullName: "",
  email: "",
  phone: "",
  state: "",
  city: "",
  address: "",
  instructions: "",
};

/**
 * Placeholder delivery fees for frontend development.
 * Replace these with backend-provided rates when delivery is integrated.
 */
const deliveryOptions: CheckoutDeliveryOption[] = [
  {
    id: "standard",
    label: "Standard Delivery",
    description: "2–4 business days",
    fee: 5000,
  },
  {
    id: "express",
    label: "Express Delivery",
    description: "1–2 business days",
    fee: 10000,
  },
  {
    id: "same-day",
    label: "Same Day Delivery",
    description: "Within today (Abuja only)",
    fee: 15000,
  },
];

const CheckoutContext = createContext<CheckoutContextValue | undefined>(
  undefined,
);

export function CheckoutProvider({ children }: CheckoutProviderProps) {
  const [contactDetails, setContactDetails] = useState<ContactDeliveryDetails>(
    initialContactDetails,
  );

  const [deliveryMethod, setDeliveryMethodState] =
    useState<DeliveryMethod | null>(null);

  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);

  const updateContactDetails = useCallback(
    (details: Partial<ContactDeliveryDetails>) => {
      setContactDetails((current) => ({
        ...current,
        ...details,
      }));
    },
    [],
  );

  const setDeliveryMethod = useCallback((method: DeliveryMethod) => {
    setDeliveryMethodState(method);
  }, []);

  const resetCheckout = useCallback(() => {
    setContactDetails({ ...initialContactDetails });
    setDeliveryMethodState(null);
    setCurrentStep(1);
  }, []);

  const selectedDeliveryOption = useMemo(
    () =>
      deliveryOptions.find((option) => option.id === deliveryMethod) ?? null,
    [deliveryMethod],
  );

  const deliveryFee = selectedDeliveryOption?.fee ?? 0;

  const value = useMemo<CheckoutContextValue>(
    () => ({
      contactDetails,
      deliveryMethod,
      currentStep,
      deliveryOptions,
      selectedDeliveryOption,
      deliveryFee,
      updateContactDetails,
      setDeliveryMethod,
      setCurrentStep,
      resetCheckout,
    }),
    [
      contactDetails,
      deliveryMethod,
      currentStep,
      selectedDeliveryOption,
      deliveryFee,
      updateContactDetails,
      setDeliveryMethod,
      resetCheckout,
    ],
  );

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}

/**
 * Access shared checkout state.
 * Must be used inside CheckoutProvider.
 */
export function useCheckout(): CheckoutContextValue {
  const context = useContext(CheckoutContext);

  if (!context) {
    throw new Error("useCheckout must be used within a CheckoutProvider.");
  }

  return context;
}
