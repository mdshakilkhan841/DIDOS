// Five real, visually distinct site templates shared by the React, Next.js and WordPress
// adapters. Each defines a palette, fonts, a bespoke hero layout and marketing sections.
// A template's identity is baked into the generated source at build time (not
// runtime-switchable) — this module is the single source of truth used both for the
// builder's live preview (iframe) and for the code the ZIP export actually ships.

export type SiteTemplate = {
  id: string;
  name: string;
  category: string;
  blurb: string;
  // Which of the hand-built hero shapes this template uses — drives the Template
  // Library's card thumbnail so it actually looks like the real layout, not a generic block.
  heroShape: 'split' | 'cover' | 'center' | 'mono' | 'badge';
  vars: Record<string, string>;
  headingFont: string;
  bodyFont: string;
  samplePages: string[];
  hero: (t: { NAME: string; CATEGORY: string; BRIEF: string }) => string;
  cards: { icon: string; title: string; text: string }[];
  cardsHeading: string;
  cta: { heading: string; text: string; button: string };
};

const esc = (s: string) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as any)[c]);

// Placeholder artwork, generated inline as a data URI.
//
// These used to hotlink https://picsum.photos. That silently produced a BROKEN
// hero on every generated site: the image failed with no console error and no
// failed-request entry, so a customer could publish a site with an empty hero
// and never be told. A generated deliverable must not depend on a third-party
// image host at render time.
//
// The replacement is deterministic, offline, weightless and palette-matched, so
// the preview a customer approves is exactly what ships. `tone` is the
// template's own [from, to] pair; the artwork reads as an intentional abstract
// backdrop rather than a missing asset.
//
// Everything outside a conservative allowlist is percent-encoded, because the
// same string has to survive BOTH `<img src="...">` (a double-quoted HTML
// attribute) and `url('...')` inside a `style="..."` attribute. An unencoded
// quote or `#` breaks one context or the other.
const dataUri = (svg: string) =>
  'data:image/svg+xml,' +
  svg.replace(/[^A-Za-z0-9\-._~:/?=,;()*+!$@]/g, (c) =>
    '%' + c.charCodeAt(0).toString(16).padStart(2, '0').toUpperCase());

const img = (seed: string, w: number, h: number, tone: [string, string] = ['rgb(24,36,42)', 'rgb(90,130,140)']) => {
  // Deterministic per seed: the same template always renders the same artwork,
  // so regenerating a project never silently changes its look.
  let n = 0;
  for (let i = 0; i < seed.length; i++) n = (n * 31 + seed.charCodeAt(i)) >>> 0;
  const pick = (i: number, lo: number, hi: number) => lo + ((n >>> (i * 3)) % 1000) / 1000 * (hi - lo);
  const [from, to] = tone;
  const r = Math.min(w, h);
  const circles = [0, 1, 2]
    .map((i) => `<circle cx="${(pick(i, 0.15, 0.9) * w).toFixed(0)}" cy="${(pick(i + 3, 0.1, 0.9) * h).toFixed(0)}" r="${(pick(i + 1, 0.18, 0.52) * r).toFixed(0)}"/>`)
    .join('');
  return dataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" role="presentation">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>` +
      `</linearGradient></defs>` +
      `<rect width="${w}" height="${h}" fill="url(#g)"/>` +
      `<g fill="none" stroke="${to}" stroke-opacity=".22" stroke-width="${Math.max(2, r / 90).toFixed(1)}">${circles}</g>` +
      `<g fill="${from}" fill-opacity=".28"><circle cx="${(pick(6, 0.2, 0.8) * w).toFixed(0)}" cy="${(pick(7, 0.2, 0.8) * h).toFixed(0)}" r="${(r * 0.3).toFixed(0)}"/></g>` +
      `</svg>`,
  );
};

