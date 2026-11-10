import { languageAlternates } from '@/i18n/routing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Privacy and Cookie Policy",
  description:
    "Learn how we protect your data, what information we collect and why we process it under GDPR.",
  alternates: {
    canonical: '/polityka-prywatnosci', languages: languageAlternates('/polityka-prywatnosci'),
  },
  openGraph: {
    title: "Privacy and Cookie Policy — alxorithm.com",
    description:
      "Learn how we protect your data, what information we collect and why we process it under GDPR.",
    url: "https://alxorithm.com/polityka-prywatnosci",
  },
};

export default function PolitykaPrywatnosciPage() {
  return (
    <main className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12">
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-brand-brown mb-8 text-center">
          {" Privacy and Cookie Policy "}</h1>

        <div className="space-y-8 text-brand-brown/80 font-jakarta leading-relaxed">
          <section>
            <h2 className="text-2xl font-display font-semibold text-brand-brown mb-4">
              {" 1. Personal data controller "}</h2>
            <p>
              {" Your personal data controller is Yousif Hussein Yousif, residing at sabaly 62, 02-362 Warsaw (unregistered business). Contact the controller by email:"}{' '}
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
              {" 2. What data do we process and why? (GDPR) "}</h2>
            <p className="mb-4">{"We process your data for these purposes:"}</p>
            <ul className="list-disc pl-6 space-y-4">
              <li>
                <strong>{"Account management and authentication:"}</strong> {" When you register, we process your email address, username and password. The legal basis is performance of a contract (GDPR Article 6(1)(b)). "}</li>
              <li>
                <strong>{"Google OAuth sign-in:"}</strong> {" Authentication is passwordless via your Google account (OAuth 2.0), which provides your email address, display name and optional profile avatar. "}</li>
              <li>
                <strong>{"Hospitality businesses (B2B):"}</strong> {" We collect restaurant representatives' information needed to verify and create the restaurant dashboard: business details, tax ID, address and contacts. "}</li>
              <li>
                <strong>{"Subscription billing and trial period:"}</strong> {" Billing details and the status of your 7-day trial and subscription are processed to perform the contract and meet accounting obligations (GDPR Article 6(1)(b) and (c)). "}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-brand-brown mb-4">
              {" 3. Who receives your data? "}</h2>
            <p className="mb-4">
              {" Your data is protected, and we use trusted third parties to provide services: "}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>{"IT and hosting providers:"}</strong> {" Your data, including login data, is stored on secure cloud and database provider servers. The service uses Supabase infrastructure. "}</li>
              <li>
                <strong>{"Stripe payment processor:"}</strong> {" Card payments, the 7-day free trial and the subscription management portal are processed by Stripe Payments Europe, Ltd. Payment card numbers are sent directly to Stripe and are never stored on our servers. "}</li>
              <li>
                <strong>{"AI services (Google Gemini API and Google Search Grounding):"}</strong> {" During automatic POS column detection and menu/kitchen document import, selected excerpts of uploaded files are analysed by Google Gemini to propose column mappings or recipe drafts. Final financial reports are always calculated deterministically by the Service. "}</li>
              <li>
                <strong>{"Analytics tools:"}</strong> {" We may collect anonymised website traffic data. "}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-brand-brown mb-4">
              {" 4. Your rights "}</h2>
            <p className="mb-4">{"Under GDPR, you have the right to:"}</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>{"Access your data and receive a copy."}</li>
              <li>{"Correct your data."}</li>
              <li>
                {" Delete your data (right to be forgotten), for example by requesting account deletion. "}</li>
              <li>{"Restrict processing and object to it."}</li>
              <li>{"Withdraw consent to data processing at any time."}</li>
            </ul>
            <p>
              {" To exercise these rights, write to:"}{' '}
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
              {" 5. Cookie Policy "}</h2>
            <p className="mb-4">
              {" The service uses cookies for correct operation, including essential cookies to maintain login sessions. "}</p>
            <p className="mb-4">
              {" We also use analytics cookies to study visits and improve navigation. "}</p>
            <p>
              {" You can change cookie settings in your browser at any time. "}</p>
          </section>
        </div>
      </div>
    </main>
  );
}
