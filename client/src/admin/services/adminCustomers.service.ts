import { demoCustomers, demoCustomersSummary } from "../data/customers.mock";

import type {
  AdminCustomer,
  CustomersQuery,
  CustomersResponse,
} from "../types/customers.types";

const USE_DEMO_DATA = import.meta.env.VITE_USE_ADMIN_MOCKS === "true";

let customersStore: AdminCustomer[] = [...demoCustomers];

const wait = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getAdminCustomers(
  query: CustomersQuery,
): Promise<CustomersResponse> {
  if (!USE_DEMO_DATA) {
    throw new Error("Admin customers API has not been connected yet.");
  }

  await wait();

  let filtered = [...customersStore];

  // Search by customer name, email or phone number.
  if (query.search.trim()) {
    const search = query.search.trim().toLowerCase();

    filtered = filtered.filter((customer) =>
      [customer.fullName, customer.email, customer.phoneNumber].some((value) =>
        value.toLowerCase().includes(search),
      ),
    );
  }

  // Filter by account status.
  if (query.status !== "all") {
    filtered = filtered.filter((customer) => customer.status === query.status);
  }

  // Filter customers who have placed orders.
  if (query.hasOrders === "yes") {
    filtered = filtered.filter((customer) => customer.totalOrders > 0);
  }

  // Filter customers who have not placed orders.
  if (query.hasOrders === "no") {
    filtered = filtered.filter((customer) => customer.totalOrders === 0);
  }

  // Pagination.
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / query.limit));
  const page = Math.min(Math.max(1, query.page), totalPages);
  const startIndex = (page - 1) * query.limit;

  return {
    customers: filtered.slice(startIndex, startIndex + query.limit),
    summary: demoCustomersSummary,
    pagination: {
      page,
      limit: query.limit,
      total,
      totalPages,
    },
  };
}

export async function updateAdminCustomerStatus(
  customerId: string,
  status: AdminCustomer["status"],
): Promise<AdminCustomer> {
  if (!USE_DEMO_DATA) {
    throw new Error("Update customer API has not been connected yet.");
  }

  await wait();

  const index = customersStore.findIndex(
    (customer) => customer.id === customerId,
  );

  if (index === -1) {
    throw new Error("Customer could not be found.");
  }

  const updatedCustomer: AdminCustomer = {
    ...customersStore[index],
    status,
  };

  customersStore = customersStore.map((customer) =>
    customer.id === customerId ? updatedCustomer : customer,
  );

  return updatedCustomer;
}
