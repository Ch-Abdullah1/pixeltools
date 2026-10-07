// Post-build checks: node test.js
const fs = require("fs"), path = require("path"); let bad = 0;
const fail = m => { console.error("FAIL", m); bad++; };
const files = []; (function w(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? w(p) : files.push(p); } })("dist");
const html = files.filter(f => f.endsWith(".html"));
const titles = new Set();
for (const f of html) {
  const s = fs.readFileSync(f, "utf8"), t = (s.match(/<title>(.*?)<\/title>/) || [])[1];
  if (!t) fail(f + " no title"); else if (titles.has(t)) fail(f + " duplicate title"); titles.add(t);
  if (!/<meta name="description"/.test(s) || !/rel="canonical"/.test(s)) fail(f + " meta");
  if ((s.match(/<h1[ >]/g) || []).length !== 1) fail(f + " h1 count");
  for (const [, h] of s.matchAll(/href="(\/[^"#]*)"/g)) { const p = path.join("dist", h.endsWith("/") ? h + "index.html" : h); if (!fs.existsSync(p)) fail(`${f} broken link ${h}`); }
  for (const [, j] of s.matchAll(/ld\+json">(.*?)<\/script>/g)) try { JSON.parse(j); } catch { fail(f + " bad JSON-LD"); }
}
for (const [, u] of fs.readFileSync("dist/sitemap.xml", "utf8").matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)) if (!fs.existsSync(path.join("dist", u.endsWith("/") ? u + "index.html" : u))) fail("sitemap url missing " + u);
for (const f of ["engine.js", "lib.js"]) try { new Function(fs.readFileSync("dist/" + f, "utf8")); } catch (e) { fail(f + " syntax " + e.message); }
const P = require("./src/lib.js"), pdf = Buffer.from(P.pdf([{ jpeg: new Uint8Array([255, 216, 255, 217]), w: 1, h: 1, pw: 10, ph: 10, dw: 10, dh: 10, x: 0, y: 0 }])).toString("latin1");
const xr = +pdf.match(/startxref\n(\d+)/)[1]; if (!pdf.slice(xr).startsWith("xref")) fail("pdf xref");
if (P.crc(Buffer.from("123456789")) !== 0xcbf43926) fail("crc");
console.log(bad ? `${bad} failure(s)` : `All checks passed (${html.length} HTML pages)`); process.exit(bad ? 1 : 0);
