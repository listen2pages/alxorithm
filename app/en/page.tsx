import { languageAlternates } from '@/i18n/routing';
import type { Metadata } from "next";
import B2BLandingClient, { landingFaqs } from "./B2BLandingClient";

const title = "Restaurant, café and bar management software";
const description =
  "Manage your restaurant, café and bar in one place. Analyse POS CSV files, track dish costs, inventory and staff schedules. Try the free online demo.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/", languages: languageAlternates("/") },
  openGraph: {
    title,
    description,
    url: "/",
    locale: "en_GB",
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
                "@id": "https://alxorithm.com/#organization",
                name: "alxorithm",
                url: "https://alxorithm.com/",
                logo: "https://alxorithm.com/logo.png",
              },
              {
                "@type": "SoftwareApplication",
                name: "alxorithm",
                applicationCategory: "BusinessApplication",
                operatingSystem: "Web",
                inLanguage: "en",
                url: "https://alxorithm.com/",
                description,
                publisher: {
                  "@id": "https://alxorithm.com/#organization",
                },
                featureList: [
                  "POS CSV analysis",
                  "Recipe costs and margins",
                  "Inventory and purchase history",
                  "Schedule and planned pay",
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
