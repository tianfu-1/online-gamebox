export const metadata = {
  title: "Privacy Policy",
  description:
    "Understand how KPOP Games GO collects, uses, and safeguards your information, including data rights, cookies, advertising, and contact details.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-white text-slate-900">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500">Legal</p>
          <h1 className="text-3xl font-black tracking-tight">Privacy Policy for kpopgamesgo.com</h1>
          <p className="text-base text-slate-600">
            Thank you for visiting kpopgamesgo.com (the “Website”). Your privacy is important to us. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your information when you use our Services. By
            accessing or using the Website, you consent to the data practices described below.
          </p>
        </header>

        <article className="mt-10 space-y-10 text-base leading-relaxed text-slate-700">
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-900">1. Information We Collect</h2>
            <p>We collect information in the following ways:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <span className="font-semibold">Information You Provide Directly:</span> When you contact us, we collect
                details such as your name, email address, and the contents of your message.
              </li>
              <li>
                <span className="font-semibold">Automatically Collected Information:</span> We log IP addresses, browser
                types, ISP data, date/time stamps, referring/exit pages, and on-site clickstream data to analyze usage
                trends. This information is not linked to personally identifiable data.
              </li>
              <li>
                <span className="font-semibold">Cookies and Web Beacons:</span> Functional cookies remember your
                settings, analytics cookies help us understand how users interact with the site, and advertising cookies
                allow partners to show relevant ads. You may disable cookies in your browser, but some features may stop
                working.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-900">2. Third-Party Advertising</h2>
            <p>
              We use third-party advertising companies (such as Google AdSense) to serve ads. These companies may use
              information about your visits to this and other websites to provide advertisements about goods and services
              of interest to you. Google uses the DART cookie to serve ads; you may opt out by visiting the{" "}
              <a
                href="https://policies.google.com/technologies/ads"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline underline-offset-4"
              >
                Google ad and content network privacy policy
              </a>
              .
            </p>
            <p>
              Our Privacy Policy does not cover the cookies or data practices of these advertisers. Please review the
              privacy policies of any third-party ad servers you interact with.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-900">3. How We Use Your Information</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Operate, maintain, and improve the Website and Services.</li>
              <li>Understand and analyze how you use the Website.</li>
              <li>Develop new games, features, and services.</li>
              <li>Respond to inquiries and provide customer support.</li>
              <li>Serve advertisements and measure their effectiveness.</li>
              <li>Prevent fraud, abuse, and technical issues.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-900">4. Third-Party Links</h2>
            <p>
              Our Website may contain links to external sites (including within games) that are not operated by us. This
              Privacy Policy does not apply to those sites. We strongly advise you to review the privacy policy of every
              external site you visit.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-900">5. Children’s Privacy (COPPA)</h2>
            <p>
              The Website is intended for users who are at least 13 years old. We do not knowingly collect any
              personally identifiable information from children under 13. If you believe your child has provided personal
              data without your consent, contact us at{" "}
              <a href="mailto:hello@kpopgamesgo.com" className="text-blue-600 underline underline-offset-4">
                hello@kpopgamesgo.com
              </a>{" "}
              and we will remove the information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-900">6. Your Data Protection Rights (GDPR / CCPA)</h2>
            <p>You may have the following rights, depending on your location:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>The right to access personal data we hold about you.</li>
              <li>The right to request correction of inaccurate information.</li>
              <li>The right to request deletion of your personal data, subject to legal obligations.</li>
              <li>The right to restrict or object to certain processing activities.</li>
            </ul>
            <p>
              To exercise these rights, email{" "}
              <a href="mailto:hello@kpopgamesgo.com" className="text-blue-600 underline underline-offset-4">
                hello@kpopgamesgo.com
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-900">7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an
              updated “Last Updated” date. Please review this policy periodically to stay informed.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-900">8. Contact Us</h2>
            <p>
              Questions or concerns about this policy? Email{" "}
              <a href="mailto:hello@kpopgamesgo.com" className="text-blue-600 underline underline-offset-4">
                hello@kpopgamesgo.com
              </a>
              .
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
