import { Hono } from "hono";

import calendar from "./hono/calendar";
import contact from "./hono/contact";

const hono = new Hono().basePath("/api");

const app = hono //
  .route("/calendar", calendar)
  .route("/contact", contact);

export type Function = typeof app;
export default app;
