import { languageAlternates } from '@/i18n/routing';
import Link from "@/i18n/navigation";
import {
  Check,
  ArrowRight,
  BarChart3,
  ChefHat,
  Package,
  Users,
  Shield,
  Smartphone,
} from 'lucide-react';
import '../landing.css';

const STRIPE_LINK = 'https://buy.stripe.com/28E9ASacmewvaWQ0843Je04';
const CHECKOUT_HREF = '/api/stripe/checkout';
const PORTAL_HREF = '/api/stripe/portal';

const features = [
  {
    icon: BarChart3,
    label: "01 / POS ANALYTICS",
    title: "Your results. Finally clear.",
    items: [
      "Upload POS CSV files",
      "Revenue charts and sales trends",
      "Monthly reports and comparisons",
      "Product and bestselling dish analysis",
    ],
  },
  {
    icon: ChefHat,
    label: "02 / KITCHEN",
    title: "A great dish should make a profit too.",
    items: [
      "Recipes linked to inventory",
      "Portion cost, margin and tax in one view",
      "Allergens and dish categories",
      "Automatic cost updates when ingredient prices change",
    ],
  },
  {
    icon: Package,
    label: "03 / INVENTORY",
    title: "Know what you buy. And what you lose.",
    items: [
      "Products in kg, litres, units and packs",
      "Delivery, usage and waste history",
      "Purchase notes and monthly comparisons",
      "Linked to recipe costs",
    ],
  },
  {
    icon: Users,
    label: "04 / STAFF",
    title: "A team and schedule that add up.",
    items: [
      "Employee profiles, positions and rates",
      "Shift schedules up to three months ahead",
      "Planned labour costs in one view",
      "Hourly and monthly rates",
    ],
  },
];

