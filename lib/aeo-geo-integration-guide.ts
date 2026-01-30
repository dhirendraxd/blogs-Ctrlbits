/**
 * Integration Guide: Using LLM/AEO/GEO Schemas in Article Pages
 * 
 * This file shows how to integrate the optimization schemas into existing
 * article pages and components.
 * 
 * Usage:
 * 1. Import schemas: import { generateArticleSchema, generateFAQSchema } from '@/lib/aeo-geo-schema'
 * 2. Generate schema: const schema = generateArticleSchema(post, siteUrl, author)
 * 3. Add to head: <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
 * 4. Apply utilities: const formatted = formatAnswerFirst(post.content, post.title)
 */

// ============================================================================
// EXAMPLE 1: Article Page with Full AEO/GEO Optimization
// ============================================================================

// File: app/post/[slug]/PostViewPageClient.tsx
// Add these imports at the top:

import {
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generatePersonSchema,
  generateMultimodalSchema: generateImageObjectSchema,
} from "@/lib/aeo-geo-schema";

import {
  formatAnswerFirst,
  convertToQuestionHeaders,
  extractMultimodalElements,
  generateEEATSignals,
  generateCitationMetadata,
  calculateFreshnessSignal,
} from "@/lib/aeo-geo-utils";

// In the component, add to render:

