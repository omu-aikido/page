import { describe, expect, it } from "vite-plus/test";

import { wazadata } from "../app/utils/lotAikido/data";
import { expandWazaRules } from "../app/utils/lotAikido/expand";
import { 体勢, 技, 攻め } from "../app/utils/lotAikido/types";

describe("lotAikido rule expansion", () => {
  it("直積は攻め・体勢・技の組み合わせを展開する", () => {
    expect(
      expandWazaRules([
        {
          級段位: 5,
          技一覧: [
            {
              攻め: [攻め.正面],
              体勢: [体勢.立ち技, 体勢.座技],
              技: [技.教.一.表, 技.教.一.裏],
            },
          ],
        },
      ]),
    ).toEqual([
      { id: 1, waza_in: "正面打ち", waza_out: "一教（表）", rank: 5 },
      { id: 2, waza_in: "正面打ち", waza_out: "一教（裏）", rank: 5 },
      { id: 3, waza_in: "座技正面打ち", waza_out: "一教（表）", rank: 5 },
      { id: 4, waza_in: "座技正面打ち", waza_out: "一教（裏）", rank: 5 },
    ]);
  });

  it("列挙と体勢省略は指定した立ち技だけを展開する", () => {
    expect(
      expandWazaRules([
        {
          級段位: 5,
          技一覧: [
            {
              組み合わせ: [{ 攻め: 攻め.突き, 技: 技.小手 }],
            },
          ],
        },
      ]),
    ).toEqual([{ id: 1, waza_in: "突き", waza_out: "小手返し", rank: 5 }]);
  });

  it("同じ組み合わせは最初に記述した初出級段位を残す", () => {
    expect(
      expandWazaRules([
        {
          級段位: 5,
          技一覧: [
            {
              組み合わせ: [{ 攻め: 攻め.突き, 技: 技.小手 }],
            },
          ],
        },
        {
          級段位: 3,
          技一覧: [
            {
              組み合わせ: [{ 攻め: 攻め.突き, 技: 技.小手 }],
            },
          ],
        },
      ]),
    ).toEqual([{ id: 1, waza_in: "突き", waza_out: "小手返し", rank: 5 }]);
  });

  it("data.ts のサンプルを展開する", () => {
    expect(wazadata.length).toBeGreaterThan(0);
  });
});
