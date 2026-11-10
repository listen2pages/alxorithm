import { languageAlternates } from '@/i18n/routing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms for using alxorithm.com, user rights and obligations, technical requirements and registration.",
  alternates: {
    canonical: '/regulamin', languages: languageAlternates('/regulamin'),
  },
  openGraph: {
    title: "Terms of Service — alxorithm.com",
    description:
      "Terms for using alxorithm.com, user rights and obligations, technical requirements and registration.",
    url: "https://alxorithm.com/regulamin",
  },
};

export default function RegulaminPage() {
  return (
    <main className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12">
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-brand-brown mb-8 text-center">
          {" alxorithm.com Terms of Service "}</h1>

        <div className="space-y-8 text-brand-brown/80 font-jakarta leading-relaxed">
          <section>
            <h2 className="text-2xl font-display font-semibold text-brand-brown mb-4">
              {" 1. General provisions "}</h2>
            <p className="mb-2">
              {" These terms govern use of the website available at"}{' '}
              <a
                href="https://alxorithm.com/"
                className="text-brand-orange hover:underline"
              >
                {" https://alxorithm.com/ "}</a>{' '}
              {"(the “Service”)."}
            </p>
            <p className="mb-2">
              {" The service owner and administrator is Yousif Hussein Yousif, residing at sabaly 62, 02-362 Warsaw, operating an unregistered business under Article 5 of the Polish Entrepreneurs Act of 6 March 2018. Contact:"}{' '}
              <a
                href="mailto:yousifhussein1996@gmail.com"
                className="text-brand-orange hover:underline"
              >
                {" yousifhussein1996@gmail.com "}</a>
              {", phone +48 57844875 (the “Service Provider”)."}
            </p>
            <p>
              {" The service provides tools to manage sales, recipes, inventory and staff for hospitality businesses. "}</p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-brand-brown mb-4">
              {" 2. Electronic services "}</h2>
            <p className="mb-4">
              {" The service provider offers these free services through the website: "}</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>{"Creating and maintaining a user account."}</li>
              <li>{"Access to the interactive demo mode across all four Service modules."}</li>
            </ul>
            <p className="mb-2">
              {" Business management tools are available through the subscription described on the pricing page. "}</p>
            <p>
              {" The PLN 400 / month subscription starts with a 7-day free trial, renews automatically each month, and can be cancelled at any time before the end of the trial or current billing period via the Stripe billing portal or by email. "}</p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-brand-brown mb-4">
              {" 3. Technical requirements and registration "}</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                {" Using the service requires an internet-connected device and a standard browser with cookies enabled. "}</li>
              <li>{"Browsing the service does not require registration."}</li>
              <li>
                {" Creating an account for users or restaurant owners requires an email address and password. Users must provide accurate information. "}</li>
              <li>
                {" Signing in and creating an account in the Service is performed passwordlessly using Google OAuth authentication. "}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-brand-brown mb-4">
              {" 4. Rights and obligations "}</h2>
            <p className="mb-4">
              {" Users may not submit unlawful content. "}</p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold text-brand-brown mb-4">
              {" 5. Complaints and withdrawal "}</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                {" Users may submit complaints about the service by email:"}{' '}
                <a
                  href="mailto:yousifhussein1996@gmail.com"
                  className="text-brand-orange hover:underline"
                >
                  {" yousifhussein1996@gmail.com "}</a>
                .
              </li>
              <li>{"Complaints are reviewed within 14 days of receipt."}</li>
              <li>
                {" Consumers may withdraw from electronic service agreements, for example delete an account, at any time without giving a reason by contacting the provider. Given the free informational service, goods return provisions do not apply. "}</li>
              <li>
                {" Cancelling during the 7-day free trial results in no charge, and cancelling an active subscription stops future renewals at the end of the paid billing period. "}</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
