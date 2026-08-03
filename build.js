
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

async function build() {
  const result = await esbuild.build({
    entryPoints: ['src/main.js'],
    bundle: true,
    minify: true,
    write: false,
    target: ['es2018'],
  });

  const js = result.outputFiles[0].text;
  const template = fs.readFileSync(path.join('public', 'index.html'), 'utf8');

  // Inline the bundle in place of the external script tag.
  const html = template.replace(
    '<script src="game.js"></script>',
    () => `<script>\n${js}\n</script>`
  );

  fs.mkdirSync('dist', { recursive: true });
  const out = path.join('dist', 'index.html');
  fs.writeFileSync(out, html);

  const mb = (fs.statSync(out).size / (1024 * 1024)).toFixed(2);
  console.log(`Built ${out} — ${mb} MB (limit: 5 MB)`);
  if (mb >= 5) process.exitCode = 1;
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
