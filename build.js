// Static site generator. Run: node build.js   (no dependencies)
const fs = require('fs'),
  path = require('path');
const site = require('./site.config.js'),
  tools = require('./tools.config.js'),
  guides = require('./guides.config.js');
const esc = (s) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])
  );
const OUT = 'dist',
  pages = [],
  bySlug = Object.fromEntries(tools.map((t) => [t.slug, t]));
const MODES = ['compress', 'resize', 'convert', 'pdf'];
for (const t of tools) {
  if (!MODES.includes(t.mode))
    throw new Error(`${t.slug}: unknown mode ${t.mode}`);
  for (const r of t.related)
    if (!bySlug[r]) throw new Error(`${t.slug}: unknown related tool ${r}`);
  for (const g of t.guides)
    if (!guides.find((x) => x.slug === g))
      throw new Error(`${t.slug}: unknown guide ${g}`);
}
const write = (rel, content) => {
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, content);
};
const abs = (p) => site.url.replace(/\/$/, '') + p;
const nav = [
  ['/', 'Home'],
  ['/compress-image/', 'Compress'],
  ['/resize-image/', 'Resize'],
  ['/convert-image/', 'Convert'],
  ['/image-to-pdf/', 'Image to PDF'],
  ['/guides/', 'Guides'],
];
const legal = [
  ['/about/', 'About'],
  ['/contact/', 'Contact'],
  ['/privacy-policy/', 'Privacy Policy'],
  ['/terms/', 'Terms'],
  ['/cookie-policy/', 'Cookie Policy'],
  ['/disclaimer/', 'Disclaimer'],
];
const li = (a) =>
  a.map(([h, n]) => `<li><a href="${h}">${esc(n)}</a></li>`).join('');
const cats = [...new Set(tools.map((t) => t.category))].filter(
  (c) => c !== 'Compress & resize'
);
const toolCards = (list) =>
  `<ul class="grid">${list
    .map(
      (t) =>
        `<li><a class="card" href="/${t.slug}/"><strong>${esc(           t.name         )}</strong><span>${esc(t.description)}</span></a></li>`
    )
    .join('')}</ul>`;
const faqHtml = (f) =>
  f
    .map(
      ([q, a]) =>
        `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`
    )
    .join('');

function layout({
  title,
  desc,
  path: p,
  body,
  ld = [],
  tool = false,
  index = true,
}) {
  const url = abs(p),
    t = esc(title);
  if (index) pages.push(p);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${t}</title><meta name="description" content="${esc(
    desc
  )}"><link rel="canonical" href="${url}">${
    index ? '' : '<meta name="robots" content="noindex">'
  }
<meta name="theme-color" content="${
    site.theme.accent
  }"><link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%232457F5'/%3E%3Crect x='7' y='7' width='8' height='8' fill='white'/%3E%3Crect x='17' y='17' width='8' height='8' fill='white'/%3E%3C/svg%3E">
<meta property="og:type" content="website"><meta property="og:site_name" content="${esc(
    site.name
  )}"><meta property="og:title" content="${t}"><meta property="og:description" content="${esc(
    desc
  )}"><meta property="og:url" content="${url}">
<meta name="twitter:card" content="summary"><meta name="twitter:title" content="${t}"><meta name="twitter:description" content="${esc(
    desc
  )}">
<link rel="stylesheet" href="/style.css">${ld
    .map(
      (o) =>
        `<script type="application/ld+json">${JSON.stringify(o).replace(
          /</g,
          '\\u003c'
        )}</script>`
    )
    .join('')}</head><body>
<a class="skip" href="#main">Skip to content</a>
<header class="site"><div class="wrap"><a class="logo" href="/">Pixel<b>Tools</b></a><nav aria-label="Main"><ul>${li(
    nav
  )}</ul></nav></div></header>
