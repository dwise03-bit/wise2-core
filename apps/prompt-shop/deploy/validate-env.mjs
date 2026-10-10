import { readFileSync } from "node:fs";
const file = process.argv[2] || ".env.production";
const values = Object.fromEntries(readFileSync(file, "utf8").split(/\r?\n/).filter((line) => line && !line.startsWith("#") && line.includes("=")).map((line) => { const at = line.indexOf("="); return [line.slice(0, at), line.slice(at + 1)]; }));
const errors = [];
if (!/^[a-z0-9.-]+$/i.test(values.DOMAIN || "")) errors.push("DOMAIN must be a DNS hostname.");
if (!/^[A-Za-z0-9_-]{20,}$/.test(values.POSTGRES_PASSWORD || "") || values.POSTGRES_PASSWORD?.startsWith("replace-")) errors.push("POSTGRES_PASSWORD must be a unique 20+ character URL-safe secret (letters, numbers, _ or -). ");
if ((values.AUTH_SECRET || "").length < 32 || values.AUTH_SECRET?.startsWith("replace-")) errors.push("AUTH_SECRET must contain at least 32 random characters.");
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log("Production environment validation passed.");
