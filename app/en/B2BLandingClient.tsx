import Link from "@/i18n/navigation";
import {
  ArrowRight,
  BarChart3,
  ChefHat,
  Package,
  Users,
  Check,
  Upload,
  Smartphone,
  CalendarDays,
  ChevronDown,
} from "lucide-react";
import LandingCharts from "./LandingCharts";

import "./landing.css";

const modules = [
  {
    id: "panel",
    icon: BarChart3,
    label: "01 / POS ANALYTICS",
    title: "Your results. Finally clear.",
    text: "Upload POS CSV files to see revenue, sales trends and available product data. Switch between months instead of opening more spreadsheets.",
    href: "/demo/panel_demo",
    cta: "Explore the sales dashboard",
  },
  {
    id: "kuchnia",
    icon: ChefHat,
    label: "02 / KITCHEN",
    title: "A great dish should make a profit too.",
    text: "Connect recipes to inventory ingredients. Track portion cost, selling price, tax, margin, allergens and categories. Change an ingredient price and related costs are recalculated.",
    href: "/demo/kuchnia_demo",
    cta: "Explore kitchen costs",
  },
  {
    id: "magazyn",
    icon: Package,
    label: "03 / INVENTORY",
    title: "Know what you buy. And what you lose.",
    text: "From coffee and oil to cleaning supplies. Add products and prices per kilogram, litre, unit or pack. Record deliveries, usage, waste and purchase notes. Compare months.",
    href: "/demo/magazyn_demo",
    cta: "Explore inventory",
  },
  {
    id: "personel",
    icon: Users,
    label: "04 / STAFF",
    title: "A team and schedule that add up.",
    text: "Employee details, positions, hourly or monthly rates and shift plans. Review days, hours and planned labour costs in one view. Plan up to three months ahead.",
    href: "/demo/personel_demo",
    cta: "See schedules and pay",
  },
];
export const landingFaqs = [
  {
    q: "Who is alxorithm for?",
    a: "For owners and managers of restaurants, cafés and bars. Manage sales, kitchen, inventory and staff in your browser, in English, Polish or Russian.",
  },
  {
    q: "How does POS data analysis work?",
    a: "Export POS data to CSV and upload it for the selected month. The system recognises columns and calculates results from uploaded rows. The report depends on file contents: receipt summaries support revenue analysis, while product details require sales line items.",
  },
  {
    q: "Do I need a ready-made recipe spreadsheet?",
    a: "No. You can add inventory products and dishes manually. In the kitchen, you can also upload documents, including CSV, and review the draft before saving. Missing prices estimated from market sources are marked and can be corrected.",
  },
  {
    q: "Does changing an ingredient price change dish cost?",
    a: "Yes. Recipes use inventory product prices. Updating a price recalculates portion cost, profit and margin for related dishes. Earlier purchases retain the price recorded in their history.",
  },
  {
    q: "Can I use it on my phone and computer?",
    a: "Yes. Sign in through your browser to access saved data on a phone, tablet or computer. You do not need to move schedule files between devices.",
  },
  {
    q: "Can I try the tool before subscribing?",
    a: "Yes. The interactive demo requires no login and includes sample data. Explore each of the four modules before choosing a plan.",
  },
];
function Actions({ light = false }: { light?: boolean }) {
  return (
    <div className="landing-actions">
      <Link
        href="/cennik"
        className={"landing-button " + (light ? "landing-button-light" : "")}
      >
        {" Choose a subscription "}<ArrowRight size={18} />
      </Link>
      <Link
        href="/demo"
        className={
          "landing-button landing-secondary " +
          (light ? "landing-secondary-light" : "")
        }
      >
        {" Open the free demo "}<ArrowRight size={18} />
      </Link>
    </div>
  );
}

