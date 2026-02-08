export type FaqSchemaItem = {
  question: string;
  answer: string;
};

export type BreadcrumbItem = {
  name: string;
  item: string;
};

type StructuredDataProps = {
  data: Record<string, unknown>;
};

export const StructuredData = ({ data }: StructuredDataProps) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data)
      }}
    />
  );
};

export const buildFaqSchema = (faqItems: FaqSchemaItem[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer
    }
  }))
});

export const buildBreadcrumbSchema = (items: BreadcrumbItem[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.item
  }))
});

type ServiceSchemaInput = {
  name: string;
  description: string;
  url: string;
};

export const buildServiceSchema = ({ name, description, url }: ServiceSchemaInput) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  name,
  serviceType: name,
  description,
  areaServed: {
    "@type": "AdministrativeArea",
    name: "Sjælland"
  },
  provider: {
    "@type": "LocalBusiness",
    name: "BPSLIB",
    url: "https://bpslib.dk"
  },
  url
});