export const SITE_TEMPLATES: SiteTemplate[] = [
  {
    id: 'harbor',
    name: 'Harbor',
    category: 'Business services',
    blurb: 'Confident split-hero layout for consultancies and B2B service providers.',
    heroShape: 'split',
    vars: { bg: '#0b2f3a', surface: '#123f4d', card: '#154a5a', text: '#eaf5f7', muted: '#a9c7cf', accent: '#22c3ae', accentText: '#04211d', border: '#1d5666' },
    headingFont: "'Georgia', 'Times New Roman', serif",
    bodyFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    samplePages: ['Home', 'Services', 'About', 'Contact'],
    hero: ({ NAME, CATEGORY, BRIEF }) => `<section class="hero hero-split">
  <div class="hero-copy"><p class="eyebrow">${esc(CATEGORY)}</p><h1>${esc(NAME)}</h1><p class="lede">${esc(BRIEF)}</p>
  <div class="hero-actions"><a class="btn btn-primary" href="#contact">Talk to us</a><a class="btn btn-ghost" href="#services">See services</a></div></div>
  <div class="hero-media"><img src="${img('harbor-hero', 900, 760, ['rgb(18,63,77)', 'rgb(34,195,174)'])}" alt="" loading="lazy"/></div>
</section>`,
    cardsHeading: 'What we deliver',
    cards: [
      { icon: '🧭', title: 'Discovery & strategy', text: 'We map your operations before proposing a single line of scope.' },
      { icon: '🛠️', title: 'Delivery & build', text: 'Fixed-scope engagements with clear milestones and weekly review.' },
      { icon: '📈', title: 'Ongoing support', text: 'A named contact and response-time commitment after launch.' },
    ],
    cta: { heading: 'Ready to scope your project?', text: 'Tell us about your goals and current systems — no obligation.', button: 'Start a conversation' },
  },
  {
    id: 'ember-kitchen',
    name: 'Ember Kitchen',
    category: 'Restaurant',
    blurb: 'Warm, image-forward hero for restaurants and cafés.',
    heroShape: 'cover',
    vars: { bg: '#241512', surface: '#341e19', card: '#3d241d', text: '#f7ece4', muted: '#cbaa96', accent: '#e08a3c', accentText: '#2a1608', border: '#4a2c22' },
    headingFont: "'Georgia', 'Palatino Linotype', serif",
    bodyFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    samplePages: ['Home', 'Menu', 'Our story', 'Reservations', 'Contact'],
    hero: ({ NAME, CATEGORY, BRIEF }) => `<section class="hero hero-cover" style="background-image:linear-gradient(180deg,rgba(20,10,8,.35),rgba(20,10,8,.85)),url('${img('ember-hero', 1600, 900, ['rgb(52,30,25)', 'rgb(224,138,60)'])}')">
  <p class="eyebrow">${esc(CATEGORY)}</p><h1>${esc(NAME)}</h1><p class="lede">${esc(BRIEF)}</p>
  <div class="hero-actions"><a class="btn btn-primary" href="#reserve">Reserve a table</a><a class="btn btn-ghost" href="#menu">View menu</a></div>
</section>`,
    cardsHeading: 'From the kitchen',
    cards: [
      { icon: '🍲', title: 'Seasonal menu', text: 'Dishes change with what is fresh; ask about today’s specials.' },
      { icon: '🍷', title: 'Pairings', text: 'A short, considered list chosen to match the menu.' },
      { icon: '🎉', title: 'Private events', text: 'Book the dining room for groups of up to 40.' },
    ],
    cta: { heading: 'Reserve your table', text: 'Walk-ins welcome; reservations recommended on weekends.', button: 'Book now' },
  },
  {
    id: 'fresh-press',
    name: 'Fresh Press',
    category: 'Laundry',
    blurb: 'Crisp, minimal layout for laundry, cleaning and home-service businesses.',
    heroShape: 'center',
    vars: { bg: '#eaf6fb', surface: '#ffffff', card: '#f2fafd', text: '#0f2733', muted: '#4d6b78', accent: '#1c7fd1', accentText: '#ffffff', border: '#cfe6ef' },
    headingFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    bodyFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    samplePages: ['Home', 'Services', 'Pricing', 'Pickup & delivery', 'Contact'],
    hero: ({ NAME, CATEGORY, BRIEF }) => `<section class="hero hero-center">
  <p class="eyebrow">${esc(CATEGORY)}</p><h1>${esc(NAME)}</h1><p class="lede">${esc(BRIEF)}</p>
  <div class="hero-actions"><a class="btn btn-primary" href="#pickup">Book a pickup</a><a class="btn btn-ghost" href="#services">See pricing</a></div>
  <div class="hero-strip"><span>🧺 Wash &amp; fold</span><span>🧥 Dry cleaning</span><span>🧵 Ironing &amp; repairs</span><span>🚚 Free pickup</span></div>
</section>`,
    cardsHeading: 'Services & pricing',
    cards: [
      { icon: '🧺', title: 'Wash & fold', text: 'Priced per kilogram, returned within 24 hours.' },
      { icon: '🧥', title: 'Dry cleaning', text: 'Garment-safe cleaning for formal and delicate wear.' },
      { icon: '🚚', title: 'Pickup & delivery', text: 'Free collection and drop-off across the service area.' },
    ],
    cta: { heading: 'Book your first pickup', text: 'Same-day slots available on weekdays.', button: 'Schedule pickup' },
  },
  {
    id: 'atelier',
    name: 'Atelier',
    category: 'Portfolio',
    blurb: 'Bold, oversized typography for portfolios, studios and freelancers.',
    heroShape: 'mono',
    vars: { bg: '#0e0e10', surface: '#19191c', card: '#212124', text: '#f4f2ee', muted: '#9c9a95', accent: '#d4b483', accentText: '#211a0d', border: '#2c2c30' },
    headingFont: "'Georgia', 'Times New Roman', serif",
    bodyFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    samplePages: ['Home', 'Work', 'About', 'Contact'],
    hero: ({ NAME, CATEGORY, BRIEF }) => `<section class="hero hero-mono">
  <p class="eyebrow">${esc(CATEGORY)}</p><h1>${esc(NAME)}</h1><p class="lede">${esc(BRIEF)}</p>
  <div class="hero-actions"><a class="btn btn-primary" href="#work">View work</a><a class="btn btn-ghost" href="#contact">Get in touch</a></div>
</section>
<section class="gallery"><img src="${img('atelier-1', 700, 520, ['rgb(25,25,28)', 'rgb(212,180,131)'])}" alt=""/><img src="${img('atelier-2', 700, 520, ['rgb(25,25,28)', 'rgb(212,180,131)'])}" alt=""/><img src="${img('atelier-3', 700, 520, ['rgb(25,25,28)', 'rgb(212,180,131)'])}" alt=""/></section>`,
    cardsHeading: 'Selected work',
    cards: [
      { icon: '◆', title: 'Brand identity', text: 'Logo systems, type pairing and brand guidelines.' },
      { icon: '◆', title: 'Digital product', text: 'Interfaces for web and mobile, from concept to handoff.' },
      { icon: '◆', title: 'Art direction', text: 'Campaign concepts and visual direction for launches.' },
    ],
    cta: { heading: 'Have a project in mind?', text: 'Currently booking new work for next quarter.', button: 'Start a project' },
  },
  {
    id: 'brightline-academy',
    name: 'Brightline Academy',
    category: 'Education',
    blurb: 'Optimistic, structured layout for schools, courses and training providers.',
    heroShape: 'badge',
    vars: { bg: '#1c1f4a', surface: '#262a5e', card: '#2d316d', text: '#f2f3fb', muted: '#b7bbe6', accent: '#ffd166', accentText: '#241c02', border: '#383c7e' },
    headingFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    bodyFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    samplePages: ['Home', 'Programs', 'Admissions', 'Contact'],
    hero: ({ NAME, CATEGORY, BRIEF }) => `<section class="hero hero-badge">
  <p class="eyebrow">${esc(CATEGORY)}</p><h1>${esc(NAME)}</h1><p class="lede">${esc(BRIEF)}</p>
  <div class="hero-actions"><a class="btn btn-primary" href="#enroll">Enroll now</a><a class="btn btn-ghost" href="#programs">Browse programs</a></div>
  <div class="hero-stats"><div><strong>12+</strong><span>programs</span></div><div><strong>500+</strong><span>graduates</span></div><div><strong>4.8/5</strong><span>learner rating</span></div></div>
</section>`,
    cardsHeading: 'Popular programs',
    cards: [
      { icon: '🎓', title: 'Foundations track', text: 'A guided starting point for new learners.' },
      { icon: '💻', title: 'Applied skills', text: 'Project-based courses aligned to real work.' },
      { icon: '🧑‍🏫', title: 'Mentored cohorts', text: 'Small groups with a dedicated mentor.' },
    ],
    cta: { heading: 'Enrollment is open', text: 'Next cohort starts soon; seats are limited.', button: 'Reserve a seat' },
  },
  {
    id: 'vault-advisory',
    name: 'Vault Advisory',
    category: 'Finance & Insurance',
    blurb: 'Confident, trust-forward layout for financial advisors and wealth managers.',
    heroShape: 'badge',
    vars: { bg: '#0a1a2f', surface: '#102640', card: '#14304f', text: '#eef3f8', muted: '#a9bdd1', accent: '#c9a227', accentText: '#241c02', border: '#1c3a5c' },
    headingFont: "'Georgia', 'Times New Roman', serif",
    bodyFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    samplePages: ['Home', 'Services', 'Insights', 'About', 'Contact'],
    hero: ({ NAME, CATEGORY, BRIEF }) => `<section class="hero hero-badge">
  <p class="eyebrow">${esc(CATEGORY)}</p><h1>${esc(NAME)}</h1><p class="lede">${esc(BRIEF)}</p>
  <div class="hero-actions"><a class="btn btn-primary" href="#contact">Schedule a consultation</a><a class="btn btn-ghost" href="#services">Explore services</a></div>
  <div class="hero-stats"><div><strong>15+</strong><span>years advising</span></div><div><strong>$400M+</strong><span>assets guided</span></div><div><strong>98%</strong><span>client retention</span></div></div>
</section>`,
    cardsHeading: 'Where we help',
    cards: [
      { icon: '📈', title: 'Investment planning', text: 'A diversified strategy built around your timeline and risk tolerance.' },
      { icon: '🏦', title: 'Wealth management', text: 'Ongoing portfolio oversight with quarterly reviews and rebalancing.' },
      { icon: '🛡️', title: 'Retirement planning', text: 'A clear income plan so your savings last as long as you need them to.' },
    ],
    cta: { heading: 'Ready to plan your future?', text: 'Book a no-obligation consultation with an advisor.', button: 'Schedule a consultation' },
  },
  {
    id: 'momentum-events',
    name: 'Momentum Events',
    category: 'Events & community',
    blurb: 'Elegant, story-led layout for event planners and experience designers.',
    heroShape: 'cover',
    vars: { bg: '#1f1425', surface: '#2a1b32', card: '#33213c', text: '#f6eef8', muted: '#c3aecb', accent: '#e0a458', accentText: '#2a1608', border: '#3c2745' },
    headingFont: "'Georgia', 'Palatino Linotype', serif",
    bodyFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    samplePages: ['Home', 'Services', 'Portfolio', 'Testimonials', 'Contact'],
    hero: ({ NAME, CATEGORY, BRIEF }) => `<section class="hero hero-cover" style="background-image:linear-gradient(180deg,rgba(20,10,25,.35),rgba(20,10,25,.85)),url('${img('events-hero', 1600, 900, ['rgb(42,27,50)', 'rgb(224,164,88)'])}')">
  <p class="eyebrow">${esc(CATEGORY)}</p><h1>${esc(NAME)}</h1><p class="lede">${esc(BRIEF)}</p>
  <div class="hero-actions"><a class="btn btn-primary" href="#contact">Start planning</a><a class="btn btn-ghost" href="#services">See our work</a></div>
</section>`,
    cardsHeading: 'What we plan',
    cards: [
      { icon: '🎤', title: 'Corporate events', text: 'Conferences, product launches and team gatherings, planned end to end.' },
      { icon: '💍', title: 'Weddings & celebrations', text: 'From intimate ceremonies to full-scale celebrations.' },
      { icon: '🎪', title: 'Conferences & summits', text: 'Venue, logistics and run-of-show handled by one team.' },
    ],
    cta: { heading: 'Let’s plan your next event', text: 'Tell us the date and the vision — we handle the rest.', button: 'Start planning' },
  },
  {
    id: 'crest-realty',
    name: 'Crest Realty',
    category: 'Real estate',
    blurb: 'Warm, image-forward layout for real estate agents and property managers.',
    heroShape: 'split',
    vars: { bg: '#f7f5f0', surface: '#ffffff', card: '#f1ede4', text: '#241f19', muted: '#6b6154', accent: '#2f4a3c', accentText: '#ffffff', border: '#e2dccc' },
    headingFont: "'Georgia', 'Times New Roman', serif",
    bodyFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    samplePages: ['Home', 'Listings', 'About', 'Contact'],
    hero: ({ NAME, CATEGORY, BRIEF }) => `<section class="hero hero-split">
  <div class="hero-copy"><p class="eyebrow">${esc(CATEGORY)}</p><h1>${esc(NAME)}</h1><p class="lede">${esc(BRIEF)}</p>
  <div class="hero-actions"><a class="btn btn-primary" href="#contact">Book a viewing</a><a class="btn btn-ghost" href="#listings">View listings</a></div></div>
  <div class="hero-media"><img src="${img('realty-hero', 900, 760, ['rgb(241,237,228)', 'rgb(47,74,60)'])}" alt="" loading="lazy"/></div>
</section>`,
    cardsHeading: 'What we offer',
    cards: [
      { icon: '🏡', title: 'Residential sales', text: 'Buying or selling, guided by an agent who knows the local market.' },
      { icon: '🏙️', title: 'Luxury listings', text: 'A curated portfolio of premium properties, professionally staged.' },
      { icon: '🔑', title: 'Property management', text: 'Tenant screening, maintenance and rent collection, handled for you.' },
    ],
    cta: { heading: 'Find your next home', text: 'Browse current listings or tell us what you are looking for.', button: 'View listings' },
  },
];

