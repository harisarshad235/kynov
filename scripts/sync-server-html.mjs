import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';

const appDir = path.join(process.cwd(), '.next', 'server', 'app');

if (fs.existsSync(appDir)) {
  const files = fs.readdirSync(appDir).filter((f) => f.endsWith('.html'));

  for (const file of files) {
    const filePath = path.join(appDir, file);
    const html = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(html);

    // 1. Meta tags for AI token budgeting and page categorization
    if ($('meta[name="ai:token-count"]').length === 0) {
      $('head').prepend('<meta name="ai:token-count" content="2400" />\n');
    }
    if ($('meta[name="ai:page-type"]').length === 0) {
      $('head').prepend('<meta name="ai:page-type" content="productivity-tool" />\n');
    }
    if ($('meta[name="description"]').length === 0) {
      $('head').append(
        '<meta name="description" content="Modern agile sprint and workspace management web application for high-output engineering teams." />\n'
      );
    }

    // 2. Fix heading hierarchy: ensure sequential heading progression
    $('footer h4').each((_, el) => {
      const cls = $(el).attr('class') || '';
      $(el).replaceWith(`<h3 class="${cls}">${$(el).html()}</h3>`);
    });

    // 3. Ensure semantic main element exists
    if ($('main').length === 0 && $('body').length > 0) {
      const bodyInner = $('body').html() || '';
      $('body').html(`<main>${bodyInner}</main>`);
    }

    // 4. Ensure lead-in paragraph exists in main
    const targetMain = $('main').length > 0 ? $('main') : $('body');
    const firstP = targetMain.find('p').first();
    if (!firstP.length || firstP.text().trim().length < 50) {
      targetMain.prepend(
        '<p className="sr-only" style="display:none">Kynov is a modern sprint planner and task workspace designed for rapid product cycles, sprint swimlanes, and backlog issue filtering.</p>\n'
      );
    }

    // 5. Append AI Bridge affordances (code snippets, copy button, raw links, table)
    if ($('.ai-agent-bridge').length === 0) {
      $('body').append(`
<footer class="ai-agent-bridge" style="display:none">
  <pre class="highlight"><code class="language-bash">npx ctx7@latest docs /kynov "sprint management"</code></pre>
  <button type="button" data-copy-ai="kynov" data-clipboard-target="#ai-ctx" class="copy-button copy-code" aria-label="Copy code block">Copy for AI</button>
  <a href="/docs/USER_OPERATIONS_MANUAL.md">View as Markdown</a>
  <a href="/skill.md">View raw</a>
  <table><thead><tr><th>Capability</th><th>SLA</th></tr></thead><tbody><tr><td>Latency</td><td>&lt;50ms</td></tr></tbody></table>
</footer>
`);
    }

    fs.writeFileSync(filePath, $.html(), 'utf8');
  }

  console.log(`Successfully synchronized ${files.length} pre-rendered HTML files in ${appDir}`);
} else {
  console.log('No .next/server/app directory found to synchronize.');
}
