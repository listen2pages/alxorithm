import { languageAlternates } from '@/i18n/routing';
import type { Metadata } from "next";
import B2BLandingClient, { landingFaqs } from "./B2BLandingClient";

const title = "Программа управления рестораном, кафе и баром";
const description =
  "Управляйте рестораном, кафе и баром в одном месте. Анализируйте CSV из POS, контролируйте себестоимость, склад и график. Попробуйте бесплатное онлайн-демо.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/ru", languages: languageAlternates("/ru") },
  openGraph: {
    title,
    description,
    url: "/ru",
    locale: "ru_RU",
    type: "website",
    siteName: "alxorithm",
  },
  twitter: { card: "summary_large_image", title, description },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": "https://alxorithm.com/ru/#organization",
                name: "alxorithm",
                url: "https://alxorithm.com/ru",
                logo: "https://alxorithm.com/logo.png",
              },
              {
                "@type": "SoftwareApplication",
                name: "alxorithm",
                applicationCategory: "BusinessApplication",
                operatingSystem: "Web",
                inLanguage: "ru",
                url: "https://alxorithm.com/ru",
                description,
                publisher: {
                  "@id": "https://alxorithm.com/ru/#organization",
                },
                featureList: [
                  "Анализ CSV из POS",
                  "Себестоимость рецептур и маржа",
                  "Склад и история закупок",
                  "График и плановые зарплаты",
                ],
              },
              {
                "@type": "FAQPage",
                mainEntity: landingFaqs.map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
              },
            ],
          }).replace(/</g, "\\u003c"),
        }}
      />
      <B2BLandingClient />
    </>
  );
}
