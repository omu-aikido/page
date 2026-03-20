import { Hono } from "hono";

export async function getNews() {
  const id = "1sAIL3UdWFxWUXMvGFGrmV8WWKfr0fzaO09TzTSibPL4";
  const gid = "1160124920";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const jsonData = await fetchSheet(id, gid).then(sheetToJson);
  if (jsonData.status !== "ok") throw new Error("Failed to fetch newsletters");
  if (jsonData.table.rows.length === 0) throw new Error("No newsletters found");

  const sheet = parseSheet(jsonData);

  // Sort by タイムスタンプ first to ensure consistent ID assignment
  const sorted = sheet.sort((a, b) => {
    const dateA = a.タイムスタンプ ? new Date(a.タイムスタンプ).getTime() : 0;
    const dateB = b.タイムスタンプ ? new Date(b.タイムスタンプ).getTime() : 0;
    return dateA - dateB;
  });

  // Assign stable IDs based on original order
  const withIds = sorted.map((row, index) => ({
    ...row,
    stableId: index,
  }));

  const filtered = withIds.filter((row: any) => {
    let start: Date | null = null;
    let end: Date | null = null;
    if (row.start) start = new Date(row.start);
    if (row.end) end = new Date(row.end);
    return (start && start < today) || (end && end > today);
  });

  return filtered.map((row: any) => ({
    id: row.stableId,
    title: row.title,
    content: row.content,
    date: row.タイムスタンプ,
  }));
}

const fetchSheet = async (id: string, gid: string) => {
  const txt = await fetch(
    `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&tq&gid=${gid}`,
  );
  return await txt.text();
};

const sheetToJson = async (txt: string) => {
  // Remove any leading non-JSON characters and the google.visualization Query prefix
  const prefix = "google.visualization.Query.setResponse(";
  const prefixIndex = txt.indexOf(prefix);
  if (prefixIndex !== -1) {
    txt = txt.slice(prefixIndex + prefix.length);
    // Remove trailing characters like ');'
    if (txt.endsWith(");")) {
      txt = txt.slice(0, -2);
    }
    txt = txt.trim();
  }
  const parsed = JSON.parse(txt) as GoogleSpreadSheetJSON;
  return parsed;
};

const parseSheet = (sheet: GoogleSpreadSheetJSON) => {
  const rows = sheet.table.rows;
  const columns = sheet.table.cols.map((col) => col.label);
  const data = rows.map((row) => {
    const values = row.c.map((cell) => {
      if (cell === null) return null;
      if (cell.f) return cell.f;
      return cell.v;
    });
    return Object.fromEntries(columns.map((key, index) => [key, values[index]]));
  });
  return data;
};

type GoogleSpreadSheetJSON = {
  version: string;
  reqId: string;
  status: string;
  sig: string;
  table: {
    cols: {
      id: string;
      label: string;
      type: string;
      pattern?: string;
    }[];
    rows: {
      c: null[] | { f?: string; v: string }[];
    }[];
    parsedNumHeaders: number;
  };
};

// News endpoint with caching
const app = new Hono().get("/", async (c) => {
  try {
    const news = await getNews();
    return c.json(news);
  } catch (err) {
    console.error("Error fetching news:", err);
    return c.json({ error: "Failed to fetch news" }, 500);
  }
});

export default app;
