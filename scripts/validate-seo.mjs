import fs from "node:fs";

console.log("--- Verifying SEO Files and Assets ---");

const filesToCheck = [
  "dist/index.html",
  "dist/sitemap.xml",
  "dist/sitemap-index.xml",
  "dist/robots.txt",
  "dist/llms.txt",
  "dist/llm.txt",
  "dist/og-image.svg",
];

for (const file of filesToCheck) {
  if (fs.existsSync(file)) {
    const size = fs.statSync(file).size;
    console.log(`[OK] ${file} exists (${size} bytes)`);
  } else {
    console.error(`[FAIL] ${file} missing!`);
    process.exit(1);
  }
}

const html = fs.readFileSync("dist/index.html", "utf8");
const jsonLdMatch = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);

if (!jsonLdMatch) {
  console.error("[FAIL] JSON-LD script not found in dist/index.html");
  process.exit(1);
}

try {
  const parsed = JSON.parse(jsonLdMatch[1]);
  console.log(`[OK] JSON-LD parsed successfully! Context: ${parsed["@context"]}, Entities in graph: ${parsed["@graph"].length}`);
  for (const entity of parsed["@graph"]) {
    console.log(`     - Type: ${JSON.stringify(entity["@type"])} | ID: ${entity["@id"]}`);
  }
} catch (e) {
  console.error("[FAIL] Error parsing JSON-LD:", e);
  process.exit(1);
}

console.log("--- All SEO validations passed! ---");
