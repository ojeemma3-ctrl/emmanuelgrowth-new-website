// The Emmanuel Growth visibility check standard: every rule in one editable place.
//
// Honesty rules for this file:
// - Google publishes no minimums for any of these. Every threshold here is OUR BASELINE,
//   chosen as a sensible starting point, and is labelled that way wherever it is shown.
// - No invented statistics, fear wording or fake scarcity.
// - Effort is a rough estimate for a typical small business, not a promise.

export type Status = 'Good' | 'Needs attention' | 'Problem' | 'Couldn’t check' | 'Couldn’t compare fairly' | 'Not checked automatically';

// Only these statuses come from a real measurement and count towards "checks passed".
export const isMeasured = (status: Status) => status === 'Good' || status === 'Needs attention' || status === 'Problem';

// Priority shown to visitors: every Problem is "Fix first"; Needs attention is "Next" or "Later"
// (a rule's "Fix first" becomes "Next"); Good and unmeasured items show no priority or effort.
export function displayPriority(rule: { priority: Priority }, status: Status): Priority | null {
  if (status === 'Problem') return 'Fix first';
  if (status === 'Needs attention') return rule.priority === 'Later' ? 'Later' : 'Next';
  return null;
}

// Numbers with thousands separators: 3,523 and 16,389.
export const formatCount = (n: number) => n.toLocaleString('en-GB', { maximumFractionDigits: 1 });
export type Priority = 'Fix first' | 'Next' | 'Later';
export type AreaId = 'profile' | 'reviews' | 'website' | 'search' | 'contact' | 'speed' | 'consistency';

