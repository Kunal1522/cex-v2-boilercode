import "dotenv/config";
import { createClient } from "redis";
import { env } from "./utils/env.js";
import { create_order_handler } from "./controllers/orderbook_handler.js";
import {
  balance_handler,
  cancel_handler,
  depth_handler,
  fetch_order_handler,
} from "./controllers/crud_handlers.js";

export type EngineCommandType =
  | "create_order"
  | "get_depth"
  | "get_user_balance"
  | "get_order"
  | "cancel_order";

export interface EngineRequest {
  correlationId: string;
  responseQueue: string;
  type: EngineCommandType;
  payload: Record<string, unknown>;
}

export interface EngineResponse {
  correlationId: string;
  ok: boolean;
  data?: unknown;
  error?: string;
}

const brokerClient = createClient({ url: env.redisUrl }).on(
  "error",
  (error: any) => {
    console.error("Redis broker client error", error);
  },
);

const responseClient = createClient({ url: env.redisUrl }).on(
  "error",
  (error: any) => {
    console.error("Redis response client error", error);
  },
);

await Promise.all([brokerClient.connect(), responseClient.connect()]);

async function sendResponse(
  responseQueue: string,
  response: EngineResponse,
): Promise<void> {
  await responseClient.lPush(responseQueue, JSON.stringify(response));
}

function handleEngineRequest(message: EngineRequest): unknown {
  // console.log("hi");
  let res;
  if (message.type === "create_order") {
    res = create_order_handler(message);
  } else if (message.type === "get_depth") {
    res = depth_handler(message);
  } else if (message.type === "get_user_balance") {
    res = balance_handler(message);
  } else if (message.type === "cancel_order") {
    res = cancel_handler(message);
  } else if (message.type === "get_order") {
    res=fetch_order_handler(message);
    console.log("hi");
    console.log(res);
    
    // return res;
  } else {
    throw new Error("CHUP BSDK");
  }
  return res;
}

console.log(`Engine listening on Redis queue: ${env.incomingQueue}`);

for (;;) {
  const item = await brokerClient.brPop(env.incomingQueue, 0);
  if (!item) continue;

  let message: EngineRequest;

  try {
    message = JSON.parse(item.element) as EngineRequest;
  } catch {
    console.error("Skipping invalid broker message");
    continue;
  }

  try {
    const data = handleEngineRequest(message);
    await sendResponse(message.responseQueue, {
      correlationId: message.correlationId,
      ok: true,
      data,
    });
  } catch (error) {
    await sendResponse(message.responseQueue, {
      correlationId: message.correlationId,
      ok: false,
      error: error instanceof Error ? error.message : "engine_error",
    });
  }
}
