import { languageAlternates } from '@/i18n/routing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Polityka Prywatności i Cookies',
  description:
    'Dowiedz się jak chronimy Twoje dane, jakie informacje zbieramy i w jakich celach je przetwarzamy zgodnie z RODO.',
  alternates: {
    canonical: "/pl/polityka-prywatnosci", languages: languageAlternates("/pl/polityka-prywatnosci"),
  },
  openGraph: {
    title: "Polityka Prywatności i Cookies | alxorithm.com",
    description:
      'Dowiedz się jak chronimy Twoje dane, jakie informacje zbieramy i w jakich celach je przetwarzamy zgodnie z RODO.',
    url: "https://alxorithm.com/pl/polityka-prywatnosci",
  },
};

export default function PolitykaPrywatnosciPage() {
  return (
    <main className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12">
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-brand-brown mb-8 text-center">
          {" Polityka Prywatności i Cookies "}</h1>

        <div className="space-y-8 text-brand-brown/80 font-jakarta leading-relaxed">
          <section>
            <h2 className="text-2xl font-display font-semibold text-brand-brown mb-4">
              {" 1. Administrator Danych Osobowych "}</h2>
            <p>
              {" Administratorem Twoich danych osobowych jest Yousif Hussein Yousif, zamieszkały/a pod adresem: sabaly 62 02-362 Warszawa (działalność nierejestrowana). Z Administratorem można skontaktować się pod adresem e-mail:"}{' '}
              <a
                href="mailto:yousifhussein1996@gmail.com"
                className="text-brand-orange hover:underline"
              >
                {" yousifhussein1996@gmail.com "}</a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-brand-brown mb-4">
              {" 2. Jakie dane przetwarzamy i w jakim celu? (RODO) "}</h2>
            <p className="mb-4">{"Przetwarzamy Twoje dane w następujących celach:"}</p>
            <ul className="list-disc pl-6 space-y-4">
              <li>
                <strong>{"Prowadzenie konta i uwierzytelnianie:"}</strong> {" Gdy się rejestrujesz (np. poprzez panel logowania), przetwarzamy Twój adres e-mail, nazwę użytkownika oraz hasło. Podstawą prawną jest wykonanie umowy (art. 6 ust. 1 lit. b RODO). "}</li>
              <li>
                <strong>{"Logowanie przez Google OAuth:"}</strong> {" Uwierzytelnianie odbywa się bezhasłowo za pośrednictwem konta Google (OAuth 2.0), które przekazuje adres e-mail, imię i nazwisko oraz opcjonalny awatar profilu. "}</li>
              <li>
                <strong>{"Obsługa lokali gastronomicznych (B2B):"}</strong> {" Od przedstawicieli restauracji zbieramy dane niezbędne do weryfikacji i stworzenia Panelu Restauracji (dane firmowe, NIP, adres, dane kontaktowe). "}</li>
              <li>
                <strong>{"Rozliczenia subskrypcji i okres próbny:"}</strong> {" Dane rozliczeniowe oraz status 7-dniowego okresu próbnego i subskrypcji są przetwarzane w celu realizacji umowy oraz obowiązków księgowych (art. 6 ust. 1 lit. b i c RODO). "}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-brand-brown mb-4">
              {" 3. Komu udostępniamy Twoje dane? "}</h2>
            <p className="mb-4">
              {" Twoje dane są bezpieczne, ale do świadczenia usług korzystamy z zaufanych podmiotów trzecich: "}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>{"Dostawcy IT i Hostingu:"}</strong> {" Twoje dane (w tym dane logowania) są przechowywane na bezpiecznych serwerach dostawców usług chmurowych i bazodanowych (Serwis korzysta z infrastruktury Supabase). "}</li>
              <li>
                <strong>{"Operator płatności Stripe:"}</strong> {" Płatności kartą, obsługa 7-dniowego okresu próbnego oraz portal zarządzania subskrypcją są realizowane przez Stripe Payments Europe, Ltd. Dane kart płatniczych trafiają bezpośrednio do Stripe i nie są zapisywane na serwerach Serwisu. "}</li>
              <li>
                <strong>{"Usługi AI (Google Gemini API i Google Search Grounding):"}</strong> {" Podczas automatycznego rozpoznawania kolumn eksportów POS oraz importu dokumentów menu/kuchni wybrane fragmenty przesłanych plików są analizowane przez model Google Gemini w celu utworzenia mapowania kolumn lub wersji roboczej receptur. Końcowe raporty finansowe są zawsze wyliczane deterministycznie po stronie Serwisu. "}</li>
              <li>
                <strong>{"Narzędzia analityczne:"}</strong> {" Możemy zbierać zanonimizowane dane o ruchu na stronie. "}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-brand-brown mb-4">
              {" 4. Twoje Prawa "}</h2>
            <p className="mb-4">{"Zgodnie z RODO, przysługuje Ci prawo do:"}</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>{"Dostępu do swoich danych oraz otrzymania ich kopii."}</li>
              <li>{"Sprostowania (poprawiania) swoich danych."}</li>
              <li>
                {" Usunięcia danych (prawo do bycia zapomnianym) – np. poprzez prośbę o usunięcie konta. "}</li>
              <li>{"Ograniczenia przetwarzania danych oraz wniesienia sprzeciwu."}</li>
              <li>{"Cofnięcia zgody na przetwarzanie danych w dowolnym momencie."}</li>
            </ul>
            <p>
              {" Aby skorzystać z tych praw, napisz na:"}{' '}
              <a
                href="mailto:yousifhussein1996@gmail.com"
                className="text-brand-orange hover:underline"
              >
                {" yousifhussein1996@gmail.com "}</a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-brand-brown mb-4">
              {" 5. Polityka Cookies (Ciasteczka) "}</h2>
            <p className="mb-4">
              {" Serwis używa plików cookies w celu zapewnienia jego poprawnego działania (tzw. ciasteczka niezbędne – np. do utrzymania sesji logowania użytkownika). "}</p>
            <p className="mb-4">
              {" Wykorzystujemy również ciasteczka analityczne, aby badać statystyki odwiedzin i poprawiać nawigację na stronie. "}</p>
            <p>
              {" Możesz w każdej chwili zmienić ustawienia plików cookies w swojej przeglądarce internetowej. "}</p>
          </section>
        </div>
      </div>
    </main>
  );
}
