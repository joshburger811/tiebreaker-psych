// Gives site.css and site.js a content-based name (site.<hash>.css) and points every page at it.
// Run after changing either file:  npm run version-assets
// Browsers keep these files for a year, so the name must change whenever the content does.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, renameSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SITE = new URL('../site/', import.meta.url).pathname;
const ASSETS = [['assets/css', 'css'], ['assets/js', 'js']];

const htmlFiles = (dir) => readdirSync(dir).flatMap((name) => {
  const p = join(dir, name);
  if (statSync(p).isDirectory()) return htmlFiles(p);
  return name.endsWith('.html') ? [p] : [];
});
const pages = htmlFiles(SITE);

for (const [dir, ext] of ASSETS) {
  const pattern = new RegExp(`^site(\\.[0-9a-f]{8})?\\.${ext}$`);
  const files = readdirSync(join(SITE, dir)).filter((f) => pattern.test(f));
  if (files.length !== 1) throw new Error(`Expected one site*.${ext} in ${dir}, found: ${files.join(', ') || 'none'}`);
  const current = files[0];
  const hash = createHash('sha256').update(readFileSync(join(SITE, dir, current))).digest('hex').slice(0, 8);
  const next = `site.${hash}.${ext}`;
  if (current !== next) renameSync(join(SITE, dir, current), join(SITE, dir, next));
  const ref = new RegExp(`/${dir}/site(\\.[0-9a-f]{8})?\\.${ext}`, 'g');
  let changed = 0;
  for (const page of pages) {
    const html = readFileSync(page, 'utf8');
    const updated = html.replace(ref, `/${dir}/${next}`);
    if (updated !== html) { writeFileSync(page, updated); changed++; }
  }
  console.log(`${dir}/${next} (${current === next ? 'unchanged' : `was ${current}`}), ${changed} pages updated`);
}
