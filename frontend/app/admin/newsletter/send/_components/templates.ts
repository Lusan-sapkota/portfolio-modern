const SITE = "https://lusansapkota.com.np";
const LOGO = `${SITE}/logo/logo.png`;

export type Template = {
  id: string;
  label: string;
  subject: string;
  html: string;
};

export const TEMPLATES: Template[] = [
  {
    id: "update",
    label: "Quick Update",
    subject: "Hey {name}, fresh updates inside",
    html: `<div style="text-align:center;padding:8px 0 20px"><img src="${LOGO}" alt="Lusan Sapkota" width="48" height="48" style="border-radius:12px"/></div>
<h1 style="font-family:Georgia,serif;color:#1a1a1a">Hey {name},</h1>
<p style="color:#2c2c2c;line-height:1.7">Quick update from the workshop -- a fresh batch of projects, a couple of new write-ups, and a small experiment I would love your take on.</p>
<p style="margin-top:24px"><a href="${SITE}" style="background:#1a1a1a;color:#fffdf5;padding:12px 24px;border-radius:9999px;text-decoration:none;font-weight:600">See what is new</a></p>
<p style="margin-top:24px;color:#6b5b54">-- Lusan</p>`,
  },
  {
    id: "launch",
    label: "Project Launch",
    subject: "Introducing a new project, {name}",
    html: `<div style="background:#006064;padding:32px 24px;border-radius:16px;text-align:center;color:#fffdf5;margin-bottom:24px">
  <img src="${LOGO}" alt="" width="40" height="40" style="border-radius:10px;margin-bottom:12px"/>
  <h1 style="font-family:Georgia,serif;font-size:28px;margin:0 0 8px">Just shipped something new</h1>
  <p style="margin:0;opacity:0.9">Months of building, finally public.</p>
</div>
<h2 style="font-family:Georgia,serif;color:#1a1a1a;margin-top:0">Hi {name},</h2>
<p style="color:#2c2c2c;line-height:1.7">I just released a new open source project and wanted you to be among the first to know.</p>
<p style="margin-top:20px"><a href="${SITE}" style="background:#d84315;color:#fffdf5;padding:14px 28px;border-radius:9999px;text-decoration:none;font-weight:600;font-size:14px">Explore the project</a></p>
<p style="margin-top:28px;color:#6b5b54">Appreciate your support,<br/>-- Lusan</p>`,
  },
  {
    id: "tutorial",
    label: "Tutorial Drop",
    subject: "New tutorial just dropped, {name}",
    html: `<div style="text-align:center;padding:8px 0 16px"><img src="${LOGO}" alt="" width="40" height="40" style="border-radius:10px"/></div>
<div style="border-left:5px solid #d84315;padding-left:20px;margin-bottom:20px">
  <p style="font-family:monospace;color:#d84315;margin:0;font-size:12px;letter-spacing:0.2em;text-transform:uppercase">Fresh tutorial</p>
</div>
<h1 style="font-family:Georgia,serif;color:#1a1a1a;font-size:24px">Build a real-time dashboard from scratch</h1>
<p style="color:#2c2c2c;line-height:1.7">Hey {name},</p>
<p style="color:#2c2c2c;line-height:1.7">I published a step-by-step walkthrough covering WebSocket architecture, state management patterns, and deployment on a VPS.</p>
<ul style="color:#2c2c2c;line-height:1.8;padding-left:18px">
  <li>Part 1: The WebSocket handshake and protocol decisions</li>
  <li>Part 2: React state management without Redux</li>
  <li>Part 3: Deploying with Docker, Nginx, and TLS</li>
</ul>
<p style="margin-top:20px"><a href="${SITE}" style="background:#1a1a1a;color:#fffdf5;padding:14px 28px;border-radius:9999px;text-decoration:none;font-weight:600;font-size:14px">Read the full tutorial</a></p>
<p style="margin-top:28px;color:#6b5b54">Happy coding,<br/>-- Lusan</p>`,
  },
  {
    id: "roundup",
    label: "Monthly Roundup",
    subject: "What I built this month, {name}",
    html: `<div style="text-align:center;padding:8px 0 16px"><img src="${LOGO}" alt="" width="40" height="40" style="border-radius:10px"/></div>
<h1 style="font-family:Georgia,serif;color:#1a1a1a;font-size:26px">Monthly roundup</h1>
<p style="color:#2c2c2c;line-height:1.7">Hey {name},</p>
<p style="color:#2c2c2c;line-height:1.7">Here is everything that shipped in the last few weeks -- posts, repos, and things you might have missed.</p>
<table style="width:100%;border-collapse:collapse;margin:20px 0">
  <tr style="border-bottom:1px solid #e0e0e0">
    <td style="padding:10px 8px;font-weight:600;color:#006064">Project</td>
    <td style="padding:10px 8px;color:#2c2c2c">GraphLab v2 -- interactive graph editor</td>
  </tr>
  <tr style="border-bottom:1px solid #e0e0e0">
    <td style="padding:10px 8px;font-weight:600;color:#d84315">Article</td>
    <td style="padding:10px 8px;color:#2c2c2c">Zero-downtime deploys with Docker Compose</td>
  </tr>
  <tr>
    <td style="padding:10px 8px;font-weight:600;color:#b07d5b">Talk</td>
    <td style="padding:10px 8px;color:#2c2c2c">Building editor UIs -- DevNepal Conf</td>
  </tr>
</table>
<p style="margin-top:20px"><a href="${SITE}" style="background:#006064;color:#fffdf5;padding:14px 28px;border-radius:9999px;text-decoration:none;font-weight:600;font-size:14px">Browse everything</a></p>
<p style="margin-top:28px;color:#6b5b54">Until next time,<br/>-- Lusan</p>`,
  },
  {
    id: "welcome",
    label: "Welcome",
    subject: "Welcome to the newsletter, {name}",
    html: `<div style="text-align:center;padding:20px 0">
  <img src="${LOGO}" alt="Lusan Sapkota" width="56" height="56" style="border-radius:14px;margin-bottom:12px"/>
  <h1 style="font-family:Georgia,serif;color:#1a1a1a;font-size:28px;margin:0">Glad you are here</h1>
</div>
<p style="color:#2c2c2c;line-height:1.7">Hey {name},</p>
<p style="color:#2c2c2c;line-height:1.7">Thanks for subscribing. I send occasional updates about projects, tutorials, and experiments worth your time.</p>
<p style="color:#2c2c2c;line-height:1.7">No spam, no daily noise -- just a thoughtful note when there is something to share.</p>
<p style="margin-top:24px">
  <a href="${SITE}" style="background:#d84315;color:#fffdf5;padding:14px 28px;border-radius:9999px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block">Browse projects</a>
  <a href="https://wiki.lusansapkota.com.np" style="background:#1a1a1a;color:#fffdf5;padding:14px 28px;border-radius:9999px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;margin-left:10px">Read the wiki</a>
</p>
<p style="margin-top:28px;color:#6b5b54">Talk soon,<br/>-- Lusan</p>`,
  },
  {
    id: "event",
    label: "Event Invite",
    subject: "You are invited, {name}",
    html: `<div style="border:2px solid #d84315;border-radius:16px;padding:24px;margin-bottom:24px;text-align:center">
  <img src="${LOGO}" alt="" width="36" height="36" style="border-radius:9px;margin-bottom:10px"/>
  <p style="font-family:monospace;color:#d84315;margin:0 0 8px;font-size:12px;letter-spacing:0.2em;text-transform:uppercase">Upcoming</p>
  <h2 style="font-family:Georgia,serif;color:#1a1a1a;font-size:24px;margin:0 0 12px">Live Workshop</h2>
  <p style="color:#2c2c2c;margin:0 0 4px;font-size:16px;font-weight:600">Saturday, July 12 -- 4 PM NPT</p>
  <p style="color:#6b5b54;margin:0;font-size:14px">Online (link in confirmation)</p>
</div>
<p style="color:#2c2c2c;line-height:1.7">Hi {name},</p>
<p style="color:#2c2c2c;line-height:1.7">I am running a live workshop on building full-stack apps with Next.js and Python. We will go from empty folder to deployed app in two hours.</p>
<p style="color:#2c2c2c;line-height:1.7">Spots are limited. No cost -- bring a laptop and curiosity.</p>
<p style="margin-top:20px"><a href="${SITE}" style="background:#d84315;color:#fffdf5;padding:14px 28px;border-radius:9999px;text-decoration:none;font-weight:600;font-size:14px">Register here</a></p>
<p style="margin-top:28px;color:#6b5b54">Hope to see you there,<br/>-- Lusan</p>`,
  },
  {
    id: "featured",
    label: "Featured Work",
    subject: "Handpicked projects for you, {name}",
    html: `<div style="background:#f39c12;padding:32px 24px;border-radius:16px;text-align:center;color:#1a1a1a;margin-bottom:24px">
  <img src="${LOGO}" alt="" width="44" height="44" style="border-radius:11px;margin-bottom:10px"/>
  <h1 style="font-family:Georgia,serif;font-size:26px;margin:0 0 6px">Handpicked for you</h1>
  <p style="margin:0;font-size:14px;opacity:0.8">A curated selection of work from the lab.</p>
</div>
<p style="color:#2c2c2c;line-height:1.7">Hey {name},</p>
<p style="color:#2c2c2c;line-height:1.7">I put together a shortlist of projects that represent the kind of work I care about -- each one open source and documented from concept to deployment.</p>
<table style="width:100%;border-collapse:collapse;margin:20px 0">
  <tr style="border-bottom:1px solid #e8dcc8">
    <td style="padding:12px 10px;background:#fff8e1;border-radius:8px 0 0 8px"><span style="font-weight:700;color:#006064">ThermoPi</span><br/><span style="font-size:12px;color:#6b5b54">Embedded temperature monitoring with Raspberry Pi</span></td>
  </tr>
  <tr><td style="height:8px"></td></tr>
  <tr style="border-bottom:1px solid #e8dcc8">
    <td style="padding:12px 10px;background:#fff8e1;border-radius:8px 0 0 8px"><span style="font-weight:700;color:#d84315">Lcore</span><br/><span style="font-size:12px;color:#6b5b54">Minimal Python web framework from scratch</span></td>
  </tr>
  <tr><td style="height:8px"></td></tr>
  <tr>
    <td style="padding:12px 10px;background:#fff8e1;border-radius:8px 0 0 8px"><span style="font-weight:700;color:#1a1a1a">GraphLab</span><br/><span style="font-size:12px;color:#6b5b54">Interactive graph algorithm visualizer</span></td>
  </tr>
</table>
<p style="margin-top:20px"><a href="${SITE}" style="background:#f39c12;color:#1a1a1a;padding:14px 28px;border-radius:9999px;text-decoration:none;font-weight:600;font-size:14px">Explore all projects</a></p>
<p style="margin-top:28px;color:#6b5b54">Keep building,<br/>-- Lusan</p>`,
  },
  {
    id: "store",
    label: "Store Release",
    subject: "New on the store, {name}",
    html: `<div style="background:#1a1a1a;padding:32px 24px;border-radius:16px;text-align:center;color:#fffdf5;margin-bottom:24px">
  <img src="${LOGO}" alt="" width="44" height="44" style="border-radius:11px;margin-bottom:10px"/>
  <h1 style="font-family:Georgia,serif;font-size:26px;margin:0 0 6px;color:#ffd700">Now available</h1>
  <p style="margin:0;font-size:14px;opacity:0.75">A new digital product is live.</p>
</div>
<p style="color:#2c2c2c;line-height:1.7">Hey {name},</p>
<p style="color:#2c2c2c;line-height:1.7">I just published a new resource on the store -- a template, a course, or a tool built from real production experience. Every release comes with source access and lifetime updates.</p>
<div style="border:1px solid #f39c12;border-radius:12px;padding:20px;margin:20px 0;background:#fff8e1">
  <p style="font-family:monospace;color:#d84315;margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.2em">Just released</p>
  <h3 style="font-family:Georgia,serif;color:#1a1a1a;margin:0 0 6px;font-size:20px">Production-ready Next.js Starter</h3>
  <p style="color:#6b5b54;margin:0 0 12px;font-size:14px">Auth, admin panel, email, payments -- wired and documented.</p>
  <p style="margin:0;font-size:18px;font-weight:700;color:#f39c12">$29</p>
</div>
<p style="margin-top:20px"><a href="https://store.lusansapkota.com.np" style="background:#1a1a1a;color:#ffd700;padding:14px 28px;border-radius:9999px;text-decoration:none;font-weight:600;font-size:14px">Visit the store</a></p>
<p style="margin-top:28px;color:#6b5b54">Thanks for the support,<br/>-- Lusan</p>`,
  },
];

export const DEFAULT_TEMPLATE = TEMPLATES[0];