<main id="main" class="wrap">${body}</main>
<footer class="site"><div class="wrap"><div class="cols"><div><strong>${esc(
    site.name
  )}</strong><p>${esc(
    site.tagline
  )}.</p></div><div><strong>Tools</strong><ul>${tools
    .map((x) => `<li><a href="/${x.slug}/">${esc(x.name)}</a></li>`)
    .join('')}</ul></div><div><strong>Company</strong><ul>${li(
    legal
  )}</ul></div></div><p>© ${new Date().getFullYear()} ${esc(
    site.legalName
  )}</p></div></footer>
${
  tool
    ? '<script src="/lib.js" defer></script><script src="/engine.js" defer></script>'
    : ''
}<script>window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };</script><script defer src="/_vercel/insights/script.js"></script></body></html>`.replace(
    'Pixel<b>Tools</b>',
    esc(site.name).replace(/^(Pixel)(.*)$/, '$1<b>$2</b>')
  );
}

// Home (Hero section removed)
write(
  'index.html',
  layout({
    title: `${site.name} – ${site.tagline}`,
    desc: site.description,
    path: '/',
    ld: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: site.name,
        url: abs('/'),
      },
    ],
    body: `<h2>Popular tools</h2>${toolCards(
      ['compress-image', 'resize-image', 'convert-image', 'image-to-pdf'].map(
        (s) => bySlug[s]
      )
    )}
${cats
  .map(
    (c) =>
      `<h2>${esc(c)}</h2>${toolCards(
        tools.filter((t) => t.category === c)
      )}`
  )
  .join('')}
<h2>Why use ${esc(
      site.name
    )}</h2><div class="prose"><ul><li><strong>Private:</strong> images are decoded, processed and saved by your browser. They are not sent to our server.</li><li><strong>Fast:</strong> no upload or download wait; speed depends on your device.</li><li><strong>Free:</strong> no sign-up, no watermark.</li></ul></div>
<h2>How it works</h2><ol class="prose"><li>Choose images or drop them on the page.</li><li>Pick your options and press the action button.</li><li>Download each file, or all as a zip.</li></ol>
<h2>Guides</h2><ul class="grid">${guides
      .map(
        (g) =>
          `<li><a class="card" href="/guides/${g.slug}/"><strong>${esc(             g.title           )}</strong><span>${esc(g.desc)}</span></a></li>`
      )
      .join('')}</ul>
<h2>Frequently asked questions</h2>${faqHtml([
      [
        'Are my images uploaded?',
        'No. Processing happens in your browser. The page loads once; your files stay on your device.',
      ],
      [
        'Which formats work?',
        'Inputs: JPG, PNG and WebP. Outputs: JPG, PNG, WebP, and PDF for the image to PDF tool.',
      ],
      [
        'Is there a file size limit?',
        '50 MB per image and 40 megapixels. Large images need a lot of memory on phones.',
      ],
    ])}`,
  })
);

const common = [
  [
    'Are my images uploaded to a server?',
    'No. This tool reads and processes your files inside your browser using built-in browser features. Nothing is sent to our servers, and nothing is stored after you close the page.',
  ],
  [
    'What are the limits?',
    'Up to 100 files, 50 MB and 40 megapixels per image. JPG, PNG and WebP are accepted.',
  ],
];
for (const t of tools) {
  const p = `/${t.slug}/`,
    faq = [...t.faq, ...common];
  const rel = t.related.map((s) => bySlug[s]),
    gs = t.guides.map((s) => guides.find((g) => g.slug === s));
  write(
    `${t.slug}/index.html`,
    layout({
      title: t.seoTitle,
      desc: t.metaDescription,
      path: p,
      tool: true,
      ld: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: t.name,
          url: abs(p),
          description: t.metaDescription,
          applicationCategory: 'MultimediaApplication',
          operatingSystem: 'Any (modern web browser)',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faq.map(([q, a]) => ({
            '@type': 'Question',
            name: q,
            acceptedAnswer: { '@type': 'Answer', text: a },
          })),
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: abs('/') },
            { '@type': 'ListItem', position: 2, name: t.name, item: abs(p) },
          ],
        },
      ],
      body: `<p class="crumbs"><a href="/">Home</a> / ${esc(
        t.name
      )}</p><h1>${esc(t.h1)}</h1><p class="prose">${esc(t.intro)}</p>
