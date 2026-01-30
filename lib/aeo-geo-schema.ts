/**
 * Schema Generator Library for AEO/GEO Optimization
 * Generates structured data for FAQPage, HowTo, NewsArticle, and Knowledge Graphs
 * Optimized for AI crawlers and answer engines
 */

import type { Post, Category, User } from "@/types";

interface FAQItem {
  question: string;
  answer: string;
  answerHtml?: string;
}

interface HowToStep {
  name: string;
  description: string;
  url?: string;
  image?: string;
}

// FAQ Schema for Answer Engine Optimization
export const generateFAQSchema = (faqs: FAQItem[], articleUrl: string) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: articleUrl,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answerHtml ? stripHtml(faq.answerHtml) : faq.answer,
        html: faq.answerHtml,
      },
    })),
  };
};

// HowTo Schema for process-based content
export const generateHowToSchema = (
  title: string,
  description: string,
  steps: HowToStep[],
  articleUrl: string,
  image?: string
) => {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: title,
    description: description,
    image: image,
    url: articleUrl,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.description,
      ...(step.url && { url: step.url }),
      ...(step.image && {
        image: {
          "@type": "ImageObject",
          url: step.image,
        },
      }),
    })),
  };
};

// Article Schema with E-E-A-T signals
export const generateArticleSchema = (
  post: Post,
  siteUrl: string,
  author?: User
) => {
  return {
    "@context": "https://schema.org",
    "@type": ["NewsArticle", "BlogPosting"],
    headline: post.title,
    description: post.excerpt || stripHtml(post.content).substring(0, 160),
    image: post.featured_image
      ? {
          "@type": "ImageObject",
          url: post.featured_image,
        }
      : undefined,
    author: author
      ? {
          "@type": "Person",
          name: author.username,
          url: `${siteUrl}/profile/${author.username}`,
          image: author.profile_picture,
          sameAs: author.website ? [author.website] : [],
          // E-E-A-T signals
          worksFor: {
            "@type": "Organization",
            name: "Ctrl Bits",
            url: "https://ctrlbits.com",
          },
          description: author.bio,
          jobTitle: "Technology Writer",
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: "Ctrl Bits",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.published_at || post.created_at,
    url: `${siteUrl}/post/${post.slug}/`,
    articleSection: post.category?.name,
    keywords: post.tags.map((tag) => tag.name),
    inLanguage: "en",
    // Additional E-E-A-T properties
    isAccessibleForFree: true,
    accessMode: ["textOnVisual"],
    accessModeSufficient: "textOnVisual,textOnly",
    mainEntity: {
      "@type": "WebPage",
      name: post.title,
      description: post.excerpt,
    },
  };
};

// Knowledge Graph / Entity Schema
export const generateOrganizationKnowledgeGraph = (
  siteUrl: string,
  organizationName: string = "Ctrl Bits"
) => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: organizationName,
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/logo.png`,
      width: 250,
      height: 250,
    },
    description:
      "Digital innovation and web development company specializing in modern web applications, AI solutions, and software architecture.",
    sameAs: [
      "https://github.com/ctrlbits",
      "https://twitter.com/ctrlbits",
      "https://linkedin.com/company/ctrlbits",
    ],
    foundingDate: "2024-01-01",
    areaServed: "Worldwide",
    knowsAbout: [
      "Web Development",
      "Software Architecture",
      "Artificial Intelligence",
      "Cloud Computing",
      "Digital Infrastructure",
    ],
    mainEntity: {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "BitsBlog",
      url: siteUrl,
    },
  };
};

// Person Schema with expertise for E-E-A-T
export const generatePersonSchema = (
  user: User,
  siteUrl: string,
  expertise: string[]
) => {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteUrl}/profile/${user.username}/#person`,
    name: `${user.first_name} ${user.last_name}`,
    url: `${siteUrl}/profile/${user.username}/`,
    image: user.profile_picture,
    email: user.email,
    sameAs: user.website ? [user.website] : [],
    jobTitle: "Technology Writer",
    description: user.bio,
    // E-E-A-T Expertise Signals
    knowsAbout: expertise,
    potentialAction: {
      "@type": "WriteAction",
      agent: {
        "@type": "Person",
        name: `${user.first_name} ${user.last_name}`,
      },
    },
    // Credibility signals
    memberOf: {
      "@type": "Organization",
      name: "Ctrl Bits",
      url: "https://ctrlbits.com",
    },
    affiliation: [
      {
        "@type": "Organization",
        name: "Ctrl Bits",
        url: "https://ctrlbits.com",
      },
    ],
  };
};

// Breadcrumb Schema for navigation
export const generateBreadcrumbSchema = (
  breadcrumbs: Array<{ name: string; url: string }>,
  siteUrl: string
) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url.startsWith("http") ? crumb.url : `${siteUrl}${crumb.url}`,
    })),
  };
};

