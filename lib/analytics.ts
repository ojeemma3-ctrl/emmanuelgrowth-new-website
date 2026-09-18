const GA4_MEASUREMENT_ID = /^G-[A-Z0-9]+$/i;

export function getGaMeasurementId() {
  const value = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  return value && GA4_MEASUREMENT_ID.test(value) ? value : undefined;
}

export function getGoogleSiteVerification() {
  const value = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  return value || undefined;
}