<div id="tool" data-mode="${t.mode}" data-out="${
        t.out || ''
      }" data-in="${t.in}" data-action="${esc(t.action)}">
<div id="drop"><p><strong>Drop images here</strong></p><p>JPG, PNG or WebP</p><p><label class="btn" for="file">Choose images</label></p><input id="file" type="file" multiple accept="${
        t.in
      }"></div>
<noscript><p class="err">This tool needs JavaScript enabled.</p></noscript>
<div id="panel" class="box" hidden><div id="opts"></div><ul id="list" aria-label="Selected files"></ul><div class="ctl"><button id="go" type="button">${esc(
        t.action
      )}</button><button id="zip" type="button" class="ghost" hidden>Download all (zip)</button><button id="reset" type="button" class="ghost" hidden>Reset</button></div></div>
<div id="status" role="status" aria-live="polite"></div></div>
<h2>How to use it</h2><ol class="prose"><li>Add one or more images.</li><li>Adjust the options.</li><li>Press <strong>${esc(
        t.action
      )}</strong>${
        t.mode === 'pdf'
          ? ' and your PDF downloads'
          : ', then download your files'
      }.</li></ol>
<h2>Features</h2><ul class="prose">${t.features
        .map((f) => `<li>${esc(f)}</li>`)
        .join('')}</ul>
<h2>Privacy</h2><p class="prose">Your files stay in your browser. They are not uploaded, copied to a server or stored by ${esc(
        site.name
      )}. Details are in the <a href="/privacy-policy/">privacy policy</a>.</p>
