export type SectionCategory = {
  name: string
  slug: string
  description: string
}

export const SECTION_CATEGORIES: SectionCategory[] = [
  {
    name: 'Featured',
    slug: 'featured',
    description: 'Top stories from Modern Patriots.',
  },
  {
    name: 'News',
    slug: 'news',
    description: 'The latest reporting from across the country and around the world.',
  },
  {
    name: 'Politics',
    slug: 'politics',
    description: 'Campaigns, policy, and the people shaping Washington.',
  },
  {
    name: 'World',
    slug: 'world',
    description: 'Global events and what they mean back home.',
  },
  {
    name: 'Election',
    slug: 'election',
    description: 'Results, analysis, and the road ahead.',
  },
  {
    name: 'Opinion',
    slug: 'opinion',
    description: 'Commentary and argument from our contributors.',
  },
]

/** First match wins — Opinion → Election → Politics → World */
export const SECTION_KEYWORD_RULES: Array<{ slug: string; pattern: RegExp }> = [
  {
    slug: 'opinion',
    pattern:
      /\b(opinion|commentary|editorial|in my view|we believe|op-ed)\b/i,
  },
  {
    slug: 'election',
    pattern:
      /\b(election|trump|harris|ballot|vote|voting|polling|primary|campaign|gop|electoral|presidential race|nominee|swing state)\b/i,
  },
  {
    slug: 'politics',
    pattern:
      /\b(congress|senate|biden|impeach|republican|democrat|white house|governor|mayor|legislat|politic|capitol|subpoena|corruption|scotus|supreme court|fbi|doj)\b/i,
  },
  {
    slug: 'world',
    pattern:
      /\b(china|mexico|israel|ukraine|iran|russia|foreign|global|international|nato|europe|middle east|border|immigrant|illegal alien|gaza|hamas|taiwan|north korea)\b/i,
  },
]

export function matchSectionSlug(text: string): string | null {
  for (const rule of SECTION_KEYWORD_RULES) {
    if (rule.pattern.test(text)) return rule.slug
  }
  return null
}

export function getPostSearchText(post: {
  title?: string | null
  excerpt?: string | null
  content?: unknown
}): string {
  const contentText =
    typeof post.content === 'object' &&
    post.content !== null &&
    'root' in post.content
      ? JSON.stringify(post.content).slice(0, 4000)
      : String(post.content || '')

  return [post.title, post.excerpt, contentText].filter(Boolean).join(' ')
}
