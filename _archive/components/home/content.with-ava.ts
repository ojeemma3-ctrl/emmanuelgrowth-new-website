export const avaChoices = [
  'Get found online',
  'Respond to enquiries faster',
  'Get more reviews',
  'Follow up with customers',
  'Not sure yet',
];

export const whatsappNumber = '447575416197';
export const whatsappMessage = 'Hi Emmanuel, I found your website and I would like to know how you can help my business.';
export const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

export const insights: Record<string, string> = {
  'Get found online': 'The first priority is making sure people can discover your business, understand what you offer and take a clear next step.',
  'Respond to enquiries faster': 'The opportunity is often in the leads you already receive. A faster first response and a clear handover can stop good enquiries going cold.',
  'Get more reviews': 'A simple, well-timed request makes it easier for happy customers to share honest feedback and helps your reputation keep working after the sale.',
  'Follow up with customers': 'There may already be value in past enquiries and customers. Thoughtful follow-up can reopen conversations without making them feel automated.',
  'Not sure yet': 'That is a useful place to start. Looking at how people find you, contact you and what happens afterwards usually reveals the first gap to fix.',
};