<h2>Frequently asked questions</h2>${faqHtml(faq)}
<h2>Related tools</h2>${toolCards(
        rel
      )}<h2>Related guides</h2><ul class="prose">${gs
        .map((g) => `<li><a href="/guides/${g.slug}/">${esc(g.title)}</a></li>`)
        .join('')}</ul>`,
    })
  );
}

// Guides
write(
  'guides/index.html',
  layout({
    title: `Image Guides – ${site.name}`,
    desc: 'Practical guides on compressing, resizing and converting images.',
    path: '/guides/',
    body: `<p class="crumbs"><a href="/">Home</a> / Guides</p><h1>Guides</h1><ul class="grid">${guides
      .map(
        (g) =>
          `<li><a class="card" href="/guides/${g.slug}/"><strong>${esc(             g.title           )}</strong><span>${esc(g.desc)}</span></a></li>`
      )
      .join('')}</ul>`,
  })
);
for (const g of guides)
  write(
    `guides/${g.slug}/index.html`,
    layout({
      title: `${g.title} – ${site.name}`,
      desc: g.desc,
      path: `/guides/${g.slug}/`,
      ld: [
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: g.title,
          dateModified: site.updated,
          author: { '@type': 'Organization', name: site.name },
        },
      ],
      body: `<p class="crumbs"><a href="/">Home</a> / <a href="/guides/">Guides</a></p><article class="prose"><h1>${esc(
        g.title
      )}</h1>${g.body}<h2>Try the tools</h2><ul>${g.tools
        .map((s) => `<li><a href="/${s}/">${esc(bySlug[s].name)}</a></li>`)
        .join('')}</ul></article>`,
    })
  );

// Legal pages
const N = `<p class="note">Starter text, not legal advice. Have it reviewed for your country before relying on it.</p>`;
const L = {
  about: [
    'About',
    `<p>${esc(
      site.name
    )} offers free image tools that run in your browser: compress, resize, convert and combine images into PDFs.</p><p>We built it because most online image tools upload your files to a server. Here, processing happens on your device.</p><p>Questions or feedback? <a href="/contact/">Contact us</a>.</p>`,
  ],
  contact: [
    'Contact',
    `<p>For support, bug reports, privacy requests or business enquiries, email <a href="mailto:${esc(
      site.contactEmail
    )}">${esc(site.contactEmail)}</a>.</p><p>When reporting a bug, include your browser and device, the tool, and the file type.</p>`,
  ],
  'privacy-policy': [
    'Privacy Policy',
    `${N}<p>Last updated: ${site.updated}. Operator: ${esc(
      site.legalName
    )}.</p><h2>Your images</h2><p>Images you select are processed locally in your browser. They are not uploaded to our servers and we do not store them. Results exist only in your browser's memory until you download them or close the page.</p><h2>Data we collect</h2><p>This site does not require an account. Our hosting provider may keep standard server logs (IP address, requested page, time, browser) for security and operation. We do not use analytics tools unless this policy is updated to say so.</p><h2>Advertising</h2><p>If we show ads (for example Google AdSense), third-party vendors may use cookies to serve ads based on your visits to this and other sites, and will be described in our <a href="/cookie-policy/">cookie policy</a>. Where required, we ask for consent first. Ads never receive your images.</p><h2>Your rights</h2><p>Depending on where you live you may have rights to access, correct or delete personal data. Email <a href="mailto:${esc(
      site.contactEmail
    )}">${esc(site.contactEmail)}</a>.</p><h2>Children</h2><p>The site is not directed at children under 13.</p><h2>Changes</h2><p>We will update this page and its date when practices change.</p>`,
  ],
  terms: [
    'Terms of Use',
    `${N}<p>Last updated: ${site.updated}.</p><p>By using ${esc(
      site.name
    )} you agree to these terms.</p><h2>Use of the service</h2><p>Use the tools only with images you have the right to process. Do not misuse or attempt to disrupt the site.</p><h2>No warranty</h2><p>The service is provided "as is" without warranties. Output quality depends on your browser and files; keep your originals.</p><h2>Liability</h2><p>To the extent permitted by law, ${esc(
      site.legalName
    )} is not liable for losses arising from use of the site.</p><h2>Changes</h2><p>We may change the service or these terms at any time.</p>`,
  ],
  'cookie-policy': [
    'Cookie Policy',
    `${N}<p>Last updated: ${site.updated}.</p><p>${esc(
      site.name
    )} itself does not set cookies and does not use analytics. If advertising is added later, ad partners may set cookies or use similar technologies to show and measure ads. This page will then list them and a consent prompt will be added where required. You can block or delete cookies in your browser settings.</p>`,
  ],
  disclaimer: [
    'Disclaimer',
    `${N}<p>Tools are provided for general use. Converting or compressing images can change quality or metadata (such as EXIF location data, which is removed on re-encoding). Always keep a copy of your originals. Guides are informational. ${esc(
      site.legalName
    )} is not responsible for how you use processed files or for copyright in images you process.</p>`,
  ],
};
for (const [s, [h, b]] of Object.entries(L))
  write(
    `${s}/index.html`,
    layout({
      title: `${h} – ${site.name}`,
      desc: `${h} for ${site.name}.`,
      path: `/${s}/`,
      body: `<h1>${h}</h1><div class="prose">${b}</div>`,
    })
  );
write(
  '404.html',
  layout({
    title: `Page not found – ${site.name}`,
    desc: 'Page not found.',
    path: '/404.html',
    index: false,
    body: `<h1>Page not found</h1><p>Try one of our tools:</p>${toolCards(
      tools
    )}`,
  })
);

// Assets & SEO files
for (const f of ['style.css', 'engine.js', 'lib.js'])
  fs.copyFileSync(path.join('src', f), path.join(OUT, f));
const urls = pages.filter((p) => p !== '/404.html');
write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      (p) => `<url><loc>${abs(p)}</loc><lastmod>${site.updated}</lastmod></url>`
    )
    .join('\n')}\n</urlset>\n`
);
write(
  'robots.txt',
  `User-agent: *\nAllow: /\n\nSitemap: ${abs('/sitemap.xml')}\n`
);
write('ads.txt', `google.com, ${site.adsensePublisherId}, DIRECT, f08c47fec0942fa0\n`);
write(
  '_headers',
  `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: DENY\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  Content-Security-Policy: default-src 'self'; img-src 'self' blob: data:; style-src 'self'; script-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'\n`
);
console.log(`Built ${pages.length} pages into ${OUT}/`);
