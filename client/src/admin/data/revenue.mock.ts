import type { RevenueReport, RevenuePeriod } from "../types/revenue.types";

const makeChart = (labels: string[], revenues: number[], orders: number[]) =>
  labels.map((label, index) => ({
    label,
    revenue: revenues[index],
    orders: orders[index],
  }));

export const demoRevenueReports: Record<RevenuePeriod, RevenueReport> = {
  today: {
    summary: {
      totalRevenue: {
        value: 1850000,
        previousValue: 1560000,
        percentageChange: 18.6,
      },
      totalOrders: {
        value: 38,
        previousValue: 32,
        percentageChange: 18.8,
      },
      unitsSold: {
        value: 49,
        previousValue: 42,
        percentageChange: 16.7,
      },
      averageOrderValue: {
        value: 48684,
        previousValue: 48750,
        percentageChange: -0.1,
      },
    },
    chart: makeChart(
      ["8 AM", "10 AM", "12 PM", "2 PM", "4 PM", "6 PM", "8 PM"],
      [120000, 280000, 420000, 310000, 520000, 760000, 1850000],
      [3, 6, 9, 7, 11, 16, 38],
    ),
    categories: [
      { id: "iphone", name: "iPhone", percentage: 42, revenue: 777000 },
      { id: "samsung", name: "Samsung", percentage: 28, revenue: 518000 },
      { id: "android", name: "Android", percentage: 18, revenue: 333000 },
      { id: "others", name: "Others", percentage: 12, revenue: 222000 },
    ],
    topProducts: [],
    recentOrders: [],
  },

  "this-week": {
    summary: {
      totalRevenue: {
        value: 12850000,
        previousValue: 11100000,
        percentageChange: 15.8,
      },
      totalOrders: {
        value: 286,
        previousValue: 254,
        percentageChange: 12.6,
      },
      unitsSold: {
        value: 361,
        previousValue: 315,
        percentageChange: 14.6,
      },
      averageOrderValue: {
        value: 44930,
        previousValue: 43700,
        percentageChange: 2.8,
      },
    },
    chart: makeChart(
      ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      [1200000, 1650000, 1420000, 1980000, 1750000, 2420000, 2430000],
      [28, 36, 31, 45, 39, 54, 53],
    ),
    categories: [
      { id: "iphone", name: "iPhone", percentage: 42, revenue: 5397000 },
      { id: "samsung", name: "Samsung", percentage: 28, revenue: 3598000 },
      { id: "android", name: "Android", percentage: 18, revenue: 2313000 },
      { id: "others", name: "Others", percentage: 12, revenue: 1542000 },
    ],
    topProducts: [],
    recentOrders: [],
  },

  "this-month": {
    summary: {
      totalRevenue: {
        value: 24580000,
        previousValue: 20750000,
        percentageChange: 18.4,
      },
      totalOrders: {
        value: 524,
        previousValue: 465,
        percentageChange: 12.6,
      },
      unitsSold: {
        value: 672,
        previousValue: 580,
        percentageChange: 15.9,
      },
      averageOrderValue: {
        value: 46931,
        previousValue: 44624,
        percentageChange: 5.1,
      },
    },
    chart: makeChart(
      [
        "Oct 1",
        "Oct 5",
        "Oct 9",
        "Oct 13",
        "Oct 17",
        "Oct 21",
        "Oct 25",
        "Oct 29",
      ],
      [
        10000000, 14500000, 11800000, 17200000, 13000000, 20200000, 18000000,
        24580000,
      ],
      [28, 55, 46, 72, 58, 90, 82, 110],
    ),
    categories: [
      { id: "iphone", name: "iPhone", percentage: 42, revenue: 10323600 },
      { id: "samsung", name: "Samsung", percentage: 28, revenue: 6884000 },
      { id: "android", name: "Android", percentage: 18, revenue: 4424400 },
      { id: "others", name: "Others", percentage: 12, revenue: 2948000 },
    ],
    topProducts: [
      {
        id: "product-1",
        name: "iPhone 15 Pro",
        image: "/images/products/iphone-15-pro.webp",
        variant: "128GB · Titanium",
        unitsSold: 86,
        revenue: 5156000,
      },
      {
        id: "product-2",
        name: "Samsung Galaxy S24",
        image: "/images/products/samsung-s24.webp",
        variant: "256GB · Black",
        unitsSold: 64,
        revenue: 3424000,
      },
      {
        id: "product-3",
        name: "Infinix Note 40",
        image: "/images/products/infinix-note-40.webp",
        variant: "256GB · Blue",
        unitsSold: 52,
        revenue: 1508000,
      },
      {
        id: "product-4",
        name: "Redmi Note 13",
        image: "/images/products/redmi-note-13.webp",
        variant: "128GB · Black",
        unitsSold: 48,
        revenue: 1392000,
      },
      {
        id: "product-5",
        name: "Tecno Camon 30",
        image: "/images/products/tecno-camon-30.webp",
        variant: "256GB · Gray",
        unitsSold: 44,
        revenue: 1276000,
      },
    ],
    recentOrders: [
      {
        id: "order-1",
        orderNumber: "#OGM-10421",
        customerName: "Adeniyi Ola",
        total: 485000,
        status: "delivered",
        orderedAt: "2026-10-31T14:05:00.000Z",
      },
      {
        id: "order-2",
        orderNumber: "#OGM-10420",
        customerName: "Esther Musa",
        total: 1420000,
        status: "in-transit",
        orderedAt: "2026-10-31T09:40:00.000Z",
      },
      {
        id: "order-3",
        orderNumber: "#OGM-10419",
        customerName: "Ibrahim Jatto",
        total: 385000,
        status: "processing",
        orderedAt: "2026-10-31T08:10:00.000Z",
      },
      {
        id: "order-4",
        orderNumber: "#OGM-10418",
        customerName: "Oluwadamilola O.",
        total: 640000,
        status: "delivered",
        orderedAt: "2026-10-30T16:12:00.000Z",
      },
      {
        id: "order-5",
        orderNumber: "#OGM-10417",
        customerName: "Amaka Titus",
        total: 1350000,
        status: "in-transit",
        orderedAt: "2026-10-30T13:20:00.000Z",
      },
    ],
  },

  "last-month": {
    summary: {
      totalRevenue: {
        value: 20750000,
        previousValue: 18900000,
        percentageChange: 9.8,
      },
      totalOrders: {
        value: 465,
        previousValue: 420,
        percentageChange: 10.7,
      },
      unitsSold: {
        value: 580,
        previousValue: 535,
        percentageChange: 8.4,
      },
      averageOrderValue: {
        value: 44624,
        previousValue: 45000,
        percentageChange: -0.8,
      },
    },
    chart: makeChart(
      [
        "Sep 1",
        "Sep 5",
        "Sep 9",
        "Sep 13",
        "Sep 17",
        "Sep 21",
        "Sep 25",
        "Sep 29",
      ],
      [
        8500000, 10500000, 12000000, 9800000, 15500000, 17200000, 19000000,
        20750000,
      ],
      [22, 31, 38, 29, 47, 51, 58, 72],
    ),
    categories: [
      { id: "iphone", name: "iPhone", percentage: 42, revenue: 8715000 },
      { id: "samsung", name: "Samsung", percentage: 28, revenue: 5810000 },
      { id: "android", name: "Android", percentage: 18, revenue: 3735000 },
      { id: "others", name: "Others", percentage: 12, revenue: 2490000 },
    ],
    topProducts: [],
    recentOrders: [],
  },

  "this-year": {
    summary: {
      totalRevenue: {
        value: 186500000,
        previousValue: 152000000,
        percentageChange: 22.7,
      },
      totalOrders: {
        value: 3940,
        previousValue: 3210,
        percentageChange: 22.7,
      },
      unitsSold: {
        value: 5020,
        previousValue: 4120,
        percentageChange: 21.8,
      },
      averageOrderValue: {
        value: 47335,
        previousValue: 47352,
        percentageChange: 0,
      },
    },
    chart: makeChart(
      [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      [
        10500000, 12000000, 13500000, 14200000, 15100000, 15800000, 16400000,
        17200000, 18500000, 24580000, 0, 0,
      ],
      [210, 230, 260, 275, 290, 310, 325, 350, 390, 524, 0, 0],
    ),
    categories: [
      { id: "iphone", name: "iPhone", percentage: 42, revenue: 78330000 },
      { id: "samsung", name: "Samsung", percentage: 28, revenue: 52220000 },
      { id: "android", name: "Android", percentage: 18, revenue: 33570000 },
      { id: "others", name: "Others", percentage: 12, revenue: 22380000 },
    ],
    topProducts: [],
    recentOrders: [],
  },

  custom: {
    summary: {
      totalRevenue: { value: 0, previousValue: 0, percentageChange: 0 },
      totalOrders: { value: 0, previousValue: 0, percentageChange: 0 },
      unitsSold: { value: 0, previousValue: 0, percentageChange: 0 },
      averageOrderValue: { value: 0, previousValue: 0, percentageChange: 0 },
    },
    chart: [],
    categories: [],
    topProducts: [],
    recentOrders: [],
  },
};
