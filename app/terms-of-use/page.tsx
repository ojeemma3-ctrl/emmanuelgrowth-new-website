import type { Metadata } from 'next';
import { LegalPage } from '../../components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Terms of Use | Emmanuel Growth',
  description: 'The terms that apply when visitors use the Emmanuel Growth website.',
  alternates: { canonical: '/terms-of-use' },
};

export default function TermsOfUsePage() {
  return (
    <LegalPage
      eyebrow="LEGAL"
      title="Terms of Use"
      intro="These terms apply to use of the Emmanuel Growth website. Separate written terms will apply to any paid services."
    >
      <p className="legal-updated">Last updated: 18 September 2026</p>

      <section>
        <h2>1. About this website</h2>
        <p>These terms apply to the Emmanuel Growth website.</p>
        <p>Questions about these terms can be sent to <a href="mailto:emmanuel@emmanuelgrowth.com">emmanuel@emmanuelgrowth.com</a>.</p>
      </section>

      <section>
        <h2>2. Using the website</h2>
        <p>You may use this website for lawful purposes and to learn about or enquire about Emmanuel Growth services.</p>
        <p>You must not attempt to damage the website, interfere with its operation, gain unauthorised access, introduce harmful code, or use the website in a way that breaks applicable law or another person’s rights.</p>
      </section>

      <section>
        <h2>3. Information on the website</h2>
        <p>The website provides general information about marketing operations and services. It does not guarantee search rankings, enquiry volumes, sales, reviews or other business results.</p>
        <p>Emmanuel Growth aims to keep the website clear and accurate, but information may be updated and may not cover every business situation.</p>
      </section>

      <section>
        <h2>4. Enquiries and services</h2>
        <p>Sending an enquiry does not create a client relationship or require either party to proceed. The scope, price, timing, responsibilities and other terms for paid work should be agreed separately in writing.</p>
        <p>If a separate service agreement conflicts with these website terms, the service agreement will control the paid work.</p>
      </section>

      <section>
        <h2>5. Intellectual property</h2>
        <p>The website’s branding, text, layout and original materials are protected by applicable intellectual-property law. Third-party materials remain the property of their respective owners.</p>
        <p>You may view the website for personal or internal business use. You must not reproduce, sell or present substantial parts of it as your own without permission, except where the law allows.</p>
      </section>

      <section>
        <h2>6. Third-party services and links</h2>
        <p>The website may link to third-party services such as WhatsApp. Those services operate under their own terms and privacy policies. Emmanuel Growth does not control their availability or policies.</p>
      </section>

      <section>
        <h2>7. Availability and responsibility</h2>
        <p>Reasonable care is taken to keep the website available and secure, but uninterrupted or error-free access cannot be guaranteed.</p>
        <p>Nothing in these terms excludes or limits responsibility where doing so would be unlawful.</p>
      </section>

      <section>
        <h2>8. Applicable law</h2>
        <p>These terms are subject to applicable law. Nothing in them excludes rights that cannot lawfully be excluded.</p>
      </section>

      <section>
        <h2>9. Changes to these terms</h2>
        <p>These terms may be updated when the website, services or applicable requirements change. The date at the top of the page will be updated when material changes are made.</p>
      </section>
    </LegalPage>
  );
}
