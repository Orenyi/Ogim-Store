import { FiCalendar } from "react-icons/fi";

import OrderStatusBadge from "./OrderStatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";

import type { AdminOrder } from "../../types/orders.types";

type Props = {
  order: AdminOrder;
};

export default function OrderSummaryCard({ order }: Props) {
  const itemCount = order.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <section className="admin-order-card">
      <div className="admin-order-card-heading">
        <FiCalendar />
        <h2>Order Summary</h2>
      </div>

      <div className="space-y-3">
        <div className="admin-order-detail-row">
          <span>Order ID</span>
          <strong>{order.orderNumber}</strong>
        </div>

        <div className="admin-order-detail-row">
          <span>Order Date</span>
          <strong>
            {new Date(order.orderedAt).toLocaleString("en-NG", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </strong>
        </div>

        <div className="admin-order-detail-row">
          <span>Total Items</span>
          <strong>
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </strong>
        </div>

        <div className="admin-order-detail-row">
          <span>Payment Status</span>
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>

        <div className="admin-order-detail-row">
          <span>Fulfilment Status</span>
          <OrderStatusBadge status={order.fulfilmentStatus} />
        </div>
      </div>
    </section>
  );
}
