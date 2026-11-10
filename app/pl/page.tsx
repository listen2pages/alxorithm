import { languageAlternates } from '@/i18n/routing';
import type { Metadata } from "next";
import B2BLandingClient, { landingFaqs } from "./B2BLandingClient";

const title = "Program do zarządzania restauracją, kawiarnią i barem";
const description =
  "Zarządzaj restauracją, kawiarnią i barem w jednym miejscu. Analizuj CSV z POS, kontroluj koszty dań, magazyn i grafik personelu. Sprawdź bezpłatne demo online.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/pl", languages: languageAlternates("/pl") },
  openGraph: {
    title,
    description,
    url: "/pl",
    locale: "pl_PL",
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
                "@id": "https://alxorithm.com/pl/#organization",
                name: "alxorithm",
                url: "https://alxorithm.com/pl",
                logo: "https://alxorithm.com/logo.png",
              },
              {
                "@type": "SoftwareApplication",
                name: "alxorithm",
                applicationCategory: "BusinessApplication",
                operatingSystem: "Web",
                inLanguage: "pl",
                url: "https://alxorithm.com/pl",
                description,
                publisher: {
                  "@id": "https://alxorithm.com/pl/#organization",
                },
                featureList: [
                  "Analiza plików CSV z POS",
                  "Koszty receptur i marże",
                  "Magazyn i historia zakupów",
                  "Grafik i planowane wynagrodzenia",
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
