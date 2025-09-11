export type Transaction = {
  id: string;
  type: "sent" | "received";
  amount: number;
  fee: number;
  status: "completed" | "pending" | "failed";
  date: string;
  address: string;
};

export const wallet = {
  balance: 0.7534,
  address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
};

export const transactions: Transaction[] = [
  {
    id: "tx-1",
    type: "received",
    amount: 0.1,
    fee: 0.0001,
    status: "completed",
    date: "2024-07-29T14:48:00.000Z",
    address: "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy",
  },
  {
    id: "tx-2",
    type: "sent",
    amount: 0.05,
    fee: 0.0002,
    status: "completed",
    date: "2024-07-28T10:30:00.000Z",
    address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  },
  {
    id: "tx-3",
    type: "received",
    amount: 0.25,
    fee: 0.0001,
    status: "pending",
    date: "2024-07-27T18:00:00.000Z",
    address: "34xp4vRoCGJym3xR7yCVPFHoCNxv4NNCbD",
  },
  {
    id: "tx-4",
    type: "sent",
    amount: 0.01,
    fee: 0.00005,
    status: "failed",
    date: "2024-07-26T09:15:00.000Z",
    address: "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
  },
  {
    id: "tx-5",
    type: "received",
    amount: 0.5,
    fee: 0.0003,
    status: "completed",
    date: "2024-07-25T20:00:00.000Z",
    address: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
  },
  {
    id: "tx-6",
    type: "sent",
    amount: 0.005,
    fee: 0.00001,
    status: "completed",
    date: "2024-07-24T12:00:00.000Z",
    address: "17VZNX1SN5NtKa8UQFxwPuFe5K4i2bL5v1",
  },
  {
    id: "tx-7",
    type: "received",
    amount: 0.02,
    fee: 0.00002,
    status: "completed",
    date: "2024-07-23T11:45:00.000Z",
    address: "3EktnHQD7RiAE6uzMj2ZifT9YgRrkSgzQX",
  },
];

export const balanceHistory = [
  { date: "2024-07-01", balance: 0.5 },
  { date: "2024-07-05", balance: 0.55 },
  { date: "2024-07-10", balance: 0.48 },
  { date: "2024-07-15", balance: 0.6 },
  { date: "2024-07-20", balance: 0.72 },
  { date: "2024-07-25", balance: 0.7 },
  { date: "2024-07-30", balance: 0.7534 },
];
