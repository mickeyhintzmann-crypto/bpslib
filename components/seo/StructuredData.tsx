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

type LocalBusinessSchemaInput = {
  name: string;
  description: string;
  url: string;
  telephone: string;
  email: string;
  address?: string;
  areaServed?: string;
  openingHours?: string[];
};

export const buildLocalBusinessSchema = ({
  name,
  description,
  url,
  telephone,
  email,
  address,
  areaServed = "Sjælland",
  openingHours = []
}: LocalBusinessSchemaInput) => {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    description,
    url,
    telephone,
    email,
    areaServed: {
      "@type": "AdministrativeArea",
      name: areaServed
    },
    openingHours
  };

  if (address && address.trim().length > 0) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: address,
      addressCountry: "DK"
    };
  }

  return schema;
};
