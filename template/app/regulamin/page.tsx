import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Regulamin Serwisu',
  description:
    'Zasady korzystania z serwisu internetowego jedzeniewarszawa.pl, prawa i obowiązki użytkowników oraz warunki techniczne i rejestracja.',
  alternates: {
    canonical: '/regulamin',
  },
  openGraph: {
    title: 'Regulamin Serwisu | jedzeniewarszawa.pl',
    description:
      'Zasady korzystania z serwisu internetowego jedzeniewarszawa.pl, prawa i obowiązki użytkowników oraz warunki techniczne i rejestracja.',
    url: 'https://www.jedzeniewarszawa.pl/regulamin',
  },
};

export default function RegulaminPage() {
  return (
    <main className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12">
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-brand-brown mb-8 text-center">
          Regulamin Serwisu jedzeniewarszawa.pl
        </h1>

        <div className="space-y-8 text-brand-brown/80 font-jakarta leading-relaxed">
          <section>
            <h2 className="text-2xl font-display font-semibold text-brand-brown mb-4">
              1. Postanowienia ogólne
            </h2>
            <p className="mb-2">
              Niniejszy Regulamin określa zasady korzystania z serwisu internetowego dostępnego pod adresem{' '}
              <a
                href="https://www.jedzeniewarszawa.pl/"
                className="text-brand-orange hover:underline"
              >
                https://www.jedzeniewarszawa.pl/
              </a>{' '}
              {'(dalej: "Serwis").'}
            </p>
            <p className="mb-2">
              Właścicielem i Administratorem Serwisu jest osoba fizyczna: Yousif Hussein Yousif
              zamieszkała pod adresem: sabaly 62 02-362 Warszawa, prowadząca działalność nierejestrowaną w rozumieniu art. 5 ustawy z dnia 6 marca 2018 r. – Prawo przedsiębiorców, kontakt:{' '}
              <a
                href="mailto:yousifhussein1996@gmail.com"
                className="text-brand-orange hover:underline"
              >
                yousifhussein1996@gmail.com
              </a>
              {', tel. +48 57844875 (dalej: "Usługodawca").'}
            </p>
            <p>
              Serwis udostępnia narzędzia do zarządzania sprzedażą, recepturami, magazynem i personelem lokalu gastronomicznego.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-brand-brown mb-4">
              2. Usługi świadczone drogą elektroniczną
            </h2>
            <p className="mb-4">
              Usługodawca świadczy za pośrednictwem Serwisu następujące bezpłatne usługi:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Zakładanie i prowadzenie konta Użytkownika.</li>
              <li>Dostęp do interaktywnego trybu demonstracyjnego (Demo) czterech modułów Serwisu.</li>
            </ul>
            <p className="mb-2">
              Narzędzia zarządzania lokalem są dostępne w ramach subskrypcji opisanej na stronie oferty.
            </p>
            <p>
              Subskrypcja w cenie 400 zł / miesiąc rozpoczyna się 7-dniowym bezpłatnym okresem próbnym, odnawia się automatycznie co miesiąc i może zostać anulowana w dowolnym momencie przed końcem okresu próbnego lub bieżącego okresu rozliczeniowego w portalu płatności Stripe lub mailowo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-brand-brown mb-4">
              3. Warunki techniczne i Rejestracja
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Do korzystania z Serwisu niezbędne jest urządzenie z dostępem do Internetu oraz standardowa przeglądarka internetowa z włączoną obsługą plików cookies.
              </li>
              <li>Przeglądanie Serwisu nie wymaga rejestracji.</li>
              <li>
                Założenie konta (dla Użytkowników i Restauratorów) wymaga podania adresu e-mail i hasła. Użytkownik zobowiązany jest do podania prawdziwych danych.
              </li>
              <li>
                Logowanie i utworzenie konta w Serwisie realizowane jest bezhasłowo za pomocą uwierzytelniania Google OAuth.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-brand-brown mb-4">
              4. Prawa i obowiązki
            </h2>
            <p className="mb-4">
              Zakazane jest dostarczanie przez Użytkownika treści o charakterze bezprawnym.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-brand-brown mb-4">
              5. Reklamacje i odstąpienie od umowy
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Użytkownik ma prawo zgłaszać reklamacje dotyczące funkcjonowania Serwisu na adres e-mail:{' '}
                <a
                  href="mailto:yousifhussein1996@gmail.com"
                  className="text-brand-orange hover:underline"
                >
                  yousifhussein1996@gmail.com
                </a>
                .
              </li>
              <li>Reklamacje rozpatrywane są w terminie 14 dni od ich wpłynięcia.</li>
              <li>
                Konsument ma prawo odstąpić od umowy o świadczenie usług drogą elektroniczną (np. usunąć konto) w każdym czasie, bez podawania przyczyny, kontaktując się z Usługodawcą. Z uwagi na charakter Serwisu (bezpłatny dostęp do informacji), nie mają tu zastosowania przepisy o zwrocie towarów.
              </li>
              <li>
                Anulowanie subskrypcji w trakcie 7-dniowego okresu próbnego powoduje brak naliczenia opłaty, a anulowanie aktywnej subskrypcji zatrzymuje kolejne odnowienia na koniec opłaconego okresu rozliczeniowego.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
