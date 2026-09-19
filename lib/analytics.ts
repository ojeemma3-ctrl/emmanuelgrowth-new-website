const GA4_MEASUREMENT_ID = /^G-[A-Z0-9]+$/i;
const runtimeEnv = typeof process !== 'undefined' && process && process.env ? process.env : undefined;

export function getGaMeasurementId() {
  try {
    const value = typeof runtimeEnv?.NEXT_PUBLIC_GA_MEASUREMENT_ID === 'string'
      ? runtimeEnv.NEXT_PUBLIC_GA_MEASUREMENT_ID.trim()
      : '';
    return value && GA4_MEASUREMENT_ID.test(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

export function getGoogleSiteVerification() {
  try {
    const value = typeof runtimeEnv?.GOOGLE_SITE_VERIFICATION === 'string'
      ? runtimeEnv.GOOGLE_SITE_VERIFICATION.trim()
      : '';
    return value || undefined;
  } catch {
    return undefined;
  }
}
