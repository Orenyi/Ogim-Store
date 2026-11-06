export type CustomerStatus = "active" | "inactive";

export type CustomerTab = "all" | CustomerStatus;

export interface AdminCustomer {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  initials: string;
  totalOrders: number;
  totalSpent: number;
  status: CustomerStatus;
  joinedAt: string;
}

export interface CustomersPercentageChanges {
  totalCustomers: number | null;
  newCustomers: number | null;
  customersWithOrders: number | null;
  inactiveAccounts: number | null;
}

export interface CustomersSummary {
  totalCustomers: number;
  newCustomers: number;
  customersWithOrders: number;
  inactiveAccounts: number;
  percentageChanges: CustomersPercentageChanges;
}

export interface CustomersQuery {
  search: string;
  status: CustomerTab;
  hasOrders: "all" | "yes" | "no";
  page: number;
  limit: number;
}

export interface CustomersResponse {
  customers: AdminCustomer[];
  summary: CustomersSummary;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
