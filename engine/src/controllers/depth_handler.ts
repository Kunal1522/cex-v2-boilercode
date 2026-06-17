import type { EngineRequest } from "..";
import {
  ORDERBOOKS,
  type DepthResponse,
  type RestingOrder,
  type DepthLevel,
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

export function balance_handler(message:EngineRequest){
    const 
}