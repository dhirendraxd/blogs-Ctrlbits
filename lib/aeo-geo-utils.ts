/**
 * Answer Engine Optimization (AEO) & Generative Engine Optimization (GEO) Utilities
 * Provides functions for AI crawler optimization and answer-first formatting
 */

import type { Post } from "@/types";

/**
 * Answer-First Content Formatter
 * Ensures every section has a concise 40-60 word answer before details
 * Optimized for AI summary extraction
 */
export interface FormattedContent {
  title: string;
  answerSnippet: string; // 40-60 words
  fullContent: string;
  questions: string[];
  keyTakeaways: string[];
  schema: any;
}

export const formatAnswerFirst = (content: string, title: string): FormattedContent => {
  // Extract first paragraph as answer snippet
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim());
  const answerSnippet = createAnswerSnippet(paragraphs[0] || "", 50);
  
  // Extract questions from headings
  const questions = extractQuestionsFromContent(content);
  
  // Extract key takeaways
  const keyTakeaways = extractKeyTakeaways(content);

  return {
    title,
    answerSnippet,
    fullContent: content,
    questions,
    keyTakeaways,
    schema: generateAEOSchema(title, answerSnippet, questions),
  };
};

/**
 * Create concise answer snippet (40-60 words)
 */
function createAnswerSnippet(text: string, targetWords: number = 50): string {
  const cleanText = stripHtmlAndMarkdown(text);
  const words = cleanText.split(/\s+/);
  
  // Find natural break point around target word count
  let result = "";
  for (let i = 0; i < Math.min(words.length, targetWords + 10); i++) {
    result += words[i] + " ";
    if (i >= targetWords && words[i].endsWith(".")) break;
  }
  
  return result.trim() + (result.endsWith(".") ? "" : ".");
}

/**
 * Extract question-based headings for AEO
 */
function extractQuestionsFromContent(content: string): string[] {
  const headingRegex = /^#+\s+(.+?)$/gm;
  const questions: string[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const heading = match[1].trim();
    // Convert heading to question if it isn't already
    const question = heading.includes("?") 
      ? heading 
      : `What is ${heading.toLowerCase()}?`;
    questions.push(question);
  }

  return questions;
}

/**
 * Extract key takeaways (typically bolded text or bullet points)
 */
function extractKeyTakeaways(content: string): string[] {
  const takeaways: string[] = [];
  
  // Extract bullet points
  const bulletRegex = /^[\*\-\+]\s+(.+?)$/gm;
  let match;
  while ((match = bulletRegex.exec(content)) !== null) {
    takeaways.push(match[1].trim());
  }

  // Extract bolded text
  const boldRegex = /\*\*(.+?)\*\*/g;
  while ((match = boldRegex.exec(content)) !== null) {
    const bold = match[1].trim();
    if (bold.length < 100) takeaways.push(bold);
  }

  return takeaways.slice(0, 5); // Top 5 takeaways
}

/**
 * Generate AEO schema for answer-based content
 */
function generateAEOSchema(title: string, answerSnippet: string, questions: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: {
        "@type": "Answer",
        text: answerSnippet,
      },
    })),
  };
}

/**
 * Question-Based Header Converter
 * Converts standard headers into natural language questions
 */
export const convertToQuestionHeaders = (content: string): string => {
  return content
    .replace(/^## (.+?)$/gm, (match, header) => {
      if (header.includes("?")) return match;
      if (header.toLowerCase().includes("what")) return `## What is ${header}?`;
      if (header.toLowerCase().includes("how")) return `## How do ${header}?`;
      return `## What about ${header}?`;
    });
};

/**
 * Semantic Content Clustering
 * Groups related content for "Topic Universe" understanding
 */
export interface ContentCluster {
  topic: string;
  subtopics: string[];
  relatedPosts: Post[];
  semanticScore: number;
}

