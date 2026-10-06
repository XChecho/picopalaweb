import type { Metadata } from "next";

export const SITE_NAME = "Pico & Pala";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const DEFAULT_TITLE = "Pico & Pala — 1v1 Number Deduction Game";
const SHARE_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: "Pico & Pala — 1v1 number deduction game" };
export const DEFAULT_DESCRIPTION =
  "The tactical 1v1 number deduction mind-sport. Decode your opponent's 4-digit secret code with Pico and Pala clues before they crack yours.";

interface IPageMetadataInput {
  title: string;
  description: string;
  /** Path of the page, used for the canonical URL and the Open Graph URL. */
  path: string;
  /** Private or transactional pages (sign-in, game) are kept out of search results. */
  index?: boolean;
}

/** Builds complete metadata for a route; child `openGraph` replaces the root one, so it is restated. */
export function pageMetadata({ title, description, path, index = true }: IPageMetadataInput): Metadata {
  return {
    // `absolute`: the root template is not applied to nested segments (e.g. /how-to-play/strategy).
    title: { absolute: `${title} | ${SITE_NAME}` },
    description,
    alternates: { canonical: path },
    robots: index ? undefined : { index: false, follow: false },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
      description,
      url: path,
      images: [SHARE_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [SHARE_IMAGE.url],
    },
  };
}