export default function CennikPage() {
  return (
    <div className="saas-landing">
      <main>

        {/* ── HERO ── */}
        <section className="landing-hero landing-wrap" style={{ paddingTop: 80, paddingBottom: 80 }}>
          <div className="landing-hero-copy" style={{ maxWidth: 600 }}>
            <span className="landing-eyebrow">
              <span className="landing-dot" />
              {" ONE PLAN. THE COMPLETE TOOL. "}</span>
            <h1 id="cennik-h1" style={{ fontSize: 20, marginTop: 26, marginBottom: 13 }}>
              {" alxorithm "}</h1>
            <h2 style={{ fontSize: 'clamp(38px,4vw,58px)', lineHeight: 1.1 }}>
              {" PLN 400 / month. "}<br />
              <span>{"7 days free."}</span>
            </h2>
            <p style={{ fontSize: 16, marginTop: 22, marginBottom: 28, maxWidth: 480 }}>
              {" One plan includes all four modules: POS analytics, kitchen and recipes, inventory, and staff schedules. No hidden costs or add-ons. "}</p>

            {/* Price card */}
            <div style={{
              border: '1px solid #e4ddd1',
              borderRadius: 18,
              padding: '28px 32px',
              background: '#fff',
              maxWidth: 420,
              marginBottom: 28,
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 52, fontWeight: 850, letterSpacing: '-2px', color: 'var(--green)' }}>400</span>
                <span style={{ fontSize: 18, color: 'var(--muted)', fontWeight: 500 }}>{"PLN / month"}</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.6 }}>
                {" After the 7-day free trial. Cancel any time before the trial ends and you will not be charged. "}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {[
                  "7 days free — card required, charged after trial",
                  "Full access to 4 modules from day one",
                  "Cancel before trial ends — no charge",
                  "Automatic monthly renewal",
                ].map(t => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, fontWeight: 600 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: '#edf2e8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Check size={11} color="var(--green)" />
                    </div>
                    {t}
                  </div>
                ))}
              </div>
              <a
                href={CHECKOUT_HREF}
                data-stripe-link={STRIPE_LINK}
                className="landing-button"
                style={{ width: '100%', justifyContent: 'center', padding: '16px 24px', fontSize: 14, borderRadius: 11, boxSizing: 'border-box' }}
              >
                {" Start 7 days free "}<ArrowRight size={17} />
              </a>
              <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--muted)', marginTop: 12 }}>
                {" Secure payment through Stripe · cancel any time "}</p>
              <p style={{ textAlign: 'center', fontSize: 11, marginTop: 10, marginBottom: 0 }}>
                <a
                  href={PORTAL_HREF}
                  style={{ color: 'var(--green)', fontWeight: 700, textDecoration: 'underline' }}
                >
                  {" Manage subscription or cancel free trial "}</a>
              </p>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {[
                { icon: Shield, text: "Payment through Stripe" },
                { icon: Smartphone, text: "On every device" },
                { icon: Check, text: "No long-term contracts" },
              ].map(({ icon: Icon, text }) => (
                <span key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
                  <Icon size={13} color="var(--green)" />
                  {text}
                </span>
              ))}
            </div>
          </div>

          {/* Right side — modules list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '1.5px', color: 'var(--green)', textTransform: 'uppercase', marginBottom: 4 }}>
              {" What the subscription includes "}</p>
            {features.map(f => (
              <div key={f.label} style={{
                display: 'flex', alignItems: 'flex-start', gap: 14,
                padding: '18px 20px',
                border: '1px solid #e4ddd1',
                borderRadius: 14,
                background: '#fff',
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: '#edf2e8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <f.icon size={18} color="var(--green)" />
                </div>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '1.2px', color: 'var(--green)', textTransform: 'uppercase', marginBottom: 2 }}>
                    {f.label}
                  </p>
                  <p style={{ fontSize: 13, fontWeight: 750, color: '#3f2716', margin: '0 0 6px', letterSpacing: '-0.3px' }}>
                    {f.title}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
                    {f.items.map(item => (
                      <span key={item} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--muted)' }}>
                        <Check size={10} color="var(--green)" strokeWidth={2.5} />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── STRIP ── */}
        <div className="landing-strip">
          <div className="landing-wrap">
            <span>{"One plan. Four modules. One account."}</span>
            {features.map(f => (
              <Link key={f.label} href="/demo">
                <f.icon size={18} />
                {f.label.split(' / ')[1]}
              </Link>
            ))}
          </div>
        </div>

        {/* ── FEATURES DETAIL ── */}
        <section className="landing-section landing-wrap" aria-labelledby="features-detail-title">
          <div className="landing-section-heading">
            <span className="landing-eyebrow">{"FOUR MODULES. ONE ACCOUNT."}</span>
            <h2 id="features-detail-title">
              {" From the first receipt "}<br />
              {" to the last shift. "}</h2>
            <p>
              {" Open each module in the demo and see how everyday work with your business data could look. "}</p>
          </div>

          <div className="landing-modules">
            {features.map(f => (
              <article key={f.label} className={`landing-module landing-module-${['analityka pos','kuchnia','magazyn','personel'][features.indexOf(f)]}`}>
                <div className="landing-module-copy">
                  <span className="landing-eyebrow">
                    <f.icon size={18} />
                    {f.label}
                  </span>
                  <h3>{f.title}</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {f.items.map(item => (
                      <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted)' }}>
                        <Check size={13} color="var(--green)" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/demo" className="landing-text-link">
                    {" Try the demo "}<ArrowRight size={18} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="landing-final" aria-labelledby="cta-title">
          <div className="landing-wrap">
            <span className="landing-eyebrow">{"START WITHOUT RISK"}</span>
            <h2 id="cta-title">
              {" 7 days free. "}<br />
              {" Cancel before you pay. "}</h2>
            <p style={{ maxWidth: 480, marginInline: 'auto' }}>
              {" Try full access to every module for a week. Stay for PLN 400 a month, with no surprises. "}</p>
            <div className="landing-actions" style={{ justifyContent: 'center', marginTop: 32 }}>
              <a href={CHECKOUT_HREF} data-stripe-link={STRIPE_LINK} className="landing-button">
                {" Start 7 days free "}<ArrowRight size={18} />
              </a>
              <Link href="/demo" className="landing-button landing-secondary">
                {" Open the demo first "}<ArrowRight size={18} />
              </Link>
            </div>
            <small style={{ display: 'block', marginTop: 20, color: '#d5dfd0', fontSize: 11 }}>
              {" Card required on registration · charged after 7 days · cancel any time "}</small>
          </div>
        </section>

      </main>

      <footer className="landing-footer landing-wrap">
        <div>
          <strong>{"alxorithm"}</strong>
          <p>{"Restaurant management software."}</p>
        </div>
        <nav aria-label="Footer">
          <Link href="/demo">{"Demo"}</Link>
          <Link href="/polityka-prywatnosci">{"Privacy"}</Link>
          <Link href="/regulamin">{"Terms"}</Link>
        </nav>
      </footer>
    </div>
  );
}
