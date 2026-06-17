export type Side = "buy" | "sell";
export type OrderType = "market" | "limit";
export type OrderStatus = "open" | "partially_filled" | "filled" | "cancelled";

export interface Balance {
  available: number;
  locked: number;
}

export interface RestingOrder {
  orderId: string;
  userId: string;
  side: Side;
  type: "limit";
  symbol: string;
  price: number;
  qty: number;
  filledQty: number;
  status: OrderStatus;
  createdAt: number;
}

export interface OrderRecord {
  orderId: string;
  userId: string;
  side: Side;
  type: OrderType;
  symbol: string;
  price: number | null;
  qty: number;
  filledQty: number;
  status: OrderStatus;
  fills: Fill[];
  createdAt: number;
}

export interface Fill {
  fillId: string;
  symbol: string;
  price: number;
  qty: number;
  buyOrderId: string;
  sellOrderId: string;
  createdAt: number;
}

export interface OrderBook {
  bids: Map<number, RestingOrder[]>;
  asks: Map<number, RestingOrder[]>;
}

export interface CreateOrderInput {
  userId: string;
  type: OrderType;
  side: Side;
  symbol: string;
  price: number | null;
  qty: number;
}

export interface DepthLevel {
  price: number;
  qty: number;
}

export interface DepthResponse {
  symbol: string;
  bids: DepthLevel[];
  asks: DepthLevel[];
}

export const BALANCES = new Map<string, Record<string, Balance>>();
BALANCES.set("ebeb03e7-89e3-42fa-8e3b-afa03f75360b", {
  BTC: {
    available: 2000,
    locked: 0,
  },
  USD: {
    available: 2000000,
    locked: 10000000,
  },
});
BALANCES.set("12fge3", {
  USD: {
    available: 2000000,
    locked: 10000000,
  },
  BTC:{
    available:2000000,
    locked:1000000
  }
});
BALANCES.set("sfwefgergregererg", {
  USD: {
    available: 2000000,
    locked: 10000000,
  },
});

export const ORDERBOOKS = new Map<string, OrderBook>();
const btcOrderBook: OrderBook = {
  bids: new Map<number, RestingOrder[]>([
    [
      68500.5,
      [
        {
          orderId: "12ddsfsdf345",
          userId: "12fge3",
          side: "buy",
          type: "limit",
          symbol: "BTC",
          price: 68500.5,
          qty: 1.4,
          filledQty: 0.2,
          status: "partially_filled",
          createdAt: 1718564200000,
        },
      ],
    ],
    [
      96,
      [
        {
          orderId: "12ddsfsdf345",
          userId: "12fge3",
          side: "buy",
          type: "limit",
          symbol: "BTC",
          price: 96,
          qty: 1.4,
          filledQty: 0.2,
          status: "partially_filled",
          createdAt: 1718564200000,
        },
      ],
    ],
    [
      68450.0,
      [
        {
          orderId: "fgergergergdfverg",
          userId: "sfwefgergregererg",
          side: "buy",
          type: "limit",
          symbol: "BTC",
          price: 68450.0,
          qty: 0.75,
          filledQty: 0,
          status: "open",
          createdAt: 1718564215000,
        },
      ],
    ],
  ]),
  asks: new Map<number, RestingOrder[]>([
    // [
    //   68600.0,
    //   [
    //     {
    //       orderId: "9c1d2e3f-4a5b-6c7d-8e9f-0a1b2c3d4e5f",
    //       userId: "ebeb03e7-89e3-42fa-8e3b-afa03f75360b",
    //       side: "sell",
    //       type: "limit",
    //       symbol: "BTC",
    //       price: 68600.0,
    //       qty: 1.0,
    //       filledQty: 0,
    //       status: "open",
    //       createdAt: 1718564230000,
    //     },
    //   ],
    // ],
    [
      100,
      [
        {
          orderId: "12ddsfsdf345",
          userId: "12fge3",
          side: "sell",
          type: "limit",
          symbol: "BTC",
          price: 100,
          qty: 5,
          filledQty: 0,
          status: "open",
          createdAt: 1718564200000,
        },
      ],
    ],
  ]),
};

ORDERBOOKS.set("BTC", btcOrderBook);
export const ORDERS = new Map<string, OrderRecord>();
export const FILLS: Fill[] = [];
