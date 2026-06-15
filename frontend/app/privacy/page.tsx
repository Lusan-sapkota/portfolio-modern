import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Lusan Sapkota",
  description:
    "Privacy Policy for Lusan Sapkota's digital platforms and services. Learn how data is collected, used, and protected across all subdomains.",
};

const LAST_UPDATED = "Feb 08, 2026";
const EMAIL_PRIMARY = "contact@lusansapkota.com.np";
const EMAIL_PERSONAL = "sapkotalusan@gmail.com";

const SECTIONS: { number: string; title: string; body: React.ReactNode }[] = [
  {
    number: "1",
    title: "Introduction",
    body: (
      <>
        <p>
          Welcome to the privacy policy for <strong>Lusan Sapkota&rsquo;s</strong> digital ecosystem. This policy applies to all platforms and subdomains including:
        </p>
        <ul className="list-disc pl-6 space-y-1 my-4 text-ink-soft">
          <li><strong>lusansapkota.com.np</strong> — Main portfolio website</li>
          <li><strong>wiki.lusansapkota.com.np</strong> — Knowledge base platform</li>
          <li><strong>git.lusansapkota.com.np</strong> — Code repository platform</li>
          <li><strong>store.lusansapkota.com.np</strong> — Digital products store</li>
          <li><strong>donation.lusansapkota.com.np</strong> — Support platform (coming soon)</li>
        </ul>
        <p>
          By using any of these services, you agree to the collection and use of information in accordance with this policy.
        </p>
      </>
    ),
  },
  {
    number: "2",
    title: "Data I Collect",
    body: (
      <>
        <p>Minimal personal information is collected to provide the best possible experience.</p>
        <h3 className="text-lg font-semibold mt-6 mb-2 text-ink">Information you provide</h3>
        <ul className="list-disc pl-6 space-y-1 text-ink-soft">
          <li><strong>Email address</strong> when subscribing to the newsletter or contacting</li>
          <li><strong>Name</strong> optional, when introduced in contact forms</li>
          <li><strong>Messages</strong> content sent through contact forms</li>
          <li><strong>Support information</strong> optional name and email for contribution receipts</li>
        </ul>
        <h3 className="text-lg font-semibold mt-6 mb-2 text-ink">Automatically collected</h3>
        <ul className="list-disc pl-6 space-y-1 text-ink-soft">
          <li><strong>Website analytics</strong> page views, visit duration, browser type (anonymized)</li>
          <li><strong>Cookies</strong> for theme preferences and essential site functionality</li>
          <li><strong>IP address</strong> for security and analytics (not stored permanently)</li>
        </ul>
      </>
    ),
  },
  {
    number: "3",
    title: "How I Use Your Data",
    body: (
      <>
        <p>Information is used exclusively for the following purposes:</p>
        <ul className="list-disc pl-6 space-y-1 my-4 text-ink-soft">
          <li><strong>Communication:</strong> responding to inquiries and messages</li>
          <li><strong>Newsletter:</strong> sending updates about new projects and tutorials (opt-in only)</li>
          <li><strong>Site improvement:</strong> understanding how visitors use the platforms</li>
          <li><strong>Security:</strong> protecting against spam and malicious activity</li>
          <li><strong>Legal compliance:</strong> meeting any applicable legal requirements</li>
        </ul>
        <div className="border-l-4 border-sienna bg-sienna/10 px-5 py-4 rounded-r-2xl my-6">
          <p className="font-semibold text-ink m-0">Never sold, rented, or shared with third parties for marketing purposes.</p>
        </div>
      </>
    ),
  },
  {
    number: "4",
    title: "Analytics & Cookies",
    body: (
      <>
        <p>Analytics tools are used to understand usage and improve the experience.</p>
        <h3 className="text-lg font-semibold mt-6 mb-2 text-ink">Analytics services</h3>
        <ul className="list-disc pl-6 space-y-1 text-ink-soft">
          <li><strong>Google Analytics</strong> for traffic analysis and behavior insights (anonymized)</li>
          <li><strong>Privacy-focused alternatives</strong> are prioritized where possible</li>
        </ul>
        <h3 className="text-lg font-semibold mt-6 mb-2 text-ink">Cookies used</h3>
        <ul className="list-disc pl-6 space-y-1 text-ink-soft">
          <li><strong>Essential</strong> for site functionality and security</li>
          <li><strong>Preference</strong> to remember theme choice (dark/light)</li>
          <li><strong>Analytics</strong> to understand usage patterns</li>
        </ul>
        <p className="mt-4 text-ink-soft">Cookies can be disabled in browser settings, though some site features may not work properly.</p>
      </>
    ),
  },
  {
    number: "5",
    title: "Contact Forms & Newsletter",
    body: (
      <>
        <h3 className="text-lg font-semibold mt-2 mb-2 text-ink">Contact forms</h3>
        <ul className="list-disc pl-6 space-y-1 text-ink-soft">
          <li>Email and message are stored securely</li>
          <li>Used solely to respond to the inquiry</li>
          <li>Not shared with third parties</li>
          <li>Deletion can be requested at any time</li>
        </ul>
        <h3 className="text-lg font-semibold mt-6 mb-2 text-ink">Newsletter subscription</h3>
        <ul className="list-disc pl-6 space-y-1 text-ink-soft">
          <li>Completely opt-in (active subscription required)</li>
          <li>Sends updates about new projects, tutorials, and platform changes</li>
          <li>Includes an unsubscribe link in every email</li>
          <li>Email is never shared with external parties</li>
        </ul>
      </>
    ),
  },
  {
    number: "6",
    title: "Store Platform (store.lusansapkota.com.np)",
    body: (
      <>
        <div className="border-l-4 border-sienna bg-sienna/10 px-5 py-4 rounded-r-2xl my-4">
          <p className="font-semibold text-ink m-0">Payments are not processed or stored on personal servers.</p>
        </div>
        <p>The digital store operates through trusted third-party processors:</p>
        <ul className="list-disc pl-6 space-y-1 my-4 text-ink-soft">
          <li><strong>Gumroad</strong> primary platform for digital product sales</li>
          <li><strong>PayPal</strong> payment option used on Gumroad</li>
        </ul>
        <p>When a purchase is made, you are redirected to these secure platforms. Review their policies:</p>
        <ul className="list-disc pl-6 space-y-1 text-ink-soft">
          <li>
            <a href="https://gumroad.com/privacy" target="_blank" rel="noopener noreferrer" className="text-sienna underline-offset-4 hover:underline">
              Gumroad Privacy Policy ↗
            </a>
          </li>
          <li>
            <a href="https://www.paypal.com/privacy" target="_blank" rel="noopener noreferrer" className="text-sienna underline-offset-4 hover:underline">
              PayPal Privacy Policy ↗
            </a>
          </li>
        </ul>
      </>
    ),
  },
  {
    number: "7",
    title: "Support Platform (donation.lusansapkota.com.np)",
    body: (
      <>
        <p>The support platform is currently under development and will be launched once open-source projects are publicly available.</p>
        <div className="border-l-4 border-sienna bg-sienna/10 px-5 py-4 rounded-r-2xl my-4">
          <p className="font-semibold text-ink m-0">No donation or payment data is currently being collected.</p>
        </div>
        <p>When active, the platform will:</p>
        <ul className="list-disc pl-6 space-y-1 text-ink-soft">
          <li>Use secure, industry-standard payment processors</li>
          <li>Not store financial information on personal servers</li>
          <li>Collect minimal donor information for acknowledgment only</li>
          <li>Provide transparent records for contributors</li>
        </ul>
      </>
    ),
  },
  {
    number: "8",
    title: "Data Security",
    body: (
      <>
        <p>Appropriate security measures are implemented to protect personal information:</p>
        <ul className="list-disc pl-6 space-y-1 my-4 text-ink-soft">
          <li><strong>Encryption:</strong> all data transmission is encrypted using SSL/HTTPS</li>
          <li><strong>Secure hosting:</strong> hosted on reputable platforms</li>
          <li><strong>Access control:</strong> limited access on a need-to-know basis</li>
          <li><strong>Regular updates:</strong> software and security patches applied promptly</li>
          <li><strong>No financial storage:</strong> credit card or payment information is never stored</li>
        </ul>
        <p className="text-ink-soft">No method of transmission over the internet is 100% secure, but security is continuously improved.</p>
      </>
    ),
  },
  {
    number: "9",
    title: "Third-Party Services",
    body: (
      <>
        <p>Various third-party services are integrated for enhanced functionality:</p>
        <ul className="list-disc pl-6 space-y-1 my-4 text-ink-soft">
          <li><strong>Payment processors:</strong> Gumroad, PayPal, Stripe, eSewa, Khalti</li>
          <li><strong>Analytics:</strong> Google Analytics, privacy-focused alternatives</li>
          <li><strong>Email services:</strong> secure providers for newsletters and communication</li>
          <li><strong>Content delivery:</strong> CDN services for faster loading</li>
          <li><strong>Social media:</strong> GitHub, LinkedIn, X integration for professional profiles</li>
        </ul>
        <p className="text-ink-soft">Each service has its own privacy policy.</p>
      </>
    ),
  },
  {
    number: "10",
    title: "Your Rights",
    body: (
      <>
        <p>Several rights apply to personal information:</p>
        <ul className="list-disc pl-6 space-y-1 my-4 text-ink-soft">
          <li><strong>Access:</strong> request what personal data is held</li>
          <li><strong>Correction:</strong> ask to correct inaccurate information</li>
          <li><strong>Deletion:</strong> request removal from systems</li>
          <li><strong>Unsubscribe:</strong> opt out of newsletters and marketing</li>
          <li><strong>Data portability:</strong> request a copy in a structured format</li>
          <li><strong>Objection:</strong> object to certain types of processing</li>
        </ul>
        <div className="border-l-4 border-sienna bg-sienna/10 px-5 py-4 rounded-r-2xl my-6">
          <p className="font-semibold text-ink m-0">To exercise these rights, contact using the details at the end of this policy.</p>
        </div>
      </>
    ),
  },
  {
    number: "11",
    title: "Legal Framework & Jurisdiction",
    body: (
      <>
        <h3 className="text-lg font-semibold mt-2 mb-2 text-ink">Jurisdiction</h3>
        <ul className="list-disc pl-6 space-y-1 text-ink-soft">
          <li><strong>Primary jurisdiction:</strong> Nepal</li>
          <li><strong>Compliance:</strong> Nepalese privacy and data protection laws</li>
          <li><strong>International users:</strong> international privacy standards are respected where applicable</li>
        </ul>
        <h3 className="text-lg font-semibold mt-6 mb-2 text-ink">Special considerations</h3>
        <ul className="list-disc pl-6 space-y-1 text-ink-soft">
          <li><strong>Cryptocurrency</strong> services are subject to evolving regulations in Nepal</li>
          <li><strong>Cross-border data</strong> some services may process data outside Nepal</li>
          <li><strong>Legal requests</strong> information may be disclosed if legally required</li>
        </ul>
      </>
    ),
  },
  {
    number: "12",
    title: "Contact Me About Privacy",
    body: (
      <>
        <p>For questions, concerns, or requests about this privacy policy or how personal information is handled, contact:</p>
        <div className="bg-sienna text-paper-soft px-6 py-7 sm:px-8 sm:py-9 rounded-2xl my-6 text-center">
          <h3 className="text-paper-soft text-lg font-semibold mb-2">Privacy Officer</h3>
          <p className="text-paper-soft m-0 mb-4">Lusan Sapkota — Full-Stack Developer</p>
          <div className="space-y-1 text-paper-soft text-sm">
            <p><strong>Email:</strong> {EMAIL_PRIMARY}</p>
            <p><strong>Personal email:</strong> {EMAIL_PERSONAL}</p>
            <p><strong>Location:</strong> Kathmandu, Nepal</p>
          </div>
          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 mt-5 bg-paper text-sienna font-semibold px-5 py-2.5 rounded-full hover:-translate-y-0.5 transition-transform"
          >
            Send Privacy Inquiry →
          </Link>
        </div>
        <p className="text-ink-soft">
          <strong>Response time:</strong> privacy inquiries are answered within 1–2 days. For urgent matters, prefix the subject with <em>URGENT — PRIVACY</em>.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-full flex-1 bg-paper text-ink">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-mono uppercase tracking-[0.18em] text-ink-soft hover:text-ink transition mb-10"
        >
          ← Back to Portfolio
        </Link>

        <header className="mb-12">
          <span className="font-mono text-xs uppercase tracking-[0.32em] text-sienna">Legal</span>
          <h1 className="font-sans font-black text-4xl sm:text-5xl lg:text-6xl tracking-[-0.04em] mt-3 leading-[0.95]">
            Privacy Policy
          </h1>
          <p className="mt-5 text-base sm:text-lg text-ink-soft max-w-xl leading-relaxed">
            Privacy matters. This policy explains how information is collected, used, and protected across all digital platforms.
          </p>
        </header>

        <div className="rounded-2xl bg-sienna/10 border border-sienna/25 px-5 py-4 mb-10 text-sm text-ink-soft">
          <strong className="text-sienna">Last updated:</strong> {LAST_UPDATED}
        </div>

        <article className="space-y-10">
          {SECTIONS.map((section) => (
            <section key={section.number} className="border-b border-ink/10 pb-9 last:border-b-0 last:pb-0">
              <h2 className="flex items-center gap-4 font-sans font-semibold text-xl sm:text-2xl tracking-[-0.02em] text-ink mb-4">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-sienna text-paper-soft text-sm font-mono">
                  {section.number}
                </span>
                {section.title}
              </h2>
              <div className="text-ink-soft leading-relaxed [&_p]:mb-3 [&_strong]:text-ink [&_h3]:mt-5 [&_h3]:mb-2">
                {section.body}
              </div>
            </section>
          ))}
        </article>

        <div className="text-center mt-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-ink text-paper font-semibold px-6 py-3 rounded-full hover:bg-teal transition-colors"
          >
            ← Back to Portfolio
          </Link>
        </div>
      </div>
    </main>
  );
}
