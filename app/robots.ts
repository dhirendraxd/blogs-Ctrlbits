import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.ctrlbits.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/login",
          "/register",
          "/profile/*/edit",
          "/saved-posts",
          "/newsletter/verify/*",
          "/newsletter/unsubscribe/*",
        ],
        crawlDelay: 1,
      },
      // Allow premium AI crawlers for content indexing (LLMO optimization)
      {
        userAgent: "GPTBot",
        allow: ["/", "/articles/", "/categories/", "/tags/", "/archives/"],
        disallow: ["/api/", "/dashboard/", "/login", "/register"],
        crawlDelay: 0,
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/", "/articles/", "/categories/", "/tags/", "/archives/"],
        disallow: ["/api/", "/dashboard/", "/login", "/register"],
        crawlDelay: 0,
      },
      {
        userAgent: "CCBot",
        allow: ["/", "/articles/", "/categories/", "/tags/", "/archives/"],
        disallow: ["/api/", "/dashboard/", "/login", "/register"],
        crawlDelay: 0,
      },
      {
        userAgent: "anthropic-ai",
        allow: ["/", "/articles/", "/categories/", "/tags/", "/archives/"],
        disallow: ["/api/", "/dashboard/", "/login", "/register"],
        crawlDelay: 0,
      },
      {
        userAgent: "Claude-Web",
        allow: ["/", "/articles/", "/categories/", "/tags/", "/archives/"],
        disallow: ["/api/", "/dashboard/", "/login", "/register"],
        crawlDelay: 0,
      },
      // Answer engine optimizations
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/articles/", "/categories/", "/tags/", "/archives/"],
        disallow: ["/api/", "/dashboard/", "/login", "/register"],
        crawlDelay: 0,
      },
      {
        userAgent: "AhrefsBot",
        allow: "/",
        crawlDelay: 2,
      },
      {
        userAgent: "SemrushBot",
        allow: "/",
        crawlDelay: 2,
      },
      {
        userAgent: "MJ12bot",
        allow: "/",
        crawlDelay: 1,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