export function findTemplate(id: string): SiteTemplate {
  return SITE_TEMPLATES.find((t) => t.id === id) || SITE_TEMPLATES[0];
}

// Visual-direction accent overlays applied on top of a template's real layout —
// the layout (hero markup, cards, cta) stays the template's own; only the accent
// color pair changes. Used by the Template Library so its "style" axis is a real,
// rendered difference rather than a label with no effect on the generated site.
export type TemplateStyle = 'ocean' | 'midnight' | 'ember' | 'teal';

export const STYLE_ACCENTS: Record<TemplateStyle, { accent: string; accentText: string }> = {
  ocean: { accent: '#1c9fd1', accentText: '#04202b' },
  midnight: { accent: '#5b5fe0', accentText: '#0d0e2b' },
  ember: { accent: '#e0793c', accentText: '#2a1608' },
  teal: { accent: '#12b3a0', accentText: '#04211d' },
};

export function applyStyle(template: SiteTemplate, style: TemplateStyle): SiteTemplate {
  const a = STYLE_ACCENTS[style] || STYLE_ACCENTS.ocean;
  return { ...template, vars: { ...template.vars, accent: a.accent, accentText: a.accentText } };
}

const baseCss = (v: Record<string, string>, headingFont: string, bodyFont: string) => `
:root{--bg:${v.bg};--surface:${v.surface};--card:${v.card};--text:${v.text};--muted:${v.muted};--accent:${v.accent};--accent-text:${v.accentText};--border:${v.border}}
.dtpl{background:var(--bg);color:var(--text);font-family:${bodyFont}}
.dtpl h1,.dtpl h2,.dtpl h3{font-family:${headingFont};line-height:1.1;margin:0 0 .4em}
.dtpl .eyebrow{text-transform:uppercase;letter-spacing:.14em;font-size:.78rem;color:var(--accent);margin:0 0 .6em;font-weight:600}
.dtpl .lede{color:var(--muted);font-size:1.15rem;max-width:640px;margin:0 0 1.6em}
.dtpl .btn{display:inline-block;padding:12px 22px;border-radius:8px;font-weight:600;text-decoration:none;margin:0 10px 10px 0}
.dtpl .btn-primary{background:var(--accent);color:var(--accent-text)}
.dtpl .btn-ghost{border:1px solid var(--border);color:var(--text)}
.dtpl .hero{padding:min(11vw,88px) max(5vw,24px);max-width:1180px;margin:0 auto}
.dtpl .hero h1{font-size:clamp(34px,6vw,64px)}
.dtpl .hero-split{display:grid;grid-template-columns:1.1fr 1fr;gap:48px;align-items:center}
.dtpl .hero-split .hero-media img{width:100%;border-radius:18px;display:block}
.dtpl .hero-cover{text-align:center;background-size:cover;background-position:center;padding-top:min(16vw,140px);padding-bottom:min(16vw,140px)}
.dtpl .hero-center{text-align:center}
.dtpl .hero-center .lede{margin-left:auto;margin-right:auto}
.dtpl .hero-strip{display:flex;flex-wrap:wrap;justify-content:center;gap:14px;margin-top:28px;color:var(--muted);font-size:.95rem}
.dtpl .hero-mono h1{font-size:clamp(44px,9vw,96px);letter-spacing:-.02em}
.dtpl .gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;max-width:1180px;margin:0 auto 40px;padding:0 max(5vw,24px)}
.dtpl .gallery img{width:100%;height:100%;object-fit:cover;border-radius:10px;display:block}
.dtpl .hero-badge{text-align:center}
.dtpl .hero-badge .lede{margin-left:auto;margin-right:auto}
.dtpl .hero-stats{display:flex;justify-content:center;gap:40px;margin-top:32px}
.dtpl .hero-stats strong{display:block;font-size:1.6rem}
.dtpl .hero-stats span{color:var(--muted);font-size:.85rem}
.dtpl .cards{max-width:1180px;margin:0 auto;padding:20px max(5vw,24px) min(9vw,72px)}
.dtpl .cards h2{font-size:clamp(24px,3.4vw,34px);margin-bottom:28px}
.dtpl .card-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:20px}
.dtpl .card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:24px}
.dtpl .card .icon{font-size:1.6rem;margin-bottom:10px;display:block}
.dtpl .card h3{font-size:1.05rem}
.dtpl .card p{color:var(--muted);margin:0;font-size:.95rem}
.dtpl .cta{background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:min(8vw,64px) max(5vw,24px);text-align:center}
.dtpl .cta h2{font-size:clamp(22px,3vw,32px)}
.dtpl .cta p{color:var(--muted);max-width:520px;margin:0 auto 20px}
@media(max-width:820px){.dtpl .hero-split{grid-template-columns:1fr}.dtpl .gallery{grid-template-columns:1fr 1fr}}
`;

