// The Emmanuel Growth visibility check standard: every rule in one editable place.
//
// Honesty rules for this file:
// - Google publishes no minimums for any of these. Every threshold here is OUR BASELINE,
//   chosen as a sensible starting point, and is labelled that way wherever it is shown.
// - No invented statistics, fear wording or fake scarcity.
// - Effort is a rough estimate for a typical small business, not a promise.

export type Status = 'Good' | 'Needs attention' | 'Problem' | 'Couldn’t check' | 'Not checked automatically';
export type Priority = 'Fix first' | 'Next' | 'Later';
export type AreaId = 'profile' | 'reviews' | 'website' | 'search' | 'contact' | 'speed' | 'consistency';

export type Rule = {
  id: string;
  area: AreaId;
  label: string;
  measured: string; // how we measure it
  thresholds: { good: string; attention?: string; problem?: string };
  baseline: boolean; // true = the thresholds are our baseline, not a Google requirement
  why: string; // one plain sentence
  priority: Priority;
  effort: string; // rough estimate
  mode: 'automatic' | 'manual';
  action: string; // short name of the fix (no step-by-step instructions)
  issue?: string; // rules with the same issue share one slot in the Top 3 fixes
  note?: string;
};

export const BASELINE_LABEL = 'Our baseline. Google publishes no minimum.';

// Numbers used by the rules. Change them here.
export const limits = {
  photosGood: 10, // Places returns at most 10 photos, so 10 means "10 or more"
  ratingGood: 4.5,
  recentReviewDays: 60,
  reviewsHalfOfTypical: 0.5,
  reviewsQuarterOfTypical: 0.25,
  reviewsFloor: 10, // under this many reviews is a Problem whatever the area looks like
  speedGood: 90,
  speedAttention: 50,
};

export const areaTitles: Record<AreaId, string> = {
  profile: 'Google business profile',
  reviews: 'Reviews compared with nearby businesses',
  website: 'Website basics',
  search: 'Search engines and AI assistants',
  contact: 'Ways to contact you on your website',
  speed: 'Website speed on a phone',
  consistency: 'Name, address and phone consistency',
};

