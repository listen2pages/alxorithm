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
    label: "01 / АНАЛИТИКА POS",
    title: "Ваши результаты. Наконец понятно.",
    items: [
      "Загрузка CSV из POS",
      "Графики выручки и тенденций продаж",
      "Месячные отчёты и сравнения",
      "Анализ товаров и популярных блюд",
    ],
  },
  {
    icon: ChefHat,
    label: "02 / КУХНЯ",
    title: "Хорошее блюдо должно приносить прибыль.",
    items: [
      "Рецептуры, связанные со складом",
      "Себестоимость порции, маржа и НДС в одном месте",
      "Аллергены и категории блюд",
      "Автоматический пересчёт при изменении цен ингредиентов",
    ],
  },
  {
    icon: Package,
    label: "03 / СКЛАД",
    title: "Знайте, что покупаете. И что теряете.",
    items: [
      "Товары в кг, литрах, штуках и упаковках",
      "История поставок, расхода и списаний",
      "Заметки о закупках и сравнения месяцев",
      "Связь с себестоимостью рецептур",
    ],
  },
  {
    icon: Users,
    label: "04 / ПЕРСОНАЛ",
    title: "Команда и график, которые сходятся.",
    items: [
      "Профили сотрудников, должности и ставки",
      "График смен до трёх месяцев вперёд",
      "Плановые расходы на персонал в одном месте",
      "Почасовые и месячные ставки",
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
              {" ОДИН ТАРИФ. ВСЕ ИНСТРУМЕНТЫ. "}</span>
            <h1 id="cennik-h1" style={{ fontSize: 20, marginTop: 26, marginBottom: 13 }}>
              {" alxorithm "}</h1>
            <h2 style={{ fontSize: 'clamp(38px,4vw,58px)', lineHeight: 1.1 }}>
              {" 400 PLN / месяц. "}<br />
              <span>{"7 дней бесплатно."}</span>
            </h2>
            <p style={{ fontSize: 16, marginTop: 22, marginBottom: 28, maxWidth: 480 }}>
              {" Один тариф включает все четыре модуля: POS-аналитику, кухню и рецептуры, склад, персонал и график. Без скрытых расходов и дополнений. "}</p>

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
                <span style={{ fontSize: 18, color: 'var(--muted)', fontWeight: 500 }}>{"PLN / месяц"}</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.6 }}>
                {" После 7 дней бесплатного периода. Отмените до его окончания, и плата не спишется. "}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {[
                  "7 дней бесплатно — нужна карта, оплата после пробного периода",
                  "Полный доступ к 4 модулям с первого дня",
                  "Отмена до окончания пробного периода — бесплатно",
                  "Автоматическое продление каждый месяц",
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
                {" Начать 7 дней бесплатно "}<ArrowRight size={17} />
              </a>
              <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--muted)', marginTop: 12 }}>
                {" Безопасная оплата через Stripe · отмена в любое время "}</p>
              <p style={{ textAlign: 'center', fontSize: 11, marginTop: 10, marginBottom: 0 }}>
                <a
                  href={PORTAL_HREF}
                  style={{ color: 'var(--green)', fontWeight: 700, textDecoration: 'underline' }}
                >
                  {" Управление подпиской или отмена пробного периода "}</a>
              </p>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {[
                { icon: Shield, text: "Оплата через Stripe" },
                { icon: Smartphone, text: "На любом устройстве" },
                { icon: Check, text: "Без долгосрочных договоров" },
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
              {" Что входит в подписку "}</p>
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
            <span>{"Один тариф. Четыре модуля. Один аккауннт."}</span>
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
            <span className="landing-eyebrow">{"ЧЕТЫРЕ МОДУЛЯ. ОДИН АККАУНТ."}</span>
            <h2 id="features-detail-title">
              {" От первого чека "}<br />
              {" до последней смены. "}</h2>
            <p>
              {" Откройте каждый модуль в демо и посмотрите, как может выглядеть ежедневная работа с данными вашего заведения. "}</p>
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
                    {" Попробовать демо "}<ArrowRight size={18} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="landing-final" aria-labelledby="cta-title">
          <div className="landing-wrap">
            <span className="landing-eyebrow">{"НАЧНИТЕ БЕЗ РИСКА"}</span>
            <h2 id="cta-title">
              {" 7 дней бесплатно. "}<br />
              {" Отмените до оплаты. "}</h2>
            <p style={{ maxWidth: 480, marginInline: 'auto' }}>
              {" Попробуйте все модули в течение недели. Продолжите за 400 PLN в месяц без сюрпризов. "}</p>
            <div className="landing-actions" style={{ justifyContent: 'center', marginTop: 32 }}>
              <a href={CHECKOUT_HREF} data-stripe-link={STRIPE_LINK} className="landing-button">
                {" Начать 7 дней бесплатно "}<ArrowRight size={18} />
              </a>
              <Link href="/demo" className="landing-button landing-secondary">
                {" Сначала открыть демо "}<ArrowRight size={18} />
              </Link>
            </div>
            <small style={{ display: 'block', marginTop: 20, color: '#d5dfd0', fontSize: 11 }}>
              {" Карта при регистрации · оплата через 7 дней · отмена в любое время "}</small>
          </div>
        </section>

      </main>

      <footer className="landing-footer landing-wrap">
        <div>
          <strong>{"alxorithm"}</strong>
          <p>{"Программа для управления рестораном."}</p>
        </div>
        <nav aria-label="Подвал сайта">
          <Link href="/demo">{"Демо"}</Link>
          <Link href="/polityka-prywatnosci">{"Конфиденциальность"}</Link>
          <Link href="/regulamin">{"Условия"}</Link>
        </nav>
      </footer>
    </div>
  );
}
