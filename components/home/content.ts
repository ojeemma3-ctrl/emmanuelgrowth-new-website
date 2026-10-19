export const helpOptions = [
  'Get found online',
  'Respond to enquiries faster',
  'Get more reviews',
  'Follow up with customers',
  'Not sure yet',
];

import { OWNER } from '../../lib/check-config';

export const contactEmail = OWNER.email;
export const whatsappNumber = OWNER.whatsapp;
export const whatsappMessage = 'Hi Emmanuel, I found your website and I would like to know how you can help my business.';
export const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
