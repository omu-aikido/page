import { 体勢, type WazaType, type 級段位別, type 技組み合わせ } from "./types";

type WazaTuple = Omit<WazaType, "id">;

function toTuple(級段位: number, 組み合わせ: 技組み合わせ): WazaTuple {
  if ("基本動作" in 組み合わせ) {
    return {
      waza_in: "",
      waza_out: 組み合わせ.基本動作,
      rank: 級段位,
    };
  }

  return {
    waza_in: 組み合わせ.体勢
      ? `${組み合わせ.体勢}${組み合わせ.攻め}`
      : 組み合わせ.攻め,
    waza_out: 組み合わせ.技,
    rank: 級段位,
  };
}

export function expandWazaRules(級段位別: readonly 級段位別[]): WazaType[] {
  const unique = new Map<string, WazaTuple>();

  for (const { 級段位, 技一覧: 一覧 } of 級段位別) {
    for (const rule of 一覧) {
      const 組み合わせ =
        rule.組み合わせ ??
        rule.攻め.flatMap((攻め) =>
          (rule.体勢 ?? [体勢.立ち技]).flatMap((指定体勢) =>
            rule.技.map((技) => ({ 攻め, 体勢: 指定体勢, 技 })),
          ),
        );

      for (const item of 組み合わせ) {
        const tuple = toTuple(級段位, item);
        const key = `${tuple.waza_in}\u0000${tuple.waza_out}`;
        if (!unique.has(key)) unique.set(key, tuple);
      }
    }
  }

  return [...unique.values()].map((waza, index) => ({
    id: index + 1,
    ...waza,
  }));
}
