// One plain-English line for each plan feature in lib/pricing-config.ts, shown under "What you get" on the
// service pages. Keys must match the feature text in the pricing config exactly: the service page template
// stops the build if a feature has no line, or a line has no feature. Edit the wording here.

export const includedLines: Record<string, string> = {
  // Get Found
  'A simple website or landing page': 'One clear page or a small site that shows who you are, what you offer and how to reach you.',
  'Google Business Profile set up and checked each month': 'We set up your Google profile clearly, then check it every month so your details stay correct.',
  'Call, WhatsApp and booking buttons': 'Buttons that let customers call you, message you on WhatsApp or book, in one tap.',
  'Up to 3 update requests a month, done within 2 working days': 'Ask for changes such as new photos, services or opening times, and we make them within 2 working days.',
  // Get More Reviews
  'A review request after every job': 'After each job, your customer gets a short, friendly message asking for an honest review.',
  'One tap to your Google or Trustpilot page': 'The message links straight to your review page, so leaving a review takes one tap.',
  'Help replying to new reviews': 'We help you write clear, polite replies, including to reviews that aren’t positive.',
  'A short monthly summary': 'Once a month, a short summary so you can see how your reviews are going.',
  // Convert Enquiries
  'One inbox for WhatsApp, Instagram, Facebook and website chat': 'Messages from these channels arrive in one place, so nothing is spread across apps.',
  'An AI first reply and follow-up': 'A quick first reply and a follow-up, so enquiries don’t wait. You can step in at any time.',
  'Booking links': 'Links that let customers book a time without back-and-forth messages.',
};