export type Rule = {
  id: string;
  area: AreaId;
  displayName: string; // plain-English name shown as the title
  technicalName: string | null; // shown as small grey text when it helps; null when the plain name says it all
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
    id: 'gbp-status', area: 'profile', displayName: 'Business status', technicalName: null, mode: 'automatic', baseline: false,
    measured: 'The business status Google shows on the profile.',
    thresholds: { good: 'Marked as open (operational)', problem: 'Marked as temporarily or permanently closed' },
    why: 'If Google shows the business as closed, customers may not try to contact you.',
    priority: 'Fix first', effort: 'About 10 minutes', action: 'Check your business status on Google is correct',
  },
  {
    id: 'gbp-category', area: 'profile', displayName: 'Business category', technicalName: null, mode: 'automatic', baseline: true,
    measured: 'The primary category Google returns for the profile, and whether it is specific or very general (for example “Services”).',
    thresholds: { good: 'A specific primary category', attention: 'A very general category, such as “Services”', problem: 'No category set' },
    why: 'Your category helps Google match you to the right searches.',
    priority: 'Fix first', effort: 'About 10 minutes', action: 'Choose a specific category so Google can match the right searches',
  },
  {
    id: 'gbp-hours', area: 'profile', displayName: 'Opening hours', technicalName: null, mode: 'automatic', baseline: true,
    measured: 'Whether the profile lists opening hours for every day of the week.',
    thresholds: { good: 'Hours listed for all 7 days', attention: 'Hours missing or incomplete' },
    why: 'Clear hours help customers know when they can reach you.',
    priority: 'Next', effort: 'About 10 minutes', action: 'Add your opening hours to your Google profile',
  },
  {
    id: 'gbp-phone', area: 'profile', displayName: 'Phone number', technicalName: null, mode: 'automatic', baseline: true,
    measured: 'Whether the profile lists a phone number.',
    thresholds: { good: 'Phone number present', problem: 'No phone number' },
    why: 'A phone number on your profile lets customers call you straight from Google.',
    priority: 'Fix first', effort: 'About 5 minutes', action: 'Add your phone number to your Google profile',
  },
  {
    id: 'gbp-website', area: 'profile', displayName: 'Website link', technicalName: null, mode: 'automatic', baseline: true,
    measured: 'Whether the profile links to a real website (not a social or link-in-bio page).',
    thresholds: { good: 'Links to a real website', attention: 'No website, or a social / link-in-bio page instead' },
    why: 'A website gives customers one place to see your services, work and contact options.',
    priority: 'Next', effort: 'A few days for a simple site', action: 'Add a simple website and link it from your Google profile', issue: 'website',
  },
  {
    id: 'gbp-photos', area: 'profile', displayName: 'Photos', technicalName: null, mode: 'automatic', baseline: true,
    measured: 'Number of photos Google returns for the profile. Google returns at most 10, so 10 means “10 or more”.',
    thresholds: { good: '10 or more', attention: '1 to 9', problem: 'None' },
    why: 'Photos help customers see what you do before they get in touch.',
    priority: 'Next', effort: 'About 30 minutes', action: 'Add more photos of your work, team and premises',
  },
  {
    id: 'gbp-description', area: 'profile', displayName: 'Business description', technicalName: null, mode: 'manual', baseline: false,
    measured: 'Not available from Google’s data, so not checked automatically.',
    thresholds: { good: 'A clear description of what you do and where' },
    why: 'A description isn’t a ranking factor, but it can help customers trust they’ve found the right business.',
    priority: 'Later', effort: 'About 15 minutes', action: 'Write a clear business description',
    note: 'Customer-trust note only.',
  },
  {
    id: 'gbp-videos', area: 'profile', displayName: 'Videos', technicalName: null, mode: 'manual', baseline: false,
    measured: 'Not available from Google’s data, so not checked automatically.',
    thresholds: { good: 'Some short videos of your work' },
    why: 'Short videos can show customers your work and premises.',
    priority: 'Later', effort: 'About 30 minutes', action: 'Add a few short videos to your profile',
  },
  {
    id: 'gbp-total-photos', area: 'profile', displayName: 'Total photo count', technicalName: null, mode: 'manual', baseline: false,
    measured: 'Google only returns up to 10 photos, so the full count is not checked automatically.',
    thresholds: { good: 'Regularly updated photos' },
    why: 'Fresh photos show customers the business is active.',
    priority: 'Later', effort: 'About 15 minutes a month', action: 'Keep adding new photos',
  },

  // Reviews
  {
    id: 'reviews-count', area: 'reviews', displayName: 'Review count compared with nearby businesses', technicalName: null, mode: 'automatic', baseline: true,
    measured: 'Your Google review count compared with the typical (median) count of nearby businesses with the same Google category. Only compared when your category is specific and we find at least 3 of them.',
    thresholds: { good: 'At or above the typical count', attention: 'Under half of the typical count', problem: 'Under a quarter of the typical count, or fewer than 10 reviews' },
    why: 'Customers often compare a few local options side by side, and reviews are one of the first things they see.',
    priority: 'Fix first', effort: 'A few minutes after each job', action: 'Ask every happy customer for a Google review', issue: 'reviews',
    note: 'Between half and the typical count is shown as Good (close to typical), unless you have fewer than 10 reviews.',
  },
  {
    id: 'reviews-rating', area: 'reviews', displayName: 'Star rating', technicalName: null, mode: 'automatic', baseline: true,
    measured: 'Your average Google rating.',
    thresholds: { good: '4.5 or higher', attention: 'Below 4.5, or no rating yet' },
    why: 'Your rating is shown next to your name in search results and on Maps.',
    priority: 'Next', effort: 'Ongoing', action: 'Ask happy customers for reviews and reply to every review', issue: 'reviews',
  },
  {
    id: 'reviews-recent', area: 'reviews', displayName: 'Recent review', technicalName: null, mode: 'manual', baseline: true,
    measured: 'Google returns at most 5 reviews, sorted by relevance rather than date, so the newest review can’t be checked reliably.',
    thresholds: { good: 'At least one review in the last 60 days (check on your profile)' },
    why: 'Recent reviews show customers the business is active.',
    priority: 'Next', effort: 'A few minutes after each job', action: 'Ask recent customers for a Google review', issue: 'reviews',
  },
  {
    id: 'reviews-owner-replies', area: 'reviews', displayName: 'Replies to reviews', technicalName: null, mode: 'manual', baseline: false,
    measured: 'Google’s data doesn’t include owner replies, so not checked automatically.',
    thresholds: { good: 'You reply to reviews, good and bad' },
    why: 'Replies show customers you care about feedback.',
    priority: 'Later', effort: 'A few minutes a week', action: 'Reply to your reviews',
  },

  // Website basics
  {
    id: 'web-https', area: 'website', displayName: 'Secure connection (padlock)', technicalName: 'HTTPS', mode: 'automatic', baseline: false,
    measured: 'Whether the home page loads on a secure https address.',
    thresholds: { good: 'Loads on https', problem: 'Loads on plain http' },
    why: 'Browsers warn visitors about pages that aren’t secure.',
    priority: 'Fix first', effort: 'About an hour', action: 'Switch your website to https',
  },
  {
    id: 'web-mobile', area: 'website', displayName: 'Fits phone screens', technicalName: 'Mobile viewport', mode: 'automatic', baseline: false,
    measured: 'Whether the page sets a mobile viewport.',
    thresholds: { good: 'Mobile viewport set', attention: 'No mobile viewport' },
    why: 'Most local searches happen on phones, and the page needs to fit the screen.',
    priority: 'Fix first', effort: 'Depends on the site', action: 'Make your website fit phone screens',
  },
  {
    id: 'web-title', area: 'website', displayName: 'Page title', technicalName: 'Title tag', mode: 'automatic', baseline: false,
    measured: 'Whether the home page has a title.',
    thresholds: { good: 'Title present', attention: 'No title' },
    why: 'The title is usually the headline Google shows for your page.',
    priority: 'Next', effort: 'About 10 minutes', action: 'Add a page title that says what you do and where',
  },
  {
    id: 'web-description', area: 'website', displayName: 'Search description', technicalName: 'Meta description', mode: 'automatic', baseline: false,
    measured: 'Whether the home page has a meta description.',
    thresholds: { good: 'Description present', attention: 'No description' },
    why: 'Google may use it as the short text under your page title.',
    priority: 'Later', effort: 'About 10 minutes', action: 'Add a short search description',
  },
  {
    id: 'web-h1', area: 'website', displayName: 'Main page heading', technicalName: 'H1', mode: 'automatic', baseline: true,
    measured: 'Number of H1 headings on the home page.',
    thresholds: { good: 'Exactly one H1', attention: 'No H1, or more than one' },
    why: 'One clear main heading helps visitors and search engines see what the page is about.',
    priority: 'Later', effort: 'About 10 minutes', action: 'Use one clear main heading that says what you do',
  },
  {
    id: 'web-open-graph', area: 'website', displayName: 'Link preview when shared', technicalName: 'Open Graph tags', mode: 'automatic', baseline: false,
    measured: 'Whether the page has og:title and og:image tags.',
    thresholds: { good: 'Title and image tags present', attention: 'Missing' },
    why: 'They control how your link looks when someone shares it.',
    priority: 'Later', effort: 'About 15 minutes', action: 'Add sharing tags so shared links show a title and image',
  },

  // Search engines and AI assistants
  {
    id: 'search-indexable', area: 'search', displayName: 'Open to search engines', technicalName: 'robots.txt and noindex', mode: 'automatic', baseline: false,
    measured: 'Whether robots.txt blocks all crawlers, or the page asks not to be listed (noindex).',
    thresholds: { good: 'Not blocked', problem: 'Blocked by robots.txt or noindex' },
    why: 'If search engines are blocked, your site can’t appear in search results.',
    priority: 'Fix first', effort: 'About 15 minutes', action: 'Let search engines read your website',
  },
  {
    id: 'search-sitemap', area: 'search', displayName: 'Page list for search engines', technicalName: 'Sitemap (sitemap.xml)', mode: 'automatic', baseline: false,
    measured: 'Whether a sitemap.xml is found (linked from robots.txt or at /sitemap.xml).',
    thresholds: { good: 'Sitemap found', attention: 'No sitemap found' },
    why: 'A sitemap helps search engines find all your pages.',
    priority: 'Later', effort: 'About 15 minutes', action: 'Add a sitemap.xml',
  },
  {
    id: 'search-schema', area: 'search', displayName: 'Business details for Google and AI', technicalName: 'LocalBusiness structured data', mode: 'automatic', baseline: true,
    measured: 'Whether the page has LocalBusiness (or similar) structured data with name, address, phone, hours, website, image and social links.',
    thresholds: { good: 'Present with all seven details', attention: 'Present but missing details, or not present' },
    why: 'Structured data spells out your business details in a format search engines and AI assistants read directly.',
    priority: 'Next', effort: 'About an hour', action: 'Add LocalBusiness structured data with your full details',
    note: 'We don’t recommend adding review or AggregateRating markup about your own business. FAQ markup is optional.',
  },
  {
    id: 'search-ai-crawlers', area: 'search', displayName: 'AI assistants can read the site', technicalName: 'AI crawler rules in robots.txt', mode: 'automatic', baseline: true,
    measured: 'Whether robots.txt blocks GPTBot, ChatGPT-User, PerplexityBot, Google-Extended or ClaudeBot.',
    thresholds: { good: 'None blocked', attention: 'One or more blocked' },
    why: 'AI assistants can only describe your business from your site if they’re allowed to read it.',
    priority: 'Later', effort: 'About 10 minutes', action: 'Decide whether AI assistants may read your site',
    note: 'Blocking them can be a deliberate choice.',
  },

  // Contact
  {
    id: 'contact-links', area: 'contact', displayName: 'Tap to call, WhatsApp or book', technicalName: null, mode: 'automatic', baseline: true,
    measured: 'Tap-to-call (tel:), WhatsApp (wa.me) and booking links on the home page.',
    thresholds: { good: 'At least one one-tap way to call, message or book', attention: 'None found' },
    why: 'One-tap contact makes it easy for interested visitors to reach you.',
    priority: 'Fix first', effort: 'About 15 minutes', action: 'Add a tap-to-call, WhatsApp or booking button',
  },

  // Speed
  {
    id: 'speed-mobile', area: 'speed', displayName: 'Mobile speed score', technicalName: 'Google PageSpeed performance', mode: 'automatic', baseline: true,
    measured: 'Google PageSpeed Insights performance score on mobile.',
    thresholds: { good: '90 or higher', attention: '50 to 89', problem: 'Under 50' },
    why: 'A page that loads slowly on a phone is easy to give up on.',
    priority: 'Next', effort: 'Depends on the site', action: 'Speed up your website on phones',
  },

  // Consistency
  {
    id: 'consistency-nap', area: 'consistency', displayName: 'Name, address and phone match', technicalName: 'NAP consistency', mode: 'automatic', baseline: true,
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

// "How to fix this": free, plain-English steps, shown on screen only (not in the PDF).
// Keyed by rule id, plus "gbp" (no Google profile) and "site-error" (website shows an error).
// Every rule that can appear in the Top 3 or in "What to fix" has steps here.
const reviewSteps = [
  'In your Google Business Profile, choose “Ask for reviews” to get your review link.',
  'Send the link to customers soon after a job goes well, by WhatsApp, text or email.',
  'Keep the message short and personal, for example: “Thanks for choosing us. Would you mind leaving a quick review?”',
  'Reply to every review, good or bad, politely and briefly.',
  'Don’t offer rewards or discounts for reviews: Google’s rules don’t allow it.',
];

export const fixSteps: Record<string, string[]> = {
  gbp: [
    'Go to google.com/business and sign in with the Google account you want to use for the business.',
    'Search for your business. Claim it if it’s already listed, or add it if it isn’t.',
    'Choose your main category and add your address or service area, phone number and opening hours.',
    'Complete the verification Google asks for.',
    'Add a few photos and a short description of what you do.',
  ],
  'site-error': [
    'Open your website address on a phone and on a computer.',
    'If it shows an error, contact your web host or website builder’s support.',
    'Check that your domain name hasn’t expired.',
    'Check that the website link on your Google profile is spelled correctly.',
  ],
  'gbp-status': [
    'Search your business name on Google while signed in to the account that manages it.',
    'Check the status shown under your business name.',
    'If it says closed by mistake, choose Edit profile, then Hours, and set “Open with main hours”.',
    'Save, then check again in a few days.',
  ],
  'gbp-category': [
    'Search your business name on Google while signed in to the account that manages it.',
    'Choose Edit profile, then Business category.',
    'Pick the most specific main category for your main service, for example “Plumber” rather than “Service”.',
    'Add a few extra categories for other services you really offer.',
    'Save. Changes can take a few days to show.',
  ],
  'gbp-hours': [
    'Open your Google profile and choose Edit profile, then Hours.',
    'Add the days and times you’re open.',
    'Add special hours for bank holidays and closures.',
    'Save, and update them whenever your hours change.',
  ],
  'gbp-phone': [
    'Open your Google profile and choose Edit profile, then Contact.',
    'Add a phone number customers can call during your opening hours.',
    'Use the same number as on your website.',
    'Save and call it once to check it works.',
  ],
  'gbp-website': [
    'Decide what one page needs to say: what you do, where, and how to contact you.',
    'Build it with a simple website builder, or ask someone to set it up for you.',
    'In your Google profile, choose Edit profile, then Contact, and add the website address.',
    'Keep your social pages, and link to them from the website.',
  ],
  'gbp-photos': [
    'Take clear photos of your work, your team, inside your premises and the outside, so people recognise it.',
    'In your Google profile, choose Add photos.',
    'Add at least 10 photos in good light, without heavy filters.',
    'Add a few new photos every month.',
  ],
  'reviews-count': reviewSteps,
  'reviews-rating': reviewSteps,
  'web-https': [
    'Ask your web host or website builder to turn on a free security certificate (SSL).',
    'Make sure the plain http address always forwards to https.',
    'Open your site and check the padlock shows next to the address.',
    'Update the website link on your Google profile to the https address.',
  ],
  'web-mobile': [
    'Open your website on your phone and note anything hard to read or tap.',
    'If you use a website builder, switch to a mobile-friendly (responsive) theme.',
    'If someone built your site, ask them to add the mobile viewport setting and make text and buttons fit the screen.',
    'Check again on your phone.',
  ],
  'web-title': [
    'Find the page title setting in your website builder, usually under SEO or Page settings.',
    'Say what you do and where, for example “Plumber in Leeds | Smith Plumbing”.',
    'Keep it to about 60 characters.',
    'Save and publish.',
  ],
  'web-description': [
    'Open the SEO or Page settings for your home page.',
    'Write one or two sentences about your service, your area and how to get in touch.',
    'Keep it to about 150 characters.',
    'Save and publish.',
  ],
  'web-h1': [
    'Open your home page in your website editor.',
    'Make sure there is one main heading at the top, set as “Heading 1”.',
    'Say what you do and where, in plain words.',
    'Use smaller headings for the other sections.',
  ],
  'web-open-graph': [
    'In your website builder, look for the social sharing or SEO settings.',
    'Add a share title and a share image (about 1200 × 630 pixels).',
    'Paste your website link into a WhatsApp chat with yourself to check the preview.',
  ],
  'search-indexable': [
    'In your website builder, check the search engine visibility setting and make sure the site isn’t hidden.',
    'If someone built your site, ask them to remove any “noindex” tag or robots.txt line that blocks all search engines.',
    'In Google Search Console, ask Google to index your home page.',
  ],
  'search-sitemap': [
    'Check your website builder’s settings: many create a sitemap automatically.',
    'If not, use your platform’s SEO plugin to create sitemap.xml.',
    'Add the sitemap address in Google Search Console.',
  ],
  'search-schema': [
    'Look for “local business” or “business details” settings in your website builder or SEO plugin.',
    'Fill in your name, address, phone, opening hours, website and logo, exactly as on Google.',
    'Test the page with Google’s Rich Results Test.',
    'Fix anything it flags, then test again.',
  ],
  'search-ai-crawlers': [
    'Open yourwebsite.com/robots.txt to see which assistants are blocked.',
    'Decide whether you want AI assistants to read your site. It’s your choice.',
    'If you do, remove the lines that block them, or ask whoever manages your site to.',
  ],
  'contact-links': [
    'Add a “Call” button that links to your number in international format (tel:+44…).',
    'Add a WhatsApp button that links to wa.me/ followed by your number.',
    'If you take bookings, add a button to your booking page.',
    'Put them near the top of your home page and in the footer.',
    'Tap each one on your phone to check it works.',
  ],
  'speed-mobile': [
    'Run your page through Google PageSpeed Insights and read the top suggestions.',
    'Shrink large images and use a modern format such as WebP.',
    'Remove plugins, apps or scripts you no longer use.',
    'Ask your host or website builder whether caching is switched on.',
    'Test again. Scores can vary between tests.',
  ],
  'consistency-nap': [
    'Write down your business name, address and phone exactly as they appear on Google.',
    'Use exactly the same details on your website, for example in the footer.',
    'Update your social pages and other listings to match.',
    'If any detail has changed, update Google first.',
  ],
};
