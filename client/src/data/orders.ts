export type OrderStatus = "Processing" | "Shipped" | "Delivered" | "Cancelled";

export type ProductCondition = "Brand New" | "UK-Used" | "Refurbished";

export type PaymentStatus = "Paid" | "Pending" | "Failed" | "Refunded";

export interface OrderItem {
  id: string;
  name: string;
  slug: string;
  image?: string;
  variant: string;
  condition: ProductCondition;
  price: number;
  quantity: number;
}

export interface OrderTimelineEvent {
  label: string;
  description: string;
  date?: string;
  completed: boolean;
}

export interface CustomerOrder {
  id: string;
  /** ISO timestamp used for sorting orders reliably. */
  createdAt: string;
  /** Human-readable date shown in the UI. */
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  deliveryFee: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string[];
  deliveryMethod: string;
  estimatedDelivery: string;
  trackingNumber: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  timeline: OrderTimelineEvent[];
}

export const orders: CustomerOrder[] = [
  {
    id: "OGM123456",
    createdAt: "2026-10-22T15:24:00+01:00",
    date: "Oct 22, 2026 at 3:24 PM",
    status: "Delivered",
    items: [
      {
        id: "iphone-16-pro",
        name: "iPhone 16 Pro",
        slug: "iphone-16-pro",
        variant: "256GB | Natural Titanium",
        condition: "Brand New",
        price: 1_350_000,
        quantity: 1,
      },
      {
        id: "samsung-galaxy-s24",
        name: "Samsung Galaxy S24",
        slug: "samsung-galaxy-s24",
        variant: "256GB | Phantom Black",
        condition: "UK-Used",
        price: 720_000,
        quantity: 1,
      },
      {
        id: "google-pixel-8",
        name: "Google Pixel 8",
        slug: "google-pixel-8",
        variant: "128GB | Obsidian",
        condition: "Refurbished",
        price: 520_000,
        quantity: 1,
      },
    ],
    deliveryFee: 5_000,
    customerName: "Simon Otaru",
    customerPhone: "+234 803 123 4567",
    deliveryAddress: ["12, Ado Drive, Gwagwalada", "Abuja, FCT, Nigeria"],
    deliveryMethod: "Standard Delivery (2–4 business days)",
    estimatedDelivery: "Oct 24, 2026",
    trackingNumber: "OGM-TRK-123456",
    paymentMethod: "Card",
    paymentStatus: "Paid",
    timeline: [
      {
        label: "Order placed",
        description: "Your order was received.",
        date: "Oct 22, 2026, 3:24 PM",
        completed: true,
      },
      {
        label: "Processing",
        description: "Your order was prepared.",
        date: "Oct 22, 2026, 5:10 PM",
        completed: true,
      },
      {
        label: "Shipped",
        description: "Your order was dispatched.",
        date: "Oct 23, 2026, 11:00 AM",
        completed: true,
      },
      {
        label: "Delivered",
        description: "Your order was delivered.",
        date: "Oct 24, 2026, 10:15 AM",
        completed: true,
      },
    ],
  },
  {
    id: "OGM123457",
    createdAt: "2026-10-10T12:00:00+01:00",
    date: "Oct 10, 2026",
    status: "Processing",
    items: [
      {
        id: "samsung-galaxy-s24-processing",
        name: "Samsung Galaxy S24",
        slug: "samsung-galaxy-s24",
        variant: "256GB | Phantom Black",
        condition: "Brand New",
        price: 1_250_000,
        quantity: 1,
      },
    ],
    deliveryFee: 5_000,
    customerName: "Simon Otaru",
    customerPhone: "+234 803 123 4567",
    deliveryAddress: ["12, Ado Drive, Gwagwalada", "Abuja, FCT, Nigeria"],
    deliveryMethod: "Standard Delivery (2–4 business days)",
    estimatedDelivery: "Pending confirmation",
    trackingNumber: "OGM-TRK-123457",
    paymentMethod: "Card",
    paymentStatus: "Paid",
    timeline: [
      {
        label: "Order placed",
        description: "Your order was received.",
        date: "Oct 10, 2026",
        completed: true,
      },
      {
        label: "Processing",
        description: "Your order is being prepared.",
        completed: true,
      },
      {
        label: "Shipped",
        description: "Awaiting dispatch.",
        completed: false,
      },
      {
        label: "Delivered",
        description: "Awaiting delivery.",
        completed: false,
      },
    ],
  },
  {
    id: "OGM123458",
    createdAt: "2026-09-28T12:00:00+01:00",
    date: "Sep 28, 2026",
    status: "Cancelled",
    items: [
      {
        id: "google-pixel-8-cancelled",
        name: "Google Pixel 8",
        slug: "google-pixel-8",
        variant: "128GB | Obsidian",
        condition: "Refurbished",
        price: 520_000,
        quantity: 1,
      },
      {
        id: "iphone-15-cancelled",
        name: "iPhone 15",
        slug: "iphone-15",
        variant: "128GB | Black",
        condition: "UK-Used",
        price: 1_200_000,
        quantity: 1,
      },
    ],
    deliveryFee: 0,
    customerName: "Simon Otaru",
    customerPhone: "+234 803 123 4567",
    deliveryAddress: ["12, Ado Drive, Gwagwalada", "Abuja, FCT, Nigeria"],
    deliveryMethod: "Standard Delivery",
    estimatedDelivery: "Not applicable",
    trackingNumber: "OGM-TRK-123458",
    paymentMethod: "Card",
    paymentStatus: "Refunded",
    timeline: [
      {
        label: "Order placed",
        description: "Your order was received.",
        date: "Sep 28, 2026",
        completed: true,
      },
      {
        label: "Cancelled",
        description: "This order was cancelled.",
        date: "Sep 28, 2026",
        completed: true,
      },
    ],
  },
  {
    id: "OGM123459",
    createdAt: "2026-09-12T12:00:00+01:00",
    date: "Sep 12, 2026",
    status: "Shipped",
    items: [
      {
        id: "iphone-15-blue",
        name: "iPhone 15",
        slug: "iphone-15",
        variant: "128GB | Blue",
        condition: "Brand New",
        price: 980_000,
        quantity: 1,
      },
    ],
    deliveryFee: 5_000,
    customerName: "Simon Otaru",
    customerPhone: "+234 803 123 4567",
    deliveryAddress: ["12, Ado Drive, Gwagwalada", "Abuja, FCT, Nigeria"],
    deliveryMethod: "Standard Delivery (2–4 business days)",
    estimatedDelivery: "Pending confirmation",
    trackingNumber: "OGM-TRK-123459",
    paymentMethod: "Card",
    paymentStatus: "Paid",
    timeline: [
      {
        label: "Order placed",
        description: "Your order was received.",
        date: "Sep 12, 2026",
        completed: true,
      },
      {
        label: "Processing",
        description: "Your order was prepared.",
        date: "Sep 12, 2026",
        completed: true,
      },
      {
        label: "Shipped",
        description: "Your order is on its way.",
        completed: true,
      },
      {
        label: "Delivered",
        description: "Awaiting delivery.",
        completed: false,
      },
    ],
  },
  {
    id: "OGM123460",
    createdAt: "2026-08-30T12:00:00+01:00",
    date: "Aug 30, 2026",
    status: "Delivered",
    items: [
      {
        id: "iphone-14",
        name: "iPhone 14",
        slug: "iphone-14",
        variant: "128GB | Midnight",
        condition: "UK-Used",
        price: 950_000,
        quantity: 1,
      },
      {
        id: "samsung-galaxy-a55",
        name: "Samsung Galaxy A55",
        slug: "samsung-galaxy-a55",
        variant: "256GB | Navy",
        condition: "Brand New",
        price: 940_000,
        quantity: 1,
      },
    ],
    deliveryFee: 0,
    customerName: "Simon Otaru",
    customerPhone: "+234 803 123 4567",
    deliveryAddress: ["12, Ado Drive, Gwagwalada", "Abuja, FCT, Nigeria"],
    deliveryMethod: "Standard Delivery",
    estimatedDelivery: "Sep 2, 2026",
    trackingNumber: "OGM-TRK-123460",
    paymentMethod: "Card",
    paymentStatus: "Paid",
    timeline: [
      {
        label: "Order placed",
        description: "Your order was received.",
        date: "Aug 30, 2026",
        completed: true,
      },
      {
        label: "Processing",
        description: "Your order was prepared.",
        date: "Aug 31, 2026",
        completed: true,
      },
      {
        label: "Shipped",
        description: "Your order was dispatched.",
        date: "Sep 1, 2026",
        completed: true,
      },
      {
        label: "Delivered",
        description: "Your order was delivered.",
        date: "Sep 2, 2026",
        completed: true,
      },
    ],
  },
  {
    id: "OGM123461",
    createdAt: "2026-08-12T12:00:00+01:00",
    date: "Aug 12, 2026",
    status: "Delivered",
    items: [
      {
        id: "iphone-13-yellow",
        name: "iPhone 13",
        slug: "iphone-13",
        variant: "128GB | Yellow",
        condition: "UK-Used",
        price: 715_000,
        quantity: 1,
      },
    ],
    deliveryFee: 5_000,
    customerName: "Simon Otaru",
    customerPhone: "+234 803 123 4567",
    deliveryAddress: ["12, Ado Drive, Gwagwalada", "Abuja, FCT, Nigeria"],
    deliveryMethod: "Standard Delivery",
    estimatedDelivery: "Aug 15, 2026",
    trackingNumber: "OGM-TRK-123461",
    paymentMethod: "Card",
    paymentStatus: "Paid",
    timeline: [
      {
        label: "Order placed",
        description: "Your order was received.",
        date: "Aug 12, 2026",
        completed: true,
      },
      {
        label: "Processing",
        description: "Your order was prepared.",
        date: "Aug 13, 2026",
        completed: true,
      },
      {
        label: "Shipped",
        description: "Your order was dispatched.",
        date: "Aug 14, 2026",
        completed: true,
      },
      {
        label: "Delivered",
        description: "Your order was delivered.",
        date: "Aug 15, 2026",
        completed: true,
      },
    ],
  },
];

/** Returns the subtotal before delivery charges. */
export function getOrderSubtotal(order: CustomerOrder): number {
  return order.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
}

/** Returns the order subtotal plus delivery charges. */
export function getOrderTotal(order: CustomerOrder): number {
  return getOrderSubtotal(order) + order.deliveryFee;
}

/** Returns the total number of units in the order. */
export function getOrderItemCount(order: CustomerOrder): number {
  return order.items.reduce((total, item) => total + item.quantity, 0);
}

/** Formats a number as Nigerian naira. */
export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Returns a new array with the most recent orders first. */
export function getOrdersSortedByDate(
  orderList: CustomerOrder[] = orders,
): CustomerOrder[] {
  return [...orderList].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

/** Finds an order by its reference, case-insensitively. */
export function getOrderById(
  orderId: string | undefined,
  orderList: CustomerOrder[] = orders,
): CustomerOrder | undefined {
  if (!orderId) return undefined;

  return orderList.find(
    (order) => order.id.toLowerCase() === orderId.toLowerCase(),
  );
}
