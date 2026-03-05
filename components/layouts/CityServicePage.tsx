import { Children, Fragment, isValidElement, type ReactNode } from "react";

import {
  CityFeatureBand,
  CityFeatureGallery,
  CityFeatureShowcase,
  type CityFeatureCategory
} from "@/components/layouts/CityFeatureShowcase";

type CityServicePageProps = {
  category: CityFeatureCategory;
  children: ReactNode;
};

const getElementTypeName = (node: ReactNode): string => {
  if (!isValidElement(node)) {
    return "";
  }

  const elementType = node.type as
    | string
    | { name?: string; displayName?: string; render?: { name?: string } };

  if (typeof elementType === "string") {
    return elementType;
  }

  return elementType.displayName ?? elementType.name ?? elementType.render?.name ?? "";
};

const isStructuredDataNode = (node: ReactNode) => getElementTypeName(node) === "StructuredData";

const isFaqNode = (node: ReactNode) => getElementTypeName(node) === "FaqSection";

export const CityServicePage = ({ category, children }: CityServicePageProps) => {
  const nodes = Children.toArray(children);
  const contentNodes = nodes.filter((node) => !isStructuredDataNode(node));
  const seoNodes = nodes.filter((node) => isStructuredDataNode(node));

  const heroNode = contentNodes[0];
  const bodyNodes = contentNodes.slice(1);
  const faqIndex = bodyNodes.findIndex((node) => isFaqNode(node));

  const bandInsertIndex = Math.min(bodyNodes.length - 1, 2);
  const galleryInsertIndex =
    faqIndex > 0 ? Math.max(1, faqIndex - 1) : Math.max(1, bodyNodes.length - 2);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-20 city-service-page">
      {heroNode}
      {heroNode ? <CityFeatureShowcase category={category} /> : null}

      {bodyNodes.map((node, index) => (
        <Fragment key={index}>
          {index === bandInsertIndex && bodyNodes.length > 2 ? (
            <CityFeatureBand category={category} />
          ) : null}
          {node}
          {index === galleryInsertIndex && bodyNodes.length > 3 ? (
            <CityFeatureGallery category={category} />
          ) : null}
        </Fragment>
      ))}

      {seoNodes}
    </main>
  );
};
