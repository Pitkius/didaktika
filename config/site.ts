export const siteConfig = {
  name: "Didaktika",
  tagline: "Jūsų DI antrasis mokytojas",
  description:
    "Išmani mokymosi platforma, prisitaikanti prie kiekvieno mokinio individualių poreikių — mokiniams, mokytojams ir mokykloms.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  contactEmail: "hello@didaktika.eu",
  company: "Didaktika UAB",
  locale: "lt-LT",
} as const;

export type SiteConfig = typeof siteConfig;
