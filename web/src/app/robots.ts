import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.beaverdash.xyz";
  return {
    rules: {
      userAgent: "*",
      allow: ["/login", "/"],
      disallow: [
        "/tasks",
        "/projects",
        "/teams",
        "/profile",
        "/trash",
        "/shared-projects",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