export default function PostViewPageClient({ initialPost }: PostViewPageClientProps) {
  const siteUrl = "https://blog.ctrlbits.com";

  // 1. Generate all schemas
  const articleSchema = generateArticleSchema(initialPost, siteUrl, initialPost.author);
  
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Articles", url: "/articles" },
    ...(initialPost.category ? [{ name: initialPost.category.name, url: `/categories/${initialPost.category.slug}` }] : []),
    { name: initialPost.title, url: `/post/${initialPost.slug}` },
  ];
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs, siteUrl);

  const authorSchema = generatePersonSchema(
    initialPost.author,
    siteUrl,
    initialPost.tags.map(t => t.name)
  );

  const multimodalElements = extractMultimodalElements(initialPost);

  const eeataSignals = generateEEATSignals(initialPost, initialPost.author);

  const freshness = calculateFreshnessSignal(initialPost);

  // 2. Format content for AEO
  const formattedContent = formatAnswerFirst(initialPost.content, initialPost.title);
  const questionHeaders = convertToQuestionHeaders(initialPost.content);

  // 3. Add schemas to page head
  return (
    <>
      {/* Add all schemas to head */}
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(authorSchema) }}
        />
        
        {/* Multimodal schemas for images */}
        {multimodalElements.map((element, idx) => (
          <script
            key={idx}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(
                generateImageObjectSchema(
                  element.imageUrl,
                  element.altText,
                  element.caption || "",
                  new Date().toISOString()
                )
              ),
            }}
          />
        ))}
      </head>

      {/* Display E-E-A-T signals */}
      <div className="mb-4 p-4 bg-blue-50 rounded">
        <p className="text-sm text-gray-600">
          ✓ Expertise: {eeataSignals.expertiseKeywords.join(", ")}
        </p>
        <p className="text-sm text-gray-600">
          ✓ Experience: {eeataSignals.experienceYears} years
        </p>
        <p className="text-sm text-gray-600">
          ✓ Authority Score: {(eeataSignals.authorityScore * 100).toFixed(0)}%
        </p>
        {freshness.shouldRefresh && (
          <p className="text-sm text-yellow-600 font-bold">
            ⚠️ This article should be refreshed (last updated {freshness.daysSinceUpdate} days ago)
          </p>
        )}
      </div>

      {/* Display answer snippet prominently for AEO */}
      <div className="mb-6 p-4 bg-gray-100 rounded border-l-4 border-blue-500">
        <h3 className="font-bold text-sm text-gray-700 mb-2">Quick Answer</h3>
        <p className="text-gray-800 font-light">
          {formattedContent.answerSnippet}
        </p>
      </div>

      {/* Content with optimized question-based headers */}
      <div className="prose">
        {questionHeaders}
      </div>

      {/* Display questions for FAQ schema */}
      {formattedContent.questions.length > 0 && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-bold mb-4">Key Questions</h3>
          <ul className="space-y-2">
            {formattedContent.questions.map((q, idx) => (
              <li key={idx} className="text-sm text-gray-700">
                • {q}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Key takeaways */}
      {formattedContent.keyTakeaways.length > 0 && (
        <div className="mt-8 bg-green-50 p-4 rounded">
          <h3 className="font-bold mb-3">Key Takeaways</h3>
          <ul className="space-y-2">
            {formattedContent.keyTakeaways.map((takeaway, idx) => (
              <li key={idx} className="text-sm text-gray-700 flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

// ============================================================================
// EXAMPLE 2: Category Page with Semantic Clustering
// ============================================================================

// File: app/categories/[slug]/CategoryViewPageClient.tsx

import { createSemanticCluster } from "@/lib/aeo-geo-utils";
import {
  generateCollectionSchema,
  generateBreadcrumbSchema,
} from "@/lib/aeo-geo-schema";

export default function CategoryPage({
  category,
  posts,
}: {
  category: Category;
  posts: Post[];
}) {
  const siteUrl = "https://blog.ctrlbits.com";

  // Create semantic cluster for this category
  const cluster = createSemanticCluster(
    category.name,
    posts,
    posts.map((p) => p.title)
  );

  // Generate schemas
  const collectionSchema = generateCollectionSchema(category, siteUrl, posts);
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Categories", url: "/categories" },
    { name: category.name, url: `/categories/${category.slug}` },
  ];
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs, siteUrl);

  return (
    <>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      </head>

      {/* Topic Universe Coverage */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Complete Topic Coverage</h2>
        <div className="flex items-center mb-4">
          <div className="w-full bg-gray-200 rounded h-2">
            <div
              className="bg-blue-500 h-2 rounded"
              style={{ width: `${cluster.semanticScore * 100}%` }}
            />
          </div>
          <span className="ml-3 text-sm font-bold">
            {(cluster.semanticScore * 100).toFixed(0)}% coverage
          </span>
        </div>

        {/* Subtopics in this universe */}
        <div>
          <h3 className="font-bold text-sm text-gray-700 mb-3">
            Subtopics We Cover:
          </h3>
          <div className="flex flex-wrap gap-2">
            {cluster.subtopics.map((subtopic) => (
              <span
                key={subtopic}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {subtopic}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Display posts ranked by semantic relevance */}
      <div className="grid gap-4">
        {cluster.relatedPosts.map((post) => (
          <a key={post.id} href={`/post/${post.slug}`} className="p-4 border rounded hover:bg-gray-50">
            <h3 className="font-bold">{post.title}</h3>
            <p className="text-sm text-gray-600 mt-2">{post.excerpt}</p>
          </a>
        ))}
      </div>
    </>
  );
}

// ============================================================================
// EXAMPLE 3: How-To Article with Schema
// ============================================================================

// For process-based content:

import { generateHowToSchema } from "@/lib/aeo-geo-schema";

const howToSteps = [
  {
    name: "Step 1: Setup Environment",
    description: "Install Node.js and create a Next.js project",
    url: "/post/how-to-setup#step-1",
  },
  {
    name: "Step 2: Install Dependencies",
    description: "npm install required packages for your project",
    url: "/post/how-to-setup#step-2",
  },
  // ... more steps
];

const howToSchema = generateHowToSchema(
  "How to Setup Next.js with Tailwind",
  "Complete guide to setting up a modern Next.js project",
  howToSteps,
  "https://blog.ctrlbits.com/post/how-to-setup",
  "https://blog.ctrlbits.com/og-how-to.jpg"
);

// ============================================================================
// EXAMPLE 4: FAQ Article with Schema
// ============================================================================

import { generateFAQSchema } from "@/lib/aeo-geo-schema";

const faqs = [
  {
    question: "What is React?",
    answer: "React is a JavaScript library for building user interfaces with components.",
  },
  {
    question: "Why use React?",
    answer: "React offers component reusability, efficient rendering, and large ecosystem.",
  },
  // ... more FAQs
];

const faqSchema = generateFAQSchema(
  faqs,
  "https://blog.ctrlbits.com/post/react-faq"
);

// ============================================================================
// IMPLEMENTATION CHECKLIST FOR CONTENT TEAM
// ============================================================================

export const CONTENT_TEAM_CHECKLIST = `
When Creating New Articles:

1. Answer-First Format ✓
   - [ ] Start each section with a 40-60 word answer
   - [ ] Make sure first paragraph answers the heading question
   - [ ] Place key insights in bold for extraction

2. Question-Based Headings ✓
   - [ ] Convert all headings to questions
   - [ ] Use natural language users would search
   - [ ] Example: "What is..." "How do I..." "Why should..."

3. Structured Data ✓
   - [ ] Identify if content is HowTo or FAQ
   - [ ] Add numbered steps for HowTo content
   - [ ] Add Q&A pairs for FAQ content

4. Semantic Markup ✓
   - [ ] Use semantic HTML elements (<article>, <section>, <header>)
   - [ ] Mark up bold/important text properly
   - [ ] Structure lists with <ul> and <ol>

5. Multimodal Content ✓
   - [ ] Add descriptive alt text to all images
   - [ ] Include image captions
   - [ ] Add transcripts for embedded videos

6. E-E-A-T Signals ✓
   - [ ] Include author expertise in byline
   - [ ] Link to author's verified social profiles
   - [ ] Add credentials or relevant experience
   - [ ] Include sources and citations

7. Content Freshness ✓
   - [ ] Add publication date
   - [ ] Update old content quarterly
   - [ ] Add "Last updated" timestamp

8. Topic Clustering ✓
   - [ ] Link to related articles
   - [ ] Use consistent terminology
   - [ ] Build out complete topic universes
`;

console.log(CONTENT_TEAM_CHECKLIST);
