import { hc } from "hono/client";
import type { App } from "../../../worker/index";

export const client = hc<App>("/").api;
