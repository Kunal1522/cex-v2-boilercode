import type { EngineRequest } from "..";
import {
  ORDERBOOKS,
  type DepthResponse,
  type RestingOrder,
  type DepthLevel,
  BALANCES,
} from "../store/exchange-store";
function extract_price_qty(orders: Map<number, RestingOrder[]>): DepthLevel[] {
  const depthlvls: DepthLevel[] = [];
  orders.forEach((nestorders, price) => {
    nestorders.forEach((order) => {
      depthlvls.push({
        price: price,
        qty: order.qty,
      });
    });
  });

  return depthlvls;
}

export function depth_handler(message: EngineRequest) {
  const { symbol } = message.payload as { symbol: string };
  console.log(typeof symbol);
  const OrderBook = ORDERBOOKS.get(symbol);
  console.log(OrderBook);
  let bids: DepthLevel[] = [],
    asks: DepthLevel[] = [];
  if (OrderBook?.bids) {
    bids = extract_price_qty(OrderBook?.bids);
    bids.sort((a, b) => b.price - a.price);
  }
  if (OrderBook?.asks) {
    asks = extract_price_qty(OrderBook?.asks);
    asks.sort((a, b) => a.price - b.price);
  }
  const res: DepthResponse = {
    symbol: symbol,
    bids: bids,
    asks: asks,
  };
  return res;
}

export function balance_handler(message: EngineRequest) {
  const { userId } = message.payload as { userId: string };
  console.log(typeof userId);
  return BALANCES.get(userId);
}

export function cancel_handler(message: EngineRequest) {
  //   cancel_order should:

  // find the order
  // return an error if the order does not exist
  // return an error if the order is already filled
  // remove remaining resting quantity from the order book
  // mark the order as cancelled
  const { userId, orderId } = message.payload as {
    userId: string;
    orderId: string;
  };
  for (const [s, OrderBook] of ORDERBOOKS) {
    for (const [price, orders] of OrderBook.asks) {
      for (let idx = 0; idx < orders.length; idx++) {
        if (orders[idx]?.orderId === orderId) {
          if (orders[idx]?.status === "filled") {
            throw new Error("order is filled can't delete");
            return;
          }
          orders.splice(idx, 1);
          return {
            orderId: orderId,
          };
        }
      }
    }
    for (const [price, orders] of OrderBook.bids) {
      for (let idx = 0; idx < orders.length; idx++) {
        if (orders[idx]?.orderId === orderId) {
          if (orders[idx]?.status === "filled") {
            throw new Error("order is filled can't delete");
            return;
          }
          orders.splice(idx, 1);
          return {
            orderId: orderId,
          };
        }
      }
    }
  }
  throw new Error("orderid does not exist");
}

export function fetch_order_handler(message: EngineRequest) {
  const { orderId } = message.payload as {
    orderId: string;
  };
  console.log(orderId, typeof orderId);
  for (const [sym, OrderBook] of ORDERBOOKS) {
    for (const [price, orders] of OrderBook.asks) {
      for (let idx = 0; idx < orders.length; idx++) {
        const order = orders[idx];
        console.log(order);
        console.log(order?.orderId === orderId);
        if (order?.orderId === orderId) {
          console.log("hi");
          return order;
        }
      }
    }
    for (const [price, orders] of OrderBook.bids) {
      for (let idx = 0; idx < orders.length; idx++) {
        const order = orders[idx];
        console.log(order);
        console.log(order?.orderId === orderId);
        if (order?.orderId === orderId) {
          console.log("hi");
          return order;
        }
      }
    }
  }
  throw new Error("orderid does not exist");
}
