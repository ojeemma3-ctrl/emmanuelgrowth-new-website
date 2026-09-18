import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '../../components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Cookie Policy | Emmanuel Growth',
  description: 'How Emmanuel Growth uses cookies and similar browser storage, including optional Google Analytics.',
  alternates: { canonical: '/cookie-policy' },
};

export default function CookiePolicyPage() {
  return (
    <LegalPage
      eyebrow="LEGAL"
      title="Cookie Policy"
      intro="This policy explains the cookies and similar browser storage that may be used on this website and how you can control them."
    >
      <p className="legal-updated">Last updated: 18 September 2026</p>

      <section>
        <h2>1. What cookies are</h2>
        <p>Cookies are small text files stored by your browser. Websites can also use similar technologies, such as local storage, to remember a setting on your device.</p>
      </section>

      <section>
        <h2>2. Essential preference storage</h2>
        <p>This website uses a local-storage entry named <code>emmanuel-growth-analytics-consent:v1</code> to remember whether you accepted or rejected analytics. It stores only your choice and the time it was saved.</p>
        <p>This preference is used so the website can respect your decision. The website asks again after approximately 180 days.</p>
      </section>

      <section>
        <h2>3. Optional analytics cookies</h2>
        <p>Google Analytics is optional and remains disabled when no real GA4 measurement ID is configured. When it is configured, Google Analytics does not load unless you select “Accept analytics”.</p>
        <p>After consent, Google Analytics may use cookies such as <code>_ga</code> and <code>_ga_&lt;measurement-id&gt;</code> to distinguish visits and maintain session information. Their exact duration depends on the Google Analytics property and cookie configuration.</p>
        <p>Advertising storage, advertising user data and advertising personalisation are denied in the website integration.</p>
      </section>

      <section>
        <h2>4. Your choices</h2>
        <p>You can accept or reject analytics from the consent panel. Rejecting analytics does not prevent you from using the website.</p>
        <p>If analytics is enabled, the “Cookie settings” button in the footer lets you review or change your choice. Withdrawing consent removes available Google Analytics cookies and reloads the page so analytics stops.</p>
        <p>You can also remove stored information using your browser settings.</p>
      </section>

      <section>
        <h2>5. Contact</h2>
        <p>Questions about cookies or privacy can be sent to <a href="mailto:emmanuel@emmanuelgrowth.com">emmanuel@emmanuelgrowth.com</a>.</p>
        <p>For more information about personal information, read the <Link href="/privacy-policy">Privacy Policy</Link>.</p>
      </section>
    </LegalPage>
  );
}