export const rules: Rule[] = [
  // Google business profile
  {
    id: 'gbp-status', area: 'profile', label: 'Business status', mode: 'automatic', baseline: false,
    measured: 'The business status Google shows on the profile.',
    thresholds: { good: 'Marked as open (operational)', problem: 'Marked as temporarily or permanently closed' },
    why: 'If Google shows the business as closed, customers may not try to contact you.',
    priority: 'Fix first', effort: 'About 10 minutes', action: 'Check your business status on Google is correct',
  },
  {
    id: 'gbp-category', area: 'profile', label: 'Business category', mode: 'automatic', baseline: true,
    measured: 'The primary category Google returns for the profile, and whether it is specific or very general (for example “Services”).',
    thresholds: { good: 'A specific primary category', attention: 'A very general category, such as “Services”', problem: 'No category set' },
    why: 'Your category helps Google match you to the right searches.',
    priority: 'Fix first', effort: 'About 10 minutes', action: 'Choose a specific category so Google can match the right searches',
  },
  {
    id: 'gbp-hours', area: 'profile', label: 'Opening hours', mode: 'automatic', baseline: true,
    measured: 'Whether the profile lists opening hours for every day of the week.',
    thresholds: { good: 'Hours listed for all 7 days', attention: 'Hours missing or incomplete' },
    why: 'Clear hours help customers know when they can reach you.',
    priority: 'Next', effort: 'About 10 minutes', action: 'Add your opening hours to your Google profile',
  },
  {
    id: 'gbp-phone', area: 'profile', label: 'Phone number', mode: 'automatic', baseline: true,
    measured: 'Whether the profile lists a phone number.',
    thresholds: { good: 'Phone number present', problem: 'No phone number' },
    why: 'A phone number on your profile lets customers call you straight from Google.',
    priority: 'Fix first', effort: 'About 5 minutes', action: 'Add your phone number to your Google profile',
  },
  {
    id: 'gbp-website', area: 'profile', label: 'Website link', mode: 'automatic', baseline: true,
    measured: 'Whether the profile links to a real website (not a social or link-in-bio page).',
    thresholds: { good: 'Links to a real website', attention: 'No website, or a social / link-in-bio page instead' },
    why: 'A website gives customers one place to see your services, work and contact options.',
    priority: 'Next', effort: 'A few days for a simple site', action: 'Add a simple website and link it from your Google profile', issue: 'website',
  },
  {
    id: 'gbp-photos', area: 'profile', label: 'Photos', mode: 'automatic', baseline: true,
    measured: 'Number of photos Google returns for the profile. Google returns at most 10, so 10 means “10 or more”.',
    thresholds: { good: '10 or more', attention: '1 to 9', problem: 'None' },
    why: 'Photos help customers see what you do before they get in touch.',
    priority: 'Next', effort: 'About 30 minutes', action: 'Add more photos of your work, team and premises',
  },
  {
    id: 'gbp-description', area: 'profile', label: 'Business description', mode: 'manual', baseline: false,
    measured: 'Not available from Google’s data, so not checked automatically.',
    thresholds: { good: 'A clear description of what you do and where' },
    why: 'A description isn’t a ranking factor, but it can help customers trust they’ve found the right business.',
    priority: 'Later', effort: 'About 15 minutes', action: 'Write a clear business description',
    note: 'Customer-trust note only.',
  },
  {
    id: 'gbp-videos', area: 'profile', label: 'Videos', mode: 'manual', baseline: false,
    measured: 'Not available from Google’s data, so not checked automatically.',
    thresholds: { good: 'Some short videos of your work' },
    why: 'Short videos can show customers your work and premises.',
    priority: 'Later', effort: 'About 30 minutes', action: 'Add a few short videos to your profile',
  },
  {
    id: 'gbp-total-photos', area: 'profile', label: 'Total photo count', mode: 'manual', baseline: false,
    measured: 'Google only returns up to 10 photos, so the full count is not checked automatically.',
    thresholds: { good: 'Regularly updated photos' },
    why: 'Fresh photos show customers the business is active.',
    priority: 'Later', effort: 'About 15 minutes a month', action: 'Keep adding new photos',
  },

  // Reviews
  {
    id: 'reviews-count', area: 'reviews', label: 'Review count compared with nearby businesses', mode: 'automatic', baseline: true,
    measured: 'Your Google review count compared with the typical (median) count of nearby businesses with the same Google category. Only compared when your category is specific and we find at least 3 of them.',
    thresholds: { good: 'At or above the typical count', attention: 'Under half of the typical count', problem: 'Under a quarter of the typical count, or fewer than 10 reviews' },
    why: 'Customers often compare a few local options side by side, and reviews are one of the first things they see.',
    priority: 'Fix first', effort: 'A few minutes after each job', action: 'Ask every happy customer for a Google review', issue: 'reviews',
    note: 'Between half and the typical count is shown as Good (close to typical), unless you have fewer than 10 reviews.',
  },
  {
    id: 'reviews-rating', area: 'reviews', label: 'Star rating', mode: 'automatic', baseline: true,
    measured: 'Your average Google rating.',
    thresholds: { good: '4.5 or higher', attention: 'Below 4.5, or no rating yet' },
    why: 'Your rating is shown next to your name in search results and on Maps.',
    priority: 'Next', effort: 'Ongoing', action: 'Ask happy customers for reviews and reply to every review', issue: 'reviews',
  },
  {
    id: 'reviews-recent', area: 'reviews', label: 'Recent review', mode: 'manual', baseline: true,
    measured: 'Google returns at most 5 reviews, sorted by relevance rather than date, so the newest review can’t be checked reliably.',
    thresholds: { good: 'At least one review in the last 60 days (check on your profile)' },
    why: 'Recent reviews show customers the business is active.',
    priority: 'Next', effort: 'A few minutes after each job', action: 'Ask recent customers for a Google review', issue: 'reviews',
  },
  {
    id: 'reviews-owner-replies', area: 'reviews', label: 'Replies to reviews', mode: 'manual', baseline: false,
    measured: 'Google’s data doesn’t include owner replies, so not checked automatically.',
    thresholds: { good: 'You reply to reviews, good and bad' },
    why: 'Replies show customers you care about feedback.',
    priority: 'Later', effort: 'A few minutes a week', action: 'Reply to your reviews',
  },

  // Website basics
  {
    id: 'web-https', area: 'website', label: 'Secure https', mode: 'automatic', baseline: false,
    measured: 'Whether the home page loads on a secure https address.',
    thresholds: { good: 'Loads on https', problem: 'Loads on plain http' },
    why: 'Browsers warn visitors about pages that aren’t secure.',
    priority: 'Fix first', effort: 'About an hour', action: 'Switch your website to https',
  },
  {
    id: 'web-mobile', area: 'website', label: 'Mobile layout', mode: 'automatic', baseline: false,
    measured: 'Whether the page sets a mobile viewport.',
    thresholds: { good: 'Mobile viewport set', attention: 'No mobile viewport' },
    why: 'Most local searches happen on phones, and the page needs to fit the screen.',
    priority: 'Fix first', effort: 'Depends on the site', action: 'Make your website fit phone screens',
  },
  {
    id: 'web-title', area: 'website', label: 'Page title', mode: 'automatic', baseline: false,
    measured: 'Whether the home page has a title.',
    thresholds: { good: 'Title present', attention: 'No title' },
    why: 'The title is usually the headline Google shows for your page.',
    priority: 'Next', effort: 'About 10 minutes', action: 'Add a page title that says what you do and where',
  },
  {
    id: 'web-description', area: 'website', label: 'Search description', mode: 'automatic', baseline: false,
    measured: 'Whether the home page has a meta description.',
    thresholds: { good: 'Description present', attention: 'No description' },
    why: 'Google may use it as the short text under your page title.',
    priority: 'Later', effort: 'About 10 minutes', action: 'Add a short search description',
  },
  {
    id: 'web-h1', area: 'website', label: 'Main heading (H1)', mode: 'automatic', baseline: true,
    measured: 'Number of H1 headings on the home page.',
    thresholds: { good: 'Exactly one H1', attention: 'No H1, or more than one' },
    why: 'One clear main heading helps visitors and search engines see what the page is about.',
    priority: 'Later', effort: 'About 10 minutes', action: 'Use one clear main heading that says what you do',
  },
  {
    id: 'web-open-graph', area: 'website', label: 'Sharing tags (Open Graph)', mode: 'automatic', baseline: false,
    measured: 'Whether the page has og:title and og:image tags.',
    thresholds: { good: 'Title and image tags present', attention: 'Missing' },
    why: 'They control how your link looks when someone shares it.',
    priority: 'Later', effort: 'About 15 minutes', action: 'Add sharing tags so shared links show a title and image',
  },

  // Search engines and AI assistants
  {
    id: 'search-indexable', area: 'search', label: 'Open to search engines', mode: 'automatic', baseline: false,
    measured: 'Whether robots.txt blocks all crawlers, or the page asks not to be listed (noindex).',
    thresholds: { good: 'Not blocked', problem: 'Blocked by robots.txt or noindex' },
    why: 'If search engines are blocked, your site can’t appear in search results.',
    priority: 'Fix first', effort: 'About 15 minutes', action: 'Let search engines read your website',
  },
  {
    id: 'search-sitemap', area: 'search', label: 'Sitemap', mode: 'automatic', baseline: false,
    measured: 'Whether a sitemap.xml is found (linked from robots.txt or at /sitemap.xml).',
    thresholds: { good: 'Sitemap found', attention: 'No sitemap found' },
    why: 'A sitemap helps search engines find all your pages.',
    priority: 'Later', effort: 'About 15 minutes', action: 'Add a sitemap.xml',
  },
  {
    id: 'search-schema', area: 'search', label: 'LocalBusiness structured data', mode: 'automatic', baseline: true,
    measured: 'Whether the page has LocalBusiness (or similar) structured data with name, address, phone, hours, website, image and social links.',
    thresholds: { good: 'Present with all seven details', attention: 'Present but missing details, or not present' },
    why: 'Structured data spells out your business details in a format search engines and AI assistants read directly.',
    priority: 'Next', effort: 'About an hour', action: 'Add LocalBusiness structured data with your full details',
    note: 'We don’t recommend adding review or AggregateRating markup about your own business. FAQ markup is optional.',
  },
  {
    id: 'search-ai-crawlers', area: 'search', label: 'AI assistants can read the site', mode: 'automatic', baseline: true,
    measured: 'Whether robots.txt blocks GPTBot, ChatGPT-User, PerplexityBot, Google-Extended or ClaudeBot.',
    thresholds: { good: 'None blocked', attention: 'One or more blocked' },
    why: 'AI assistants can only describe your business from your site if they’re allowed to read it.',
    priority: 'Later', effort: 'About 10 minutes', action: 'Decide whether AI assistants may read your site',
    note: 'Blocking them can be a deliberate choice.',
  },

  // Contact
  {
    id: 'contact-links', area: 'contact', label: 'Tap to call, WhatsApp or book', mode: 'automatic', baseline: true,
    measured: 'Tap-to-call (tel:), WhatsApp (wa.me) and booking links on the home page.',
    thresholds: { good: 'At least one one-tap way to call, message or book', attention: 'None found' },
    why: 'One-tap contact makes it easy for interested visitors to reach you.',
    priority: 'Fix first', effort: 'About 15 minutes', action: 'Add a tap-to-call, WhatsApp or booking button',
  },

  // Speed
  {
    id: 'speed-mobile', area: 'speed', label: 'Mobile speed score', mode: 'automatic', baseline: true,
    measured: 'Google PageSpeed Insights performance score on mobile.',
    thresholds: { good: '90 or higher', attention: '50 to 89', problem: 'Under 50' },
    why: 'A page that loads slowly on a phone is easy to give up on.',
    priority: 'Next', effort: 'Depends on the site', action: 'Speed up your website on phones',
  },

  // Consistency
  {
    id: 'consistency-nap', area: 'consistency', label: 'Name, address and phone match', mode: 'automatic', baseline: true,
    measured: 'Whether the name, address and phone on your website match your Google profile.',
    thresholds: { good: 'All three match', attention: 'One or more differ or are missing from the website' },
    why: 'Matching details help customers and search engines trust they’ve found the right business.',
    priority: 'Next', effort: 'About 30 minutes', action: 'Use the same name, address and phone on your website and Google',
  },
];

// Quickest first; used to order the Top 3 fixes after status and priority. Edit alongside each rule's effort.
export const effortOrder: Record<string, number> = {
  'About 5 minutes': 1,
  'About 10 minutes': 2,
  'About 15 minutes': 3,
  'A few minutes after each job': 3,
  'About 15 minutes a month': 3,
  'A few minutes a week': 3,
  'About 30 minutes': 4,
  'About an hour': 5,
  Ongoing: 6,
  'Depends on the site': 7,
  'A few days for a simple site': 8,
};

export const priorityOrder: Record<Priority, number> = { 'Fix first': 0, Next: 1, Later: 2 };

export const ruleById = Object.fromEntries(rules.map((r) => [r.id, r])) as Record<string, Rule>;
