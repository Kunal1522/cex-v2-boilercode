import {
  BALANCES,
  FILLS,
  type Fill,
  type OrderBook,
  type RestingOrder,
} from "../store/exchange-store";
import { update_balances } from "./balances";

//trader---
//retiree
export function order_matcher(
  valid_prices: number[],
  matching_price_orders: Map<number, RestingOrder[]>,
  userId: string,
  qty: number,
  orderId: string,
  symbol: string,
  quote: string,
  orders_of_curr_price: any,
  side: "buy" | "sell",
) {
  console.log("quotein ordermatcher", quote);
  let filledqty = 0;
  let avg_price = {
    total_count: 0,
    total_price: 0,
  };
  let traderfilled: Boolean = false;
  let fills_of_this_order: Fill[] = [];
  outer: for (const valid_price of valid_prices) {
    for (const [price, orders] of matching_price_orders) {
      for (let idx = 0; idx < orders.length; idx++) {
        let order = orders[idx];
        if (!order) {
          continue;
        }
        if (traderfilled) {
          break outer;
        }
        const retireeOrderId = order.orderId;
        const retireeId = order.userId;
        const traderId = userId;
        const traderOrderId = orderId;
        const exhanged_qty = Math.min(qty, order.qty - order.filledQty);
        console.log("exch", exhanged_qty);
        if (exhanged_qty > 0) {
          const price_unlocked = exhanged_qty * valid_price;
          order.filledQty += exhanged_qty;
          filledqty += exhanged_qty;
          let traderbalance = BALANCES.get(traderId);
          let retireeIbalance = BALANCES.get(retireeId);
          console.log("taderbal", traderbalance);
          console.log("retireebal", retireeIbalance);
          if (quote === "asks") {
            update_balances(
              retireeIbalance,
              traderbalance,
              symbol,
              retireeId,
              traderId,
              price_unlocked,
              exhanged_qty,
            );
          } else if (quote === "bids") {
            update_balances(
              traderbalance,
              retireeIbalance,
              symbol,
              traderId,
              retireeId,
              price_unlocked,
              exhanged_qty,
            );
          }
          console.log("traderbal", traderbalance);
          //buyer===full
          //seller===full
          let filledretiree = order.filledQty === order.qty;
          traderfilled = Boolean(filledqty === qty);
          if (filledretiree) {
            //remove from orderbook
            orders.splice(idx, 1);
          }
          avg_price.total_count++;
          let buyOrderId = "",
            sellerOrderId = "";
          if (quote === "asks") {
            buyOrderId = retireeOrderId;
            sellerOrderId = traderOrderId;
          } else {
            buyOrderId = traderOrderId;
            sellerOrderId = retireeOrderId;
          }
          avg_price.total_price += valid_price;
          const fill: Fill = {
            fillId: crypto.randomUUID(),
            symbol: symbol,
            price: valid_price,
            buyOrderId: buyOrderId,
            sellOrderId: sellerOrderId,
            qty: exhanged_qty,
            createdAt: Date.now(),
          };

          fills_of_this_order.push(fill);

          FILLS.push(fill);
          if (traderfilled == false) {
            orders_of_curr_price?.push({
              orderId: orderId,
              userId: userId,
              side: side,
              type: "limit",
              symbol: symbol,
              price: price,
              qty: qty,
              filledQty: filledqty,
              status: "open",
              createdAt: Date.now(),
            });
          }
          return {
            orderId: orderId,
            status: traderfilled ? "FILLED" : "OPEN",
            filledQty: filledqty,
            averagePrice: avg_price.total_price / avg_price.total_count,
            fills: fills_of_this_order,
          };
        }
      }
    }
  }
}
