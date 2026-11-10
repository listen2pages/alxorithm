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
    label: "01 / ANALITYKA POS",
    title: "Twoje wyniki. Wreszcie czytelne.",
    text: "Wgraj pliki CSV z POS i zobacz przychody, trendy sprzedaży oraz dostępne dane o produktach. Przełączaj miesiące, zamiast otwierać kolejne arkusze.",
    href: "/demo/panel_demo",
    cta: "Sprawdź panel sprzedaży",
  },
  {
    id: "kuchnia",
    icon: ChefHat,
    label: "02 / KUCHNIA",
    title: "Dobre danie powinno też zarabiać.",
    text: "Połącz receptury ze składnikami z magazynu. Kontroluj koszt porcji, cenę sprzedaży, podatek, marżę, alergeny i kategorie. Zmieniasz cenę składnika — powiązane koszty przeliczają się.",
    href: "/demo/kuchnia_demo",
    cta: "Sprawdź koszty w kuchni",
  },
  {
    id: "magazyn",
    icon: Package,
    label: "03 / MAGAZYN",
    title: "Wiesz, co kupujesz. I co tracisz.",
    text: "Od kawy i oleju po środki czystości. Dodawaj produkty, ceny za kilogram, litr, sztukę lub opakowanie. Zapisuj dostawy, zużycie, straty i notatki zakupowe. Porównuj miesiące.",
    href: "/demo/magazyn_demo",
    cta: "Zajrzyj do magazynu",
  },
  {
    id: "personel",
    icon: Users,
    label: "04 / PERSONEL",
    title: "Zespół i grafik, który się zgadza.",
    text: "Dane pracowników, stanowiska, stawki godzinowe lub miesięczne i plan zmian. Zestawiaj dni, godziny oraz planowany koszt pracy w jednym widoku. Układaj grafik do trzech miesięcy.",
    href: "/demo/personel_demo",
    cta: "Zobacz grafik i wynagrodzenia",
  },
];
export const landingFaqs = [
  {
    q: "Dla kogo jest alxorithm?",
    a: "Dla właścicieli i managerów restauracji, kawiarni i barów w całej Polsce. To aplikacja do zarządzania sprzedażą, kuchnią, magazynem i personelem — dostępna po polsku w przeglądarce.",
  },
  {
    q: "Jak działa analiza danych z POS?",
    a: "Eksportujesz dane z POS do CSV i przesyłasz pliki w panelu dla wybranego miesiąca. System rozpoznaje kolumny, a następnie oblicza wyniki z przesłanych wierszy. Zakres raportu zależy od zawartości plików: zestawienie paragonów pozwala analizować przychody, a szczegóły produktów wymagają pozycji sprzedaży.",
  },
  {
    q: "Czy muszę mieć gotowy arkusz z recepturami?",
    a: "Nie. Produkty magazynowe i dania możesz dodawać ręcznie. W kuchni możesz również przesłać dokumenty, w tym CSV, i sprawdzić przygotowany szkic przed zapisaniem. Brakujące ceny oszacowane na podstawie źródeł rynkowych są oznaczone i można je poprawić.",
  },
  {
    q: "Czy zmiana ceny składnika zmienia koszt dania?",
    a: "Tak. Receptury korzystają z cen produktów w magazynie. Po aktualizacji ceny przeliczają się koszt porcji, zysk i marża powiązanych dań. Wcześniejsze zakupy zachowują cenę zapisaną w ich historii.",
  },
  {
    q: "Czy mogę korzystać na telefonie i komputerze?",
    a: "Tak. Zaloguj się na swoje konto w przeglądarce, aby wrócić do zapisanych danych na telefonie, tablecie lub komputerze. Nie musisz przenosić plików z aktualnym grafikiem między urządzeniami.",
  },
  {
    q: "Czy mogę zobaczyć narzędzie przed subskrypcją?",
    a: "Tak. Interaktywne demo działa bez logowania i zawiera przykładowe dane. Możesz otworzyć każdy z czterech modułów, poznać widoki i dopiero potem przejść do oferty.",
  },
];
function Actions({ light = false }: { light?: boolean }) {
  return (
    <div className="landing-actions">
      <Link
        href="/cennik"
        className={"landing-button " + (light ? "landing-button-light" : "")}
      >
        {" Wybierz subskrypcję "}<ArrowRight size={18} />
      </Link>
      <Link
        href="/demo"
        className={
          "landing-button landing-secondary " +
          (light ? "landing-secondary-light" : "")
        }
      >
        {" Otwórz bezpłatne demo "}<ArrowRight size={18} />
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
              <span className="landing-dot" /> {" DLA RESTAURACJI, KAWIARNI I BARÓW W POLSCE "}</span>
            <h1 id="landing-h1">{"alxorithm"}</h1>
            <h2>
              {" Mniej arkuszy. "}<br />
              {" Więcej "}<span>{"kontroli."}</span>
            </h2>
            <p>
              {" Twój lokal ma wiele ruchomych części. Połącz sprzedaż, koszty dań, magazyn i zespół w jednym miejscu — i odzyskaj czas na prowadzenie biznesu. "}</p>
            <Actions />
            <div className="landing-hero-notes">
              <span>
                <Check size={15} /> {" Demo bez logowania "}</span>
              <span>
                <Check size={15} /> {" Po polsku "}</span>
              <span>
                <Check size={15} /> {" Na każdym urządzeniu "}</span>
            </div>
          </div>
          <div className="landing-hero-visual">
            <LandingCharts />
            <div className="landing-insight">
              <span className="landing-insight-icon">
                <ChefHat size={21} />
              </span>
              <div>
                <strong>{"Cena składnika się zmieniła?"}</strong>
                <span>{"Zobacz, jak wpływa na marżę dania."}</span>
              </div>
              <ArrowRight size={19} />
            </div>
          </div>
        </section>
        <div className="landing-strip">
          <div className="landing-wrap">
            <span>{"Jeden lokal. Pełny obraz."}</span>
            {modules.map((m) => (
              <Link key={m.id} href={"#" + m.id}>
                <m.icon size={18} />
                {m.id === "panel"
                  ? "Sprzedaż"
                  : m.id === "kuchnia"
                    ? "Kuchnia"
                    : m.id === "magazyn"
                      ? "Magazyn"
                      : "Personel"}
              </Link>
            ))}
          </div>
        </div>
        <section
          className="landing-section landing-wrap"
          aria-labelledby="pain-title"
        >
          <div className="landing-section-heading">
            <span className="landing-eyebrow">{"BRZMI ZNAJOMO?"}</span>
            <h2 id="pain-title">
              {" Pełny lokal nie zawsze "}<br />
              {" oznacza pełną kasę. "}</h2>
            <p>
              {" Ceny dostaw rosną. Zmiany w grafiku nie mają końca. A prawdziwy koszt dania ginie między arkuszami. "}</p>
          </div>
          <div className="landing-pains">
            {[
              [
                "01",
                "Marża znika po cichu.",
                "Nowa cena dostawy, ta sama cena w menu. Trudno zauważyć, kiedy danie przestaje się opłacać.",
                "Przeliczaj koszty receptur z cen magazynowych.",
              ],
              [
                "02",
                "Straty nie mieszczą się w notatkach.",
                "Kolejne zakupy, zużycie i wyrzucone produkty. Bez jednej historii trudno zobaczyć, gdzie uciekają pieniądze.",
                "Zapisuj ruchy i porównuj wydatki miesiąc po miesiącu.",
              ],
              [
                "03",
                "Grafik żyje w kilku miejscach.",
                "Kartka na zapleczu, wiadomość na telefonie, osobny plik ze stawkami. Każda zmiana oznacza kolejne liczenie.",
                "Połącz zmiany, godziny i planowane wynagrodzenia.",
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
                {" CZTERY MODUŁY. JEDNO KONTO. "}</span>
              <h2 id="features-title">
                {" Od pierwszego paragonu "}<br />
                {" do ostatniej zmiany. "}</h2>
              <p>
                {" Otwórz moduł i zobacz, jak może wyglądać codzienna praca z danymi Twojego lokalu. "}</p>
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
                    aria-label="Przykładowe dane modułu"
                  >
                    {m.id === "panel" ? (
                      <LandingCharts compact />
                    ) : m.id === "kuchnia" ? (
                      <>
                        <div className="landing-preview-top">
                          <span>{"Receptura · przykład"}</span>
                          <ChefHat size={19} />
                        </div>
                        <h4>{"Krem z pomidorów"}</h4>
                        <span className="landing-pill">
                          {" Zupy · podatek 8% · alergen: mleko "}</span>
                        <div className="landing-recipe-numbers">
                          <div>
                            <small>{"Cena brutto"}</small>
                            <strong>{"24,00 zł"}</strong>
                          </div>
                          <div>
                            <small>{"Koszt porcji"}</small>
                            <strong>{"6,40 zł"}</strong>
                          </div>
                          <div>
                            <small>{"Marża brutto"}</small>
                            <strong>73,3%</strong>
                          </div>
                        </div>
                        <div className="landing-cost-track">
                          <span />
                        </div>
                        <p className="landing-caption">
                          {" Koszt porcji / cena sprzedaży brutto "}</p>
                        <div className="landing-mini-row">
                          <span>{"Pomidory · 250 g"}</span>
                          <strong>{"3,00 zł"}</strong>
                        </div>
                        <div className="landing-mini-row">
                          <span>{"Pozostałe składniki"}</span>
                          <strong>{"3,40 zł"}</strong>
                        </div>
                      </>
                    ) : m.id === "magazyn" ? (
                      <>
                        <div className="landing-preview-top">
                          <span>{"Magazyn · przykład"}</span>
                          <Package size={19} />
                        </div>
                        <h4>{"Każda jednostka ma znaczenie."}</h4>
                        {[
                          [
                            "Olej rzepakowy",
                            "12,00 zł / 0,9 l",
                            "13,33 zł / l",
                          ],
                          ["Sól", "20,00 zł / 900 g", "22,22 zł / kg"],
                          [
                            "Papier toaletowy",
                            "30,00 zł / 12 szt.",
                            "2,50 zł / szt.",
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
                          <Check size={16} /> {" Dostawa zapisana w historii zakupów "}</div>
                      </>
                    ) : (
                      <>
                        <div className="landing-preview-top">
                          <span>{"Grafik · przykład"}</span>
                          <CalendarDays size={19} />
                        </div>
                        <h4>{"Twój tydzień. Bez zgadywania."}</h4>
                        <div
                          className="landing-week"
                          aria-label="Przykładowy grafik Anny"
                        >
                          <span>
                            {" Anna "}<br />
                            <small>{"Kuchnia"}</small>
                          </span>
                          {["PN", "WT", "ŚR", "CZ", "PT"].map((day, i) => (
                            <div key={day}>
                              <small>{day}</small>
                              <span className={i === 2 ? "off" : ""}>
                                {i === 2 ? "Wolne" : "9–17"}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="landing-recipe-numbers">
                          <div>
                            <small>{"Godziny po przerwach"}</small>
                            <strong>{"30 h"}</strong>
                          </div>
                          <div>
                            <small>{"Stawka brutto"}</small>
                            <strong>{"30 zł / h"}</strong>
                          </div>
                        </div>
                        <div className="landing-pay-total">
                          <span>{"Planowane wynagrodzenie"}</span>
                          <strong>{"900,00 zł"}</strong>
                        </div>
                        <p className="landing-caption">
                          {" 4 zmiany po 8 h, po 30 min przerwy. Dane przykładowe. "}</p>
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
            <span className="landing-eyebrow">{"PROSTY POCZĄTEK"}</span>
            <h2 id="steps-title">
              {" Twoje dane już istnieją. "}<br />
              {" Daj im czytelny widok. "}</h2>
          </div>
          <div className="landing-steps">
            {[
              {
                icon: Upload,
                n: "01",
                title: "Dodaj dane",
                text: "Prześlij CSV z POS. Dodaj produkty magazynowe i zespół, a receptury wprowadź ręcznie lub zaimportuj do sprawdzenia.",
              },
              {
                icon: BarChart3,
                n: "02",
                title: "Zobacz, co się dzieje",
                text: "Przejdź od wierszy do wykresów, kart produktów i grafiku. Porównaj miesiące i sprawdź, z czego wynikają Twoje koszty.",
              },
              {
                icon: Smartphone,
                n: "03",
                title: "Zarządzaj tam, gdzie jesteś",
                text: "Zmień cenę, zapisz dostawę lub popraw grafik. Wróć do swoich danych po zalogowaniu na telefonie, tablecie i komputerze.",
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
            <span className="landing-eyebrow">{"OD ZAPLECZA PO SALĘ"}</span>
            <h2 id="account-title">
              {" Twój lokal nie mieści się "}<br />
              {" przy jednym biurku. "}</h2>
            <p>
              {" Dlatego Twoje dane też nie powinny. Jedno konto i zapisane informacje dostępne w przeglądarce — bez wysyłania sobie kolejnej wersji Excela. "}</p>
            <Link className="landing-text-link" href="/demo">
              {" Zobacz narzędzie w praktyce "}<ArrowRight size={18} />
            </Link>
          </div>
          <div className="landing-device">
            <div className="landing-device-bar">
              <span />
              <span />
              <span />
              <small>{"alxorithm / magazyn"}</small>
            </div>
            <div className="landing-device-content">
              <Package size={28} />
              <strong>{"Porządek w magazynie."}</strong>
              <span>{"Te same dane na Twoim koncie."}</span>
              <div className="landing-device-lines">
                <i />
                <i />
                <i />
              </div>
              <span className="landing-pill">
                <Check size={14} /> {" Zapisano "}</span>
            </div>
            <div className="landing-phone">
              <Smartphone size={24} />
              <span>
                {" Twój lokal "}<br />
                <strong>{"pod ręką."}</strong>
              </span>
            </div>
          </div>
        </section>
        <section
          className="landing-section landing-wrap landing-faq"
          aria-labelledby="faq-title"
        >
          <div className="landing-section-heading">
            <span className="landing-eyebrow">{"ZANIM ZACZNIESZ"}</span>
            <h2 id="faq-title">{"Kilka dobrych pytań."}</h2>
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
              {" MNIEJ LICZENIA PO GODZINACH. "}</span>
            <h2 id="cta-title">
              {" Zajmij się swoim lokalem. "}<br />
              {" Liczby miej pod ręką. "}</h2>
            <p>
              {" Poznaj cztery moduły w demo. Wybierz subskrypcję i zacznij pracować na danych swojego biznesu. "}</p>
            <Actions light />
            <small>{"Demo jest bezpłatne i nie wymaga logowania."}</small>
          </div>
        </section>
      </main>
      <footer className="landing-footer landing-wrap">
        <div>
          <strong>{"alxorithm"}</strong>
          <p>{"Oprogramowanie do zarządzania gastronomią w Polsce."}</p>
        </div>
        <nav aria-label="Stopka">
          <Link href="/demo">{"Demo"}</Link>
          <Link href="/polityka-prywatnosci">{"Prywatność"}</Link>
          <Link href="/regulamin">{"Regulamin"}</Link>
        </nav>
      </footer>
    </div>
  );
}
