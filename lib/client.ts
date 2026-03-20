import { hc } from "hono/client";
import type { Function } from "../worker/index";

export const client = hc<Function>("/").api;
