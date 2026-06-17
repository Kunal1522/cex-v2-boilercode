import { userInfo } from "node:os";
import { BALANCES } from "../store/exchange-store";

export function update_balances(
  buyerbalance: any,
  sellerbalance: any,
  symbol: string,
  buyerId: string,
  sellerId: string,
  price_unlocked: number,
  exhanged_qty: number,
) {
  if (!buyerbalance || !buyerbalance["USD"]) {
    throw new Error("USD balance not found");
  }
  if (!buyerbalance[symbol]) {
    buyerbalance[symbol] = {
      available: 0,
      locked: 0,
    };
  }
  if (!sellerbalance || !sellerbalance[symbol]) {
    throw new Error("seller does not have sufficient amount to bid for");
  }
  if (!sellerbalance["USD"]) {
    sellerbalance["USD"] = {
      available: 0,
      locked: 0,
    };
  }
  //buyer update of balances
  console.log("BALANCEBUY", BALANCES.get(buyerId));
  buyerbalance.USD.locked -= price_unlocked;
  console.log("BALANCEBUY", BALANCES.get(buyerId));
  buyerbalance[symbol].available += exhanged_qty;
  console.log("BALANCEBUY", BALANCES.get(buyerId));
  //seller update
  sellerbalance.USD.available += price_unlocked;
  sellerbalance[symbol].locked -= exhanged_qty;
  console.log("BALANCESSELL", BALANCES.get(sellerId));
}
export function validate_and_lock_user_balances(
  userbalance: any,
  symbol: string,
  quote: "asks" | "bids",
  qty: number,
  price: number,
) {
  if (!userbalance) {
    userbalance = {};
  }
  if (!userbalance[symbol]) {
    userbalance[symbol] = {
      available: 0,
      locked: 0,
    };
  }
  if (quote === "asks") {
    console.log("userbalavl", userbalance[symbol].available);
    if (userbalance[symbol].available < qty) {
      console.log("not sufficient stock to sell");
      throw new Error("not sufficient stock to sell");
      return;
    }
    userbalance[symbol].available -= qty;
    userbalance[symbol].locked += qty;
  } else if (quote === "bids") {
    console.log("userbalavl", userbalance.USD.available);
    if (userbalance.USD.available < qty) {
      throw new Error("not sufficient usd to bid for ");
      return;
    }
    userbalance.USD.available -= qty * price;
    userbalance.USD.locked += qty * price;
  }

  return userbalance;
}
