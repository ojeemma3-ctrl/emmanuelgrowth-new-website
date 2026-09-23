const GA4_MEASUREMENT_ID = /^G-[A-Z0-9]+$/i;

export function getGaMeasurementId() {
  try {
    const value = typeof process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID === 'string'
      ? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID.trim()
      : '';
    return value && GA4_MEASUREMENT_ID.test(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

export function getGoogleSiteVerification() {
  try {
    const value = typeof process.env.GOOGLE_SITE_VERIFICATION === 'string'
      ? process.env.GOOGLE_SITE_VERIFICATION.trim()
      : '';
    return value || undefined;
  } catch {
    return undefined;
  }
}
