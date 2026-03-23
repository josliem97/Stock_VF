const { PayOS } = require("@payos/node");
const payos = new PayOS({
  clientId: "test",
  apiKey: "test",
  checksumKey: "test"
});
console.log("Methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(payos)));