export function renderMarketingHtml(template: SiteTemplate, project: { name: string; category: string; brief: string }) {
  const t = { NAME: project.name || template.name, CATEGORY: project.category || template.category, BRIEF: project.brief || template.blurb };
  const cards = template.cards
    .map((c) => `<div class="card"><span class="icon">${c.icon}</span><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></div>`)
    .join('');
  const html = `<div class="dtpl">
${template.hero(t)}
<section class="cards"><h2>${esc(template.cardsHeading)}</h2><div class="card-grid">${cards}</div></section>
<section class="cta"><h2>${esc(template.cta.heading)}</h2><p>${esc(template.cta.text)}</p><a class="btn btn-primary" href="#contact">${esc(template.cta.button)}</a></section>
</div>`;
  const css = baseCss(template.vars, template.headingFont, template.bodyFont);
  return { html, css };
}

export function renderPreviewDocument(template: SiteTemplate, project: { name: string; category: string; brief: string }) {
  const { html, css } = renderMarketingHtml(template, project);
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}body{margin:0}${css}</style></head><body>${html}</body></html>`;
}

const staticChromeCss = `
body{background:var(--bg);color:var(--text)}
.static-nav{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;padding:20px max(5vw,24px);background:var(--surface);border-bottom:1px solid var(--border)}
.static-nav .brand{font-weight:700;font-size:1.1rem;color:var(--text);text-decoration:none}
.static-nav nav{display:flex;gap:20px;flex-wrap:wrap}
.static-nav nav a{color:var(--text);text-decoration:none;opacity:.85}
.static-nav nav a:hover,.static-nav nav a.active{opacity:1;text-decoration:underline}
.static-page{max-width:820px;margin:0 auto;padding:min(9vw,72px) max(5vw,24px)}
.static-page h1{font-size:clamp(30px,5vw,52px)}
.static-body{white-space:pre-wrap;color:var(--text);font-size:1.05rem;line-height:1.7}
.static-contact-note{margin-top:28px;padding:18px 20px;border:1px dashed var(--border);border-radius:10px;color:var(--muted);font-size:.92rem}
.static-footer{padding:28px max(5vw,24px);border-top:1px solid var(--border);color:var(--muted);display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
.static-footer .static-social{display:flex;gap:16px}
.static-footer a{color:var(--accent)}
`;

// A fully static, dependency-free multi-page export: one flat .html file per
// page plus a single shared style.css. No server, database, build step or
// JavaScript framework — suitable for any plain web host or static file storage.
export function renderStaticSite(
  template: SiteTemplate,
  project: { name: string; category: string; brief: string; domain: string; video?: string; social?: Record<string, string> },
  pages: { slug: string; title: string; body: string }[]
): Record<string, string> {
  const fileFor = (slug: string) => (slug === 'home' ? 'index' : slug) + '.html';
  const navLinks = (activeSlug: string) =>
    pages.map((p) => `<a href="${fileFor(p.slug)}"${p.slug === activeSlug ? ' class="active"' : ''}>${esc(p.title)}</a>`).join('');
  const socialLinks = Object.entries(project.social || {})
    .filter(([, v]) => v)
    .map(([k, v]) => `<a href="${esc(String(v))}" rel="noreferrer">${esc(k)}</a>`)
    .join('');
  const footer = `<footer class="static-footer"><p>${esc(project.name)} · ${esc(project.domain)}</p><div class="static-social">${socialLinks}</div></footer>`;

  const files: Record<string, string> = {};
  for (const page of pages) {
    const isHome = page.slug === 'home';
    const header = `<header class="static-nav"><a href="index.html" class="brand">${esc(project.name)}</a><nav>${navLinks(page.slug)}</nav></header>`;
    const main = isHome
      ? renderMarketingHtml(template, project).html
      : `<div class="dtpl"><main class="static-page"><p class="eyebrow">${esc(project.category)}</p><h1>${esc(page.title)}</h1><p class="static-body">${esc(page.body)}</p>${
          page.slug === 'contact'
            ? `<div class="static-contact-note">This is a static export with no backend, so there is no working contact form yet. Add one with a free static-form service (for example Formspree or Netlify Forms) and paste its embed code here — or list an email/phone number directly on this page.</div>`
            : ''
        }${project.video && isHome ? '' : ''}</main></div>`;
    files[fileFor(page.slug)] = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(page.title)} — ${esc(project.name)}</title><link rel="stylesheet" href="style.css"></head><body>${header}${main}${footer}</body></html>`;
  }
  files['style.css'] = `*{box-sizing:border-box}body{margin:0}${baseCss(template.vars, template.headingFont, template.bodyFont)}${staticChromeCss}`;
  return files;
}