export const createSemanticCluster = (
  mainTopic: string,
  posts: Post[],
  targetKeywords: string[]
): ContentCluster => {
  const subtopics = extractSubtopics(posts, targetKeywords);
  const relatedPosts = rankPostsBySemanticRelevance(posts, targetKeywords);
  const semanticScore = calculateSemanticCoverage(posts, targetKeywords);

  return {
    topic: mainTopic,
    subtopics,
    relatedPosts,
    semanticScore,
  };
};

/**
 * Extract subtopics from post content
 */
function extractSubtopics(posts: Post[], targetKeywords: string[]): string[] {
  const subtopics = new Set<string>();

  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      if (tag.name !== targetKeywords[0]) {
        subtopics.add(tag.name);
      }
    });
  });

  return Array.from(subtopics).slice(0, 8);
}

/**
 * Rank posts by semantic relevance to keywords
 */
function rankPostsBySemanticRelevance(posts: Post[], keywords: string[]): Post[] {
  return posts
    .map((post) => {
      let score = 0;
      const content = `${post.title} ${post.excerpt || ""}`.toLowerCase();

      keywords.forEach((keyword) => {
        const matches = content.match(new RegExp(keyword, "gi"));
        score += matches ? matches.length : 0;
      });

      return { post, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((item) => item.post);
}

/**
 * Calculate semantic coverage (0-1 score)
 */
function calculateSemanticCoverage(posts: Post[], keywords: string[]): number {
  const totalPosts = posts.length;
  let coveredTopics = 0;

  keywords.forEach((keyword) => {
    const postsWithKeyword = posts.filter((p) =>
      `${p.title} ${p.excerpt}`.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    if (postsWithKeyword > 0) coveredTopics++;
  });

  return coveredTopics / keywords.length;
}

/**
 * Multimodal Content Extractor
 * Prepares images and video transcripts for AI crawlers
 */
export interface MultimodalMetadata {
  imageUrl: string;
  altText: string;
  caption?: string;
  transcript?: string;
  relevantText: string;
}

export const extractMultimodalElements = (
  post: Post
): MultimodalMetadata[] => {
  const multimodal: MultimodalMetadata[] = [];

  // Extract featured image
  if (post.featured_image) {
    multimodal.push({
      imageUrl: post.featured_image,
      altText: post.title,
      caption: `Featured image for: ${post.title}`,
      relevantText: post.excerpt || post.title,
    });
  }

  // Parse inline images from content (pattern: ![alt](url))
  const imageRegex = /!\[(.+?)\]\((.+?)\)/g;
  let match;
  while ((match = imageRegex.exec(post.content)) !== null) {
    const [, alt, url] = match;
    multimodal.push({
      imageUrl: url,
      altText: alt,
      relevantText: extractContextFromContent(post.content, match.index),
    });
  }

  return multimodal;
};

/**
 * Extract surrounding text context from content
 */
function extractContextFromContent(content: string, index: number): string {
  const start = Math.max(0, index - 100);
  const end = Math.min(content.length, index + 100);
  return content.substring(start, end).trim();
}

/**
 * E-E-A-T Signal Generator
 * Creates structured data to enhance expertise, experience, authoritativeness, trustworthiness
 */
export interface EEATSignals {
  expertiseKeywords: string[];
  experienceYears: number;
  authorityScore: number;
  trustIndicators: string[];
}

export const generateEEATSignals = (post: Post, author: any): EEATSignals => {
  return {
    expertiseKeywords: post.tags.map((t) => t.name),
    experienceYears: calculateExperienceYears(author),
    authorityScore: calculateAuthorityScore(post),
    trustIndicators: generateTrustIndicators(post, author),
  };
};

function calculateExperienceYears(author: any): number {
  if (!author.created_at) return 0;
  const createdDate = new Date(author.created_at);
  return Math.floor((Date.now() - createdDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

function calculateAuthorityScore(post: Post): number {
  let score = 0;
  score += post.views ? Math.min(post.views / 1000, 10) : 0; // Views
  score += post.comments_count ? Math.min(post.comments_count / 10, 5) : 0; // Comments
  score += post.tags.length; // Tags
  return Math.min(score / 25, 1); // Normalize to 0-1
}

function generateTrustIndicators(post: Post, author: any): string[] {
  const indicators: string[] = [];

  if (post.views > 100) indicators.push("High engagement");
  if (post.comments_count > 10) indicators.push("Active discussion");
  if (author.bio) indicators.push("Verified profile");
  if (post.tags.length > 3) indicators.push("Well-categorized");

  return indicators;
}

/**
 * Direct Citation Tracking Data
 * Prepares data for citation monitoring tools
 */
export interface CitationMetadata {
  postId: number;
  postUrl: string;
  canonicalUrl: string;
  articleTopic: string;
  authorName: string;
  publishDate: string;
  updateDate?: string;
  citationKeywords: string[];
}

export const generateCitationMetadata = (post: Post, siteUrl: string): CitationMetadata => {
  return {
    postId: post.id,
    postUrl: `${siteUrl}/post/${post.slug}/`,
    canonicalUrl: `${siteUrl}/post/${post.slug}/`,
    articleTopic: post.category?.name || "General",
    authorName: post.author?.username || "Unknown",
    publishDate: post.published_at || post.created_at,
    updateDate: post.updated_at,
    citationKeywords: [post.title, ...post.tags.map((t) => t.name)],
  };
};

/**
 * Content Freshness Indicator
 * Tracks when content was last updated for AI preference signals
 */
export interface FreshnessSignal {
  lastUpdated: string;
  daysSinceUpdate: number;
  shouldRefresh: boolean;
  estimatedDecayRate: number; // Percentage per month
}

export const calculateFreshnessSignal = (post: Post): FreshnessSignal => {
  const lastUpdate = new Date(post.updated_at || post.published_at || post.created_at);
  const now = new Date();
  const daysSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (24 * 60 * 60 * 1000));
  
  // Content type determines decay rate
  const isTimelyTopic = ["AI", "Technology", "Trends"].some(
    (keyword) => post.title.includes(keyword)
  );
  const decayRate = isTimelyTopic ? 2 : 0.5; // % per month

  return {
    lastUpdated: lastUpdate.toISOString(),
    daysSinceUpdate,
    shouldRefresh: daysSinceUpdate > 90, // Refresh quarterly
    estimatedDecayRate: decayRate,
  };
};

/**
 * Strip HTML and Markdown
 */
function stripHtmlAndMarkdown(text: string): string {
  return text
    .replace(/<[^>]*>/g, "") // Remove HTML
    .replace(/[*_~`]/g, "") // Remove markdown emphasis
    .replace(/\[(.+?)\]\(.+?\)/g, "$1") // Convert markdown links to text
    .replace(/#+\s*/g, ""); // Remove markdown headings
}

/**
 * Batch Vector Embedding Configuration
 * Generates chunking strategy for vector database storage
 */
export interface VectorEmbeddingConfig {
  chunkSize: number;
  chunkOverlap: number;
  modelName: string;
  totalChunks: number;
  estimatedTokens: number;
}

export const generateVectorEmbeddingConfig = (
  postContent: string,
  chunkSize: number = 800
): VectorEmbeddingConfig => {
  const estimatedTokens = Math.ceil(postContent.length / 4); // Rough estimate
  const totalChunks = Math.ceil(estimatedTokens / chunkSize);
  const chunkOverlap = Math.floor(chunkSize * 0.2); // 20% overlap

  return {
    chunkSize,
    chunkOverlap,
    modelName: "text-embedding-3-large",
    totalChunks,
    estimatedTokens,
  };
};

export default {
  formatAnswerFirst,
  convertToQuestionHeaders,
  createSemanticCluster,
  extractMultimodalElements,
  generateEEATSignals,
  generateCitationMetadata,
  calculateFreshnessSignal,
  generateVectorEmbeddingConfig,
};
