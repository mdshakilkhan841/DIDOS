"use client";

import React, { forwardRef } from "react";
import Link, { type LinkProps } from "next/link";

export type SiteLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> &
  LinkProps & {
    children?: React.ReactNode;
  };

const SiteLink = forwardRef<HTMLAnchorElement, SiteLinkProps>(function SiteLink(
  { href, ...props },
  ref
) {
  const hrefStr = typeof href === "string" ? href : href?.toString() || "";
  const isExternal =
    hrefStr.startsWith("http://") ||
    hrefStr.startsWith("https://") ||
    hrefStr.startsWith("mailto:") ||
    hrefStr.startsWith("tel:") ||
    hrefStr.startsWith("#");

  if (isExternal) {
    return <a href={hrefStr} ref={ref} {...(props as any)} />;
  }

  return <Link href={href} ref={ref} {...props} />;
});

export default SiteLink;

