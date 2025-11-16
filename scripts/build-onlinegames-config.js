const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(process.cwd(), "data/onlinegames");
const CONFIG_PATH = path.join(process.cwd(), "src/lib/onlinegames.config.ts");

const parseCsv = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`CSV not found: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, "utf8").trim();
  if (!raw) return [];

  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length);
  if (!lines.length) return [];

  const headers = lines.shift()
    .split(",")
    .map((cell) => cell.trim().toLowerCase());
  const orderIdx = headers.indexOf("order");
  const slugIdx = headers.indexOf("slug");
  if (slugIdx === -1) {
    throw new Error(`Missing 'slug' column in ${filePath}`);
  }

  const entries = [];
  lines.forEach((line, idx) => {
    const cells = line.split(",");
    const rawSlug = (cells[slugIdx] || "").trim();
    if (!rawSlug) return;
    const orderCell = orderIdx >= 0 ? (cells[orderIdx] || "").trim() : "";
    const parsedOrder = orderCell ? Number(orderCell) : NaN;
    entries.push({
      slug: rawSlug,
      order: Number.isFinite(parsedOrder) ? parsedOrder : idx + 1,
    });
  });

  return entries
    .sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.slug.localeCompare(b.slug);
    })
    .map((entry) => entry.slug);
};

const formatArray = (items, indent = "  ") => {
  if (!items.length) return "";
  return items.map((item) => `${indent}"${item}",`).join("\n");
};

const buildConfigSource = (defaults, variants) => {
  const variantEntries = Object.entries(variants)
    .filter(([, slugs]) => slugs.length)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, slugs]) => {
      const body = formatArray(slugs, "    ");
      return `  "${name}": [\n${body}\n  ],`;
    })
    .join("\n");

  const defaultBody = formatArray(defaults, "  ");

  return `export const ONLINEGAMES_DEFAULT: string[] = [\n${defaultBody}\n];\n\nexport const ONLINEGAMES_VARIANTS: Record<string, string[]> = {\n${variantEntries}\n};\n`;
};

const main = () => {
  if (!fs.existsSync(DATA_DIR)) {
    throw new Error(`Missing directory: ${DATA_DIR}`);
  }

  const files = fs
    .readdirSync(DATA_DIR)
    .filter((file) => file.endsWith(".csv"))
    .sort();

  if (!files.length) {
    throw new Error("No CSV files found in data/onlinegames");
  }

  const variants = {};
  let defaults = [];

  files.forEach((file) => {
    const variant = path.basename(file, ".csv");
    const slugs = parseCsv(path.join(DATA_DIR, file));
    if (!slugs.length) return;
    if (variant === "default") {
      defaults = slugs;
    } else {
      variants[variant] = slugs;
    }
  });

  const source = buildConfigSource(defaults, variants);
  fs.writeFileSync(CONFIG_PATH, source);
  console.log(`Updated ${CONFIG_PATH} from ${files.length} CSV file(s).`);
};

main();
