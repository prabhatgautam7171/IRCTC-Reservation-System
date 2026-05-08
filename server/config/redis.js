//config/redis.js

import { createClient } from "redis";

export let redisClient = null;

try {
  const client = createClient({
    url: "redis://127.0.0.1:6379"
  });

  client.on("error", () => {});

  await client.connect();

  console.log("Redis Connected");

  redisClient = client;

} catch (err) {
  console.log("Running without Redis");
}
