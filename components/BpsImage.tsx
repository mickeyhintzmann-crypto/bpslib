"use client";

import { useEffect, useMemo, useState, type SyntheticEvent, type CSSProperties } from "react";
import Image, { type ImageProps } from "next/image";

import { defaultFallback } from "@/lib/assets";

const DEFAULT_ALT = "Billede fra BPSLIB";
const DEFAULT_SIZES = "(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 40vw";

type BpsImageProps = Omit<ImageProps, "src" | "alt" | "sizes" | "loading"> & {
  src?: string | null;
  alt: string;
  fallbackSrc?: string;
  sizes?: string;
  loading?: "lazy" | "eager";
};

export const BpsImage = ({
  src,
  alt,
  fallbackSrc = defaultFallback,
  priority = false,
  sizes = DEFAULT_SIZES,
  loading,
  onError,
  ...props
}: BpsImageProps) => {
  const resolvedSrc = useMemo(() => {
    const normalized = typeof src === "string" ? src.trim() : "";
    return normalized.length > 0 ? normalized : fallbackSrc;
  }, [fallbackSrc, src]);

  const [activeSrc, setActiveSrc] = useState(resolvedSrc);

  useEffect(() => {
    setActiveSrc(resolvedSrc);
  }, [resolvedSrc]);

  const handleError = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    if (activeSrc !== fallbackSrc) {
      setActiveSrc(fallbackSrc);
    }

    onError?.(event);
  };

  if (activeSrc.startsWith("/images/")) {
    const { className, width, height, style } = props;
    const mergedStyle: CSSProperties = {
      display: "block",
      width: style?.width ?? "100%",
      height: style?.height ?? "auto",
      ...style
    };
    return (
      <img
        src={activeSrc}
        alt={alt.trim().length > 0 ? alt : DEFAULT_ALT}
        className={className}
        width={typeof width === "number" ? width : undefined}
        height={typeof height === "number" ? height : undefined}
        style={mergedStyle}
        loading={priority ? "eager" : loading ?? "lazy"}
        onError={handleError}
      />
    );
  }

  return (
    <Image
      {...props}
      src={activeSrc}
      alt={alt.trim().length > 0 ? alt : DEFAULT_ALT}
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : loading ?? "lazy"}
      onError={handleError}
    />
  );
};
