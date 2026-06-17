import type { EngineRequest } from "..";
import type {
  OrderBook,
  RestingOrder,
  Fill,
  OrderRecord,
} from "../store/exchange-store";
import { BALANCES, ORDERBOOKS, FILLS } from "../store/exchange-store";
import {
  validate_and_lock_user_balances,
  update_balances,
} from "../utils/balances";
import { order_matcher } from "../utils/matching";
export interface OrderBookPayload {
  userId: string;
  type: "market" | "limit";
  symbol: string;
  side: "buy" | "sell";
  price: number;
  qty: number;
}
function limit_market_handler(message: EngineRequest) {
  const payload = message.payload;
  // console.log(payload);
  if (!payload) {
    console.error("skipping payload is empty");
    return;
  }
  const { userId, type, side, symbol, price, qty } =
    payload as unknown as OrderBookPayload;
  console.log(userId, type, side, symbol, price, qty);
  let filledqty = 0;
  if (!ORDERBOOKS.get(symbol)) {
    ORDERBOOKS.set(symbol, {
      bids: new Map<number, RestingOrder[]>(),
      asks: new Map<number, RestingOrder[]>(),
    });
  }
  console.log("orderbookunde", ORDERBOOKS.get(symbol));
  let Orderbook = ORDERBOOKS.get(symbol);
  const quote = side === "buy" ? "bids" : "asks";
  let Orderbookside = Orderbook?.[quote];
  if (Orderbookside && Orderbook) {
    if (!Orderbookside?.get(price)) {
      Orderbookside.set(price, []);
    }
    let all_price_orders = Orderbook[quote];
    let orders_of_curr_price = all_price_orders.get(price);
    const orderId = crypto.randomUUID();
    let userbalance = BALANCES.get(userId);
    let fills_of_this_order: Fill[] = [];
    userbalance = validate_and_lock_user_balances(
      userbalance,
      symbol,
      quote,
      qty,
      price,
    );
    console.log("userbalance", userbalance);
    let valid_prices: number[] = [];
    const opp_quote = quote === "asks" ? "bids" : "asks";
    let avg_price = {
      total_price: 0,
      total_count: 0,
    };
    let matching_price_orders = Orderbook[opp_quote];
    if (quote === "asks") {
      matching_price_orders.forEach((orders, key) => {
        if (key > price) valid_prices.push(key);
      });
      console.log(valid_prices.length);
      let filledseller = filledqty === qty;
      if (valid_prices.length === 0) {
        return {
          orderId: orderId,
          status: filledseller ? "FILLED" : "OPEN",
          filledQty: filledqty,
          averagePrice: avg_price.total_price / avg_price.total_count,
          fills: fills_of_this_order,
        };
      }
      valid_prices.sort((a, b) => b - a);
      const res = order_matcher(
        valid_prices,
        matching_price_orders,
        userId,
        qty,
        orderId,
        symbol,
        quote,
        orders_of_curr_price,
        side,
      );
      return res;
    } else if (quote === "bids") {
      matching_price_orders.forEach((orders, key) => {
        if (key < price) valid_prices.push(key);
      });
      console.log(valid_prices.length);
      let filledseller = filledqty === qty;
      if (valid_prices.length === 0) {
        return {
          orderId: orderId,
          status: filledseller ? "FILLED" : "OPEN",
          filledQty: filledqty,
          averagePrice: avg_price.total_price / avg_price.total_count,
          fills: fills_of_this_order,
        };
      }
      valid_prices.sort((a, b) => a - b);
      const res = order_matcher(
        valid_prices,
        matching_price_orders,
        userId,
        qty,
        orderId,
        symbol,
        quote,
        orders_of_curr_price,
        side,
      );
      return res;
    }
  }
}
export function create_order_handler(message: EngineRequest) {
  if (message.payload.type === "limit") {
    return limit_market_handler(message);
  }
}