export default function B2BLandingClient() {
  return (
    <div className="saas-landing">
      <main>
        <section
          className="landing-hero landing-wrap"
          aria-labelledby="landing-h1"
        >
          <div className="landing-hero-copy">
            <span className="landing-eyebrow">
              <span className="landing-dot" /> {" FOR RESTAURANTS, CAFÉS AND BARS "}</span>
            <h1 id="landing-h1">{"alxorithm"}</h1>
            <h2>
              {" Fewer spreadsheets. "}<br />
              {" More "}<span>{"control."}</span>
            </h2>
            <p>
              {" Your business has many moving parts. Bring sales, dish costs, inventory and your team together, and get time back to run your business. "}</p>
            <Actions />
            <div className="landing-hero-notes">
              <span>
                <Check size={15} /> {" Demo without login "}</span>
              <span>
                <Check size={15} /> {" In English, Polish and Russian "}</span>
              <span>
                <Check size={15} /> {" On every device "}</span>
            </div>
          </div>
          <div className="landing-hero-visual">
            <LandingCharts />
            <div className="landing-insight">
              <span className="landing-insight-icon">
                <ChefHat size={21} />
              </span>
              <div>
                <strong>{"Has an ingredient price changed?"}</strong>
                <span>{"See how it affects your dish margin."}</span>
              </div>
              <ArrowRight size={19} />
            </div>
          </div>
        </section>
        <div className="landing-strip">
          <div className="landing-wrap">
            <span>{"One business. The full picture."}</span>
            {modules.map((m) => (
              <Link key={m.id} href={"#" + m.id}>
                <m.icon size={18} />
                {m.id === "panel"
                  ? "Sales"
                  : m.id === "kuchnia"
                    ? "Kitchen"
                    : m.id === "magazyn"
                      ? "Inventory"
                      : "Staff"}
              </Link>
            ))}
          </div>
        </div>
        <section
          className="landing-section landing-wrap"
          aria-labelledby="pain-title"
        >
          <div className="landing-section-heading">
            <span className="landing-eyebrow">{"SOUND FAMILIAR?"}</span>
            <h2 id="pain-title">
              {" A full restaurant does not always "}<br />
              {" mean a full till. "}</h2>
            <p>
              {" Supplier prices are rising. Schedule changes never end. And the true cost of a dish gets lost between spreadsheets. "}</p>
          </div>
          <div className="landing-pains">
            {[
              [
                "01",
                "Margin disappears quietly.",
                "A new delivery price, the same menu price. It is hard to notice when a dish stops paying off.",
                "Calculate recipe costs from inventory prices.",
              ],
              [
                "02",
                "Waste needs more than notes.",
                "More purchases, usage and discarded products. Without one history, it is hard to see where money goes.",
                "Record movements and compare spending month by month.",
              ],
              [
                "03",
                "The schedule lives in several places.",
                "A sheet in the back room, a message on your phone, a separate rate file. Every change means more calculations.",
                "Connect shifts, hours and planned pay.",
              ],
            ].map(([number, title, pain, answer]) => (
              <article className="landing-pain" key={number}>
                <span className="landing-number">{number}</span>
                <h3>{title}</h3>
                <p>{pain}</p>
                <div>
                  <Check size={18} />
                  <span>{answer}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section
          id="funkcje"
          className="landing-section landing-product-section"
          aria-labelledby="features-title"
        >
          <div className="landing-wrap">
            <div className="landing-section-heading">
              <span className="landing-eyebrow">
                {" FOUR MODULES. ONE ACCOUNT. "}</span>
              <h2 id="features-title">
                {" From the first receipt "}<br />
                {" to the last shift. "}</h2>
              <p>
                {" Open a module and see how everyday work with your business data could look. "}</p>
            </div>
            <div className="landing-modules">
              {modules.map((m) => (
                <article
                  key={m.id}
                  id={m.id}
                  className={"landing-module landing-module-" + m.id}
                >
                  <div className="landing-module-copy">
                    <span className="landing-eyebrow">
                      <m.icon size={18} />
                      {m.label}
                    </span>
                    <h3>{m.title}</h3>
                    <p>{m.text}</p>
                    <Link href={m.href} className="landing-text-link">
                      {m.cta}
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                  <div
                    className="landing-module-preview"
                    aria-label="Sample module data"
                  >
                    {m.id === "panel" ? (
                      <LandingCharts compact />
                    ) : m.id === "kuchnia" ? (
                      <>
                        <div className="landing-preview-top">
                          <span>{"Recipe · example"}</span>
                          <ChefHat size={19} />
                        </div>
                        <h4>{"Cream of tomato soup"}</h4>
                        <span className="landing-pill">
                          {" Soups · tax 8% · allergen: milk "}</span>
                        <div className="landing-recipe-numbers">
                          <div>
                            <small>{"Gross price"}</small>
                            <strong>{"PLN 24.00"}</strong>
                          </div>
                          <div>
                            <small>{"Portion cost"}</small>
                            <strong>{"PLN 6.40"}</strong>
                          </div>
                          <div>
                            <small>{"Gross margin"}</small>
                            <strong>73,3%</strong>
                          </div>
                        </div>
                        <div className="landing-cost-track">
                          <span />
                        </div>
                        <p className="landing-caption">
                          {" Portion cost / gross selling price "}</p>
                        <div className="landing-mini-row">
                          <span>{"Tomatoes · 250 g"}</span>
                          <strong>{"PLN 3.00"}</strong>
                        </div>
                        <div className="landing-mini-row">
                          <span>{"Other ingredients"}</span>
                          <strong>{"PLN 3.40"}</strong>
                        </div>
                      </>
                    ) : m.id === "magazyn" ? (
                      <>
                        <div className="landing-preview-top">
                          <span>{"Inventory · example"}</span>
                          <Package size={19} />
                        </div>
                        <h4>{"Every unit matters."}</h4>
                        {[
                          [
                            "Rapeseed oil",
                            "PLN 12.00 / 0.9 l",
                            "PLN 13.33 / l",
                          ],
                          ["Salt", "PLN 20.00 / 900 g", "PLN 22.22 / kg"],
                          [
                            "Toilet paper",
                            "PLN 30.00 / 12 pcs",
                            "PLN 2.50 / pc",
                          ],
                        ].map(([name, pack, unit]) => (
                          <div className="landing-stock-row" key={name}>
                            <span className="landing-stock-icon">
                              <Package size={19} />
                            </span>
                            <div>
                              <strong>{name}</strong>
                              <small>{pack}</small>
                            </div>
                            <span>{unit}</span>
                          </div>
                        ))}
                        <div className="landing-note">
                          <Check size={16} /> {" Delivery recorded in purchase history "}</div>
                      </>
                    ) : (
                      <>
                        <div className="landing-preview-top">
                          <span>{"Schedule · example"}</span>
                          <CalendarDays size={19} />
                        </div>
                        <h4>{"Your week. Without guesswork."}</h4>
                        <div
                          className="landing-week"
                          aria-label="Anna's sample schedule"
                        >
                          <span>
                            {" Anna "}<br />
                            <small>{"Kitchen"}</small>
                          </span>
                          {["MON", "TUE", "WED", "THU", "FRI"].map((day, i) => (
                            <div key={day}>
                              <small>{day}</small>
                              <span className={i === 2 ? "off" : ""}>
                                {i === 2 ? "Off" : "9–17"}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="landing-recipe-numbers">
                          <div>
                            <small>{"Hours after breaks"}</small>
                            <strong>{"30 h"}</strong>
                          </div>
                          <div>
                            <small>{"Gross rate"}</small>
                            <strong>{"PLN 30 / h"}</strong>
                          </div>
                        </div>
                        <div className="landing-pay-total">
                          <span>{"Planned pay"}</span>
                          <strong>{"PLN 900.00"}</strong>
                        </div>
                        <p className="landing-caption">
                          {" 4 shifts of 8 h, each with a 30-minute break. Sample data. "}</p>
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section
          id="jak-to-dziala"
          className="landing-section landing-wrap"
          aria-labelledby="steps-title"
        >
          <div className="landing-section-heading">
            <span className="landing-eyebrow">{"AN EASY START"}</span>
            <h2 id="steps-title">
              {" Your data already exists. "}<br />
              {" Give it a clear view. "}</h2>
          </div>
          <div className="landing-steps">
            {[
              {
                icon: Upload,
                n: "01",
                title: "Add data",
                text: "Upload POS CSV files. Add inventory products and your team, and enter recipes manually or import them for review.",
              },
              {
                icon: BarChart3,
                n: "02",
                title: "See what is happening",
                text: "Move from rows to charts, product cards and schedules. Compare months and see what drives your costs.",
              },
              {
                icon: Smartphone,
                n: "03",
                title: "Manage wherever you are",
                text: "Change a price, record a delivery or update a schedule. Access your data on a phone, tablet or computer after signing in.",
              },
            ].map((s) => (
              <article key={s.n}>
                <div>
                  <s.icon size={23} />
                  <span>{s.n}</span>
                </div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </article>
            ))}
          </div>
        </section>
        <section
          className="landing-account landing-wrap"
          aria-labelledby="account-title"
        >
          <div>
            <span className="landing-eyebrow">{"FROM BACK OFFICE TO DINING ROOM"}</span>
            <h2 id="account-title">
              {" Your business does not fit "}<br />
              {" at one desk. "}</h2>
            <p>
              {" Your data should not either. One account with saved information in your browser, without sending yourself another Excel version. "}</p>
            <Link className="landing-text-link" href="/demo">
              {" See the tool in action "}<ArrowRight size={18} />
            </Link>
          </div>
          <div className="landing-device">
            <div className="landing-device-bar">
              <span />
              <span />
              <span />
              <small>{"alxorithm / inventory"}</small>
            </div>
            <div className="landing-device-content">
              <Package size={28} />
              <strong>{"An organised inventory."}</strong>
              <span>{"The same data in your account."}</span>
              <div className="landing-device-lines">
                <i />
                <i />
                <i />
              </div>
              <span className="landing-pill">
                <Check size={14} /> {" Saved "}</span>
            </div>
            <div className="landing-phone">
              <Smartphone size={24} />
              <span>
                {" Your business "}<br />
                <strong>{"at your fingertips."}</strong>
              </span>
            </div>
          </div>
        </section>
        <section
          className="landing-section landing-wrap landing-faq"
          aria-labelledby="faq-title"
        >
          <div className="landing-section-heading">
            <span className="landing-eyebrow">{"BEFORE YOU START"}</span>
            <h2 id="faq-title">{"A few good questions."}</h2>
          </div>
          <div>
            {landingFaqs.map((f) => (
              <details key={f.q}>
                <summary>
                  {f.q}
                  <ChevronDown size={19} />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
        <section
          id="cennik"
          className="landing-final"
          aria-labelledby="cta-title"
        >
          <div className="landing-wrap">
            <span className="landing-eyebrow">
              {" LESS CALCULATING AFTER HOURS. "}</span>
            <h2 id="cta-title">
              {" Focus on your business. "}<br />
              {" Keep your numbers close. "}</h2>
            <p>
              {" Explore four modules in the demo. Choose a subscription and start working with your business data. "}</p>
            <Actions light />
            <small>{"The demo is free and requires no login."}</small>
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