// Category/Collection Schema for semantic clustering
export const generateCollectionSchema = (
  category: Category,
  siteUrl: string,
  posts: Post[]
) => {
  return {
    "@context": "https://schema.org",
    "@type": ["CollectionPage", "Topic"],
    "@id": `${siteUrl}/categories/${category.slug}/#collection`,
    name: category.name,
    url: `${siteUrl}/categories/${category.slug}/`,
    description: category.description,
    hasPart: posts.map((post) => ({
      "@type": "BlogPosting",
      name: post.title,
      url: `${siteUrl}/post/${post.slug}/`,
    })),
    numberOfItems: posts.length,
    // Semantic clustering
    about: {
      "@type": "Thing",
      name: category.name,
      description: category.description,
    },
  };
};

// Video/Multimedia Schema
export const generateMediaSchema = (
  title: string,
  description: string,
  mediaUrl: string,
  thumbnailUrl: string,
  duration: string,
  uploadDate: string
) => {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: title,
    description: description,
    contentUrl: mediaUrl,
    thumbnailUrl: thumbnailUrl,
    duration: duration,
    uploadDate: uploadDate,
    embedUrl: mediaUrl,
  };
};

// Local Business/Organization Schema (for Nepal context)
export const generateLocalBusinessSchema = (siteUrl: string) => {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteUrl}/#localbusiness`,
    name: "Ctrl Bits",
    url: siteUrl,
    description:
      "Nepal-based web development and digital innovation company",
    areaServed: {
      "@type": "Country",
      name: "Nepal",
    },
    telephone: "+977-1-XXXXXXX", // Update with actual phone
    email: "hello@ctrlbits.com",
    sameAs: [
      "https://github.com/ctrlbits",
      "https://twitter.com/ctrlbits",
      "https://linkedin.com/company/ctrlbits",
    ],
    knowsLanguage: ["English", "Nepali"],
    knowsAbout: [
      "Web Development",
      "Software Architecture",
      "Nepal Digital Infrastructure",
      "AI Solutions",
    ],
  };
};

// Web Site Schema with search capabilities
export const generateWebSiteSchema = (siteUrl: string) => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: "BitsBlog",
    url: siteUrl,
    image: `${siteUrl}/og-home.jpg`,
    description:
      "Technology insights and deep dives into web development, software architecture, and AI",
    publisher: {
      "@type": "Organization",
      name: "Ctrl Bits",
      url: "https://ctrlbits.com",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      query_input: "required name=search_term_string",
    },
    author: {
      "@type": "Organization",
      name: "Ctrl Bits",
    },
    inLanguage: "en",
  };
};

// Answer-First Content Extractor (for AEO)
export const extractAnswerFormatting = (content: string) => {
  // Extract first meaningful paragraph as answer (40-60 words)
  const cleanContent = stripHtml(content);
  const sentences = cleanContent.split(". ");
  let answer = "";

  for (const sentence of sentences) {
    answer += sentence + ". ";
    if (answer.split(" ").length >= 40) break;
  }

  return answer.substring(0, 300) + "..."; // Max 60 words typically
};

// Multimodal Schema for images and transcripts
export const generateImageObjectSchema = (
  imageUrl: string,
  title: string,
  description: string,
  datePublished: string
) => {
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    url: imageUrl,
    name: title,
    description: description,
    datePublished: datePublished,
    contentUrl: imageUrl,
  };
};

// Vector Embedding Metadata
export const generateVectorEmbeddingMetadata = (
  post: Post,
  chunkIndex: number,
  chunkText: string,
  siteUrl: string
) => {
  return {
    source: "bitsblog",
    document_id: `${post.id}-${chunkIndex}`,
    article_title: post.title,
    article_url: `${siteUrl}/post/${post.slug}/`,
    chunk_index: chunkIndex,
    chunk_text: chunkText,
    category: post.category?.name,
    tags: post.tags.map((t) => t.name),
    author: post.author?.username,
    published_date: post.published_at,
    content_type: "blog_post",
    language: "en",
    token_count: estimateTokenCount(chunkText),
  };
};

// Helper functions
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&");
}

function estimateTokenCount(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

export default {
  generateFAQSchema,
  generateHowToSchema,
  generateArticleSchema,
  generateOrganizationKnowledgeGraph,
  generatePersonSchema,
  generateBreadcrumbSchema,
  generateCollectionSchema,
  generateMediaSchema,
  generateLocalBusinessSchema,
  generateWebSiteSchema,
  extractAnswerFormatting,
  generateImageObjectSchema,
  generateVectorEmbeddingMetadata,
};
