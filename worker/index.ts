import { Hono } from "hono";

import calendar from "./hono/calendar";
import contact from "./hono/contact";

const hono = new Hono().basePath("/api");

const app = hono //
  .get("/", (c) => c.json({ status: "ok" }))
  .route("/calendar", calendar)
  .route("/contact", contact);

export type Function = typeof app;
export default app;
