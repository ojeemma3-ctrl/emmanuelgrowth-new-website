import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '../../components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy | Emmanuel Growth',
  description: 'How Emmanuel Growth handles personal information when you use this website or contact the business.',
  alternates: { canonical: '/privacy-policy' },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      eyebrow="LEGAL"
      title="Privacy Policy"
      intro="This policy explains what information may be collected through this website, why it is used and the choices available to you."
    >
      <p className="legal-updated">Last updated: 26 October 2026</p>

      <section>
        <h2>1. Who is responsible for your information</h2>
        <p>Emmanuel Growth is responsible for personal information handled through this website.</p>
        <p>For privacy questions or requests, email <a href="mailto:emmanuel@emmanuelgrowth.com">emmanuel@emmanuelgrowth.com</a>.</p>
      </section>

      <section>
        <h2>2. Information we may receive</h2>
        <p>We may receive information that you choose to provide when you contact Emmanuel Growth. This can include your name, contact details, business information and anything you write in your message.</p>
        <p>When you use the quick-message form, your name, your contact details (email address or WhatsApp number) and the topic you need help with are sent to our website&apos;s contact service, which passes them to Brevo. Brevo processes this information on our behalf.</p>
        <p>Emmanuel Growth (<a href="mailto:emmanuel@emmanuelgrowth.com">emmanuel@emmanuelgrowth.com</a>) is responsible for this information and uses it only to reply to your enquiry. We keep it for 24 months after our last contact with you, then we delete your details. You can ask us to delete them sooner at any time. You can ask to see or delete your information at any time by emailing us.</p>
        <p>Before the free visibility check shows your report, you give us your business name (or the business you pick from Google’s suggestions) and the best way to reach you: either your email address or your WhatsApp number, as you choose. You also tick a box agreeing that we can contact you about your check, and you can choose to tick a separate box to receive occasional tips. We use these details only to contact you about your check and, if you ticked that box, to send you tips. To run the check we look up public information about your business through Google’s Places and PageSpeed services and read your public website; we don’t store that information or the page content. So you don’t lose your results if you refresh or go back, they are kept in your own browser tab for up to 2 hours (not on our servers, and without your email address or WhatsApp number), and closing the tab removes them. If you download the report as a PDF, it is created in your own browser and is not sent to us. To limit checks to 3 a day per visitor, we use a scrambled (hashed) form of your IP address that is not kept after the day ends. When your check completes, your contact details, your business name and website address, your preferred way to be contacted, a short summary of the results, the date, whether you asked for tips and whether you asked for a personal review are stored in Brevo, the email and contact service that processes this information for Emmanuel Growth. Brevo also sends Emmanuel Growth an email with these details. If you choose WhatsApp, your number is stored in Brevo’s phone field, but it is not used for SMS marketing. We keep these details for 24 months after our last contact with you, then we delete your details. You can ask us to delete them sooner at any time. To see or delete them, email <a href="mailto:emmanuel@emmanuelgrowth.com">emmanuel@emmanuelgrowth.com</a> and we will delete them from Brevo and our records.</p>
        <p>Our hosting provider may process basic technical information, such as IP address, browser information, requested pages and security logs, to deliver and protect the website.</p>
      </section>

      <section>
        <h2>3. How we use information</h2>
        <p>Information may be used to:</p>
        <ul>
          <li>reply to enquiries and continue conversations you start;</li>
          <li>understand what help you are looking for;</li>
          <li>provide, secure and maintain the website;</li>
          <li>prepare or deliver services you request;</li>
          <li>meet legal or regulatory obligations; and</li>
          <li>understand website use when you have consented to analytics.</li>
        </ul>
      </section>

      <section>
        <h2>4. Legal reasons for processing</h2>
        <p>Depending on the situation, information may be processed because you have given consent, because it is necessary to take steps you requested before entering a contract, because it is necessary for a legitimate business interest, or because the law requires it.</p>
        <p>Where processing relies on consent, you may withdraw that consent at any time.</p>
      </section>

      <section>
        <h2>5. Services that may process information</h2>
        <p>Information may be handled by services used to operate the website and respond to you:</p>
        <ul>
          <li>website hosting and security services, which may process technical logs;</li>
          <li>WhatsApp and Meta — only when you choose to open or send a WhatsApp message;</li>
          <li>Google Analytics — only when it is configured and you accept analytics cookies.</li>
        </ul>
        <p>These services may process information in other countries and under their own privacy terms.</p>
      </section>

      <section>
        <h2>6. How long information is kept</h2>
        <p>Information is kept only for as long as reasonably necessary for the purpose described in this policy, to respond to an enquiry, or to meet legal, accounting or security obligations. Analytics retention follows the configured Google Analytics setting if analytics is enabled.</p>
      </section>

      <section>
        <h2>7. Your privacy rights</h2>
        <p>Depending on where you live, you may have rights to ask for access to your personal information, correct it, delete it, restrict or object to its use, or receive a portable copy. You may also withdraw consent where consent is the legal basis.</p>
        <p>To make a request, email <a href="mailto:emmanuel@emmanuelgrowth.com">emmanuel@emmanuelgrowth.com</a>. You may also have the right to complain to the data-protection authority that applies where you live.</p>
      </section>

      <section>
        <h2>8. Cookies and analytics</h2>
        <p>Google Analytics remains disabled unless a real measurement ID is configured and you accept analytics. You can reject analytics or change your choice later using “Cookie settings” in the footer.</p>
        <p>More detail is available in the <Link href="/cookie-policy">Cookie Policy</Link>.</p>
      </section>

      <section>
        <h2>9. Children</h2>
        <p>This website and its services are intended for businesses and are not directed at children.</p>
      </section>

      <section>
        <h2>10. Changes to this policy</h2>
        <p>This policy may be updated when the website, services or legal requirements change. The date at the top of the page will be updated when material changes are made.</p>
      </section>
    </LegalPage>
  );
}
