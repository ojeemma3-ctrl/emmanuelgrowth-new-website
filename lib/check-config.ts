// Settings for the free visibility check. Safe to import on the server and in the browser.

// true: step 1 asks where to send the report (WhatsApp or email) and consent before any check runs.
// false: step 1 asks only for the business; contact is asked for when the visitor requests a personal review.
export const REQUIRE_CONTACT_BEFORE_REPORT = true;

// Where "See how I can help" points.
export const HELP_LINK = '/#pricing';

// The owner's contact details, shown in the report, the PDF and used for WhatsApp links.
export const OWNER = {
  name: 'Emmanuel',
  business: 'Emmanuel Growth',
  email: 'emmanuel@emmanuelgrowth.com',
  whatsapp: '447575416197', // international digits, no plus sign
  whatsappDisplay: '+44 7575 416197',
};
