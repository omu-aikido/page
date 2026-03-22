import { Hono } from "hono";
import { cache } from "hono/cache";

import calendar from "./hono/calendar";
import contact from "./hono/contact";

const hono = new Hono()
  .basePath("/api") //
  .use(
    "*",
    cache({
      cacheName: "omu-aikido-api-cache",
      cacheControl: "max-age=600, s-maxage=1200, private, must-revalidate",
      cacheableStatusCodes: [200, 404, 412],
    }),
  );

const app = hono //
  .route("/calendar", calendar)
  .route("/contact", contact);

export type Function = typeof app;
export default app;
