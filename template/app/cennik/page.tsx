import Link from 'next/link';
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
    label: '01 / ANALITYKA POS',
    title: 'Twoje wyniki. Wreszcie czytelne.',
    items: [
      'Przesyłanie plików CSV z POS',
      'Wykresy przychodów i trendów sprzedaży',
      'Zestawienia miesięczne i porównania',
      'Analiza produktów i najlepiej sprzedających się dań',
    ],
  },
  {
    icon: ChefHat,
    label: '02 / KUCHNIA',
    title: 'Dobre danie powinno też zarabiać.',
    items: [
      'Receptury połączone z magazynem',
      'Koszt porcji, marża i VAT w jednym widoku',
      'Alergeny i kategorie dań',
      'Automatyczna aktualizacja kosztów po zmianie ceny składnika',
    ],
  },
  {
    icon: Package,
    label: '03 / MAGAZYN',
    title: 'Wiesz, co kupujesz. I co tracisz.',
    items: [
      'Produkty w kg, litrach, sztukach i opakowaniach',
      'Historia dostaw, zużycia i strat',
      'Notatki zakupowe i porównania miesięczne',
      'Powiązanie z kosztami receptur',
    ],
  },
  {
    icon: Users,
    label: '04 / PERSONEL',
    title: 'Zespół i grafik, który się zgadza.',
    items: [
      'Profile pracowników, stanowiska i stawki',
      'Grafik zmian do trzech miesięcy',
      'Planowany koszt pracy w jednym widoku',
      'Stawki godzinowe i miesięczne',
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
              JEDEN PLAN. PEŁNE NARZĘDZIE.
            </span>
            <h1 id="cennik-h1" style={{ fontSize: 20, marginTop: 26, marginBottom: 13 }}>
              jedzenie warszawa
            </h1>
            <h2 style={{ fontSize: 'clamp(38px,4vw,58px)', lineHeight: 1.1 }}>
              400 zł / miesiąc.
              <br />
              <span>7 dni za darmo.</span>
            </h2>
            <p style={{ fontSize: 16, marginTop: 22, marginBottom: 28, maxWidth: 480 }}>
              Jeden plan obejmuje wszystkie cztery moduły: analitykę POS, kuchnię
              i receptury, magazyn oraz personel i grafik. Żadnych ukrytych kosztów,
              żadnych dodatków.
            </p>

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
                <span style={{ fontSize: 18, color: 'var(--muted)', fontWeight: 500 }}>zł / miesiąc</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.6 }}>
                Po 7-dniowym bezpłatnym okresie próbnym. Anuluj w każdej chwili przed końcem próby — nic nie zapłacisz.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {[
                  '7 dni bezpłatnie — karta wymagana, opłata po próbie',
                  'Pełny dostęp do 4 modułów od pierwszego dnia',
                  'Anuluj przed końcem próby — bez opłat',
                  'Automatyczne odnowienie co miesiąc',
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
                Zacznij 7 dni za darmo <ArrowRight size={17} />
              </a>
              <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--muted)', marginTop: 12 }}>
                Bezpieczna płatność przez Stripe · anuluj kiedy chcesz
              </p>
              <p style={{ textAlign: 'center', fontSize: 11, marginTop: 10, marginBottom: 0 }}>
                <a
                  href={PORTAL_HREF}
                  style={{ color: 'var(--green)', fontWeight: 700, textDecoration: 'underline' }}
                >
                  Zarządzaj subskrypcją lub anuluj okres próbny
                </a>
              </p>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {[
                { icon: Shield, text: 'Płatność przez Stripe' },
                { icon: Smartphone, text: 'Na każdym urządzeniu' },
                { icon: Check, text: 'Bez umów długoterminowych' },
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
              Co zawiera subskrypcja
            </p>
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
            <span>Jeden plan. Cztery moduły. Jedno konto.</span>
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
            <span className="landing-eyebrow">CZTERY MODUŁY. JEDNO KONTO.</span>
            <h2 id="features-detail-title">
              Od pierwszego paragonu
              <br />
              do ostatniej zmiany.
            </h2>
            <p>
              Otwórz każdy moduł w demo i sprawdź, jak może wyglądać codzienna
              praca z danymi Twojego lokalu.
            </p>
          </div>

          <div className="landing-modules">
            {features.map(f => (
              <article key={f.label} className={`landing-module landing-module-${f.label.split('/')[1].trim().toLowerCase()}`}>
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
                    Wypróbuj w demo
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="landing-final" aria-labelledby="cta-title">
          <div className="landing-wrap">
            <span className="landing-eyebrow">ZACZNIJ BEZ RYZYKA</span>
            <h2 id="cta-title">
              7 dni bezpłatnie.
              <br />
              Anuluj zanim zapłacisz.
            </h2>
            <p style={{ maxWidth: 480, marginInline: 'auto' }}>
              Przetestuj pełny dostęp do wszystkich modułów przez tydzień.
              Jeśli zdecydujesz się zostać — 400 zł miesięcznie i żadnych niespodzianek.
            </p>
            <div className="landing-actions" style={{ justifyContent: 'center', marginTop: 32 }}>
              <a href={CHECKOUT_HREF} data-stripe-link={STRIPE_LINK} className="landing-button">
                Zacznij 7 dni za darmo <ArrowRight size={18} />
              </a>
              <Link href="/demo" className="landing-button landing-secondary">
                Otwórz demo najpierw <ArrowRight size={18} />
              </Link>
            </div>
            <small style={{ display: 'block', marginTop: 20, color: '#d5dfd0', fontSize: 11 }}>
              Karta wymagana przy rejestracji · opłata dopiero po 7 dniach · anuluj kiedy chcesz
            </small>
          </div>
        </section>

      </main>

      <footer className="landing-footer landing-wrap">
        <div>
          <strong>jedzenie warszawa</strong>
          <p>Oprogramowanie do zarządzania gastronomią w Polsce.</p>
        </div>
        <nav aria-label="Stopka">
          <Link href="/demo">Demo</Link>
          <Link href="/polityka-prywatnosci">Prywatność</Link>
          <Link href="/regulamin">Regulamin</Link>
        </nav>
      </footer>
    </div>
  );
}
