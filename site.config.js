// One place to rebrand the whole site. Env var SITE_URL overrides url at build time.
module.exports = {
  name: 'PixelTools',
  tagline: '100% Free Online Image Tools – Fast, Private & Secure',
  url: process.env.SITE_URL || 'https://example.com', // CHANGE: your real domain
  description:
    'Free online image compressor, resizer, converter, and PDF tool. 100% free with no sign-ups or watermarks. Everything runs securely inside your browser.',
  contactEmail: 'hello@example.com', // CHANGE: your real contact email
  legalName: 'PixelTools', // CHANGE: your name or company name for the legal pages
  social: {
    /* twitter: "https://x.com/yourhandle" */
  },
  theme: { accent: '#2563eb', ink: '#0f172a', bg: '#f8fafc' },
  adsensePublisherId: process.env.ADSENSE_ID || 'pub-XXXXXXXXXXXXXXXX', // CHANGE after AdSense approval
  analytics: { provider: 'none' },
  updated: '2026-10-05',
};
