// config/redis.js

import { createClient } from "redis";

export const redisClient = createClient({
  url: "redis://127.0.0.1:6379"
});

redisClient.on("error", (err) => {
  console.log("Redis unavailable");
});

try {
  await redisClient.connect();
  console.log("Redis Connected");
} catch (err) {
  console.log("Running without Redis");
}
