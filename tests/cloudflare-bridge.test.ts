import { describe, expect, it } from "vite-plus/test";

import { getCloudflareRuntime } from "../server/utils/cloudflare";

describe("Nitro Cloudflare bridge", () => {
  it("event.context.cloudflare の env と execution context を保持する", () => {
    const env = { marker: "binding" };
    const executionContext = { waitUntil() {} };
    const runtime = getCloudflareRuntime({
      cloudflare: { env, context: executionContext },
    });
    expect(runtime.env).toBe(env);
    expect(runtime.context).toBe(executionContext);
  });

  it("Cloudflare runtime がない場合は明示的に失敗する", () => {
    expect(() => getCloudflareRuntime({})).toThrow(
      "Cloudflare bindings are unavailable",
    );
  });
});
