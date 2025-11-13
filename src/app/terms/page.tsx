import Link from "next/link";
import { absoluteUrl } from "@/lib/site";

export const metadata = {
  title: "Terms of Use",
  description:
    "Review the Terms of Use for KPOP Games GO. Learn about eligibility, intellectual property, third-party links, ads, and legal disclaimers.",
  alternates: {
    canonical: absoluteUrl("/terms"),
  },
};

export default function TermsPage() {
  return (
    <div className="bg-white text-slate-900">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500">Legal</p>
          <h1 className="text-3xl font-black tracking-tight">Terms of Use for kpopgamesgo.com</h1>
          <p className="text-base text-slate-600">
            Welcome to kpopgamesgo.com (the “Website”). By accessing or using the Website and any of its software,
            games, or services (collectively, the “Services”), you acknowledge that you have read, understood, and agree
            to be bound by these Terms of Use (“Terms”) and our{" "}
            <Link href="/privacy" className="font-semibold text-blue-600 underline underline-offset-4">
              Privacy Policy
            </Link>
            .
          </p>
          <p className="text-base font-semibold text-slate-700">
            If you do not agree to all of these Terms, you are not permitted to access or use this Website or its
            Services.
          </p>
        </header>

        <article className="mt-10 space-y-10 text-base leading-relaxed text-slate-700">
          <section className="space-y-4">
            <p>
              kpopgamesgo.com reserves the right to update or modify these Terms at any time without prior notice. Your
              continued use of the Website after any such changes constitutes your acceptance of the new Terms. Please
              review this page periodically for updates.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-900">1. Access Restrictions &amp; Age Eligibility</h2>
            <p>
              This Website is intended for users who are at least 13 years of age. If you are under 13, you may only use
              the Website with the involvement, supervision, and consent of a parent or legal guardian. By using this
              Website, you represent and warrant that you meet this age requirement.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-900">2. Proprietary Rights of Games &amp; Content</h2>
            <p>
              Most of the games published on kpopgamesgo.com are submitted to us or suggested by their creators,
              third-party developers, or proprietary rights owners. While we review submissions, we cannot guarantee that
              every contributor has fully respected the intellectual property rights of others.
            </p>
            <p className="font-semibold">Copyright Infringement &amp; Takedown Notice:</p>
            <p>
              If you are a copyright owner or agent and believe any content on the Website infringes upon your rights,
              please notify us immediately at{" "}
              <a href="mailto:hello@kpopgamesgo.com" className="text-blue-600 underline underline-offset-4">
                hello@kpopgamesgo.com
              </a>
              . Upon receipt of a valid notification (per the DMCA or other applicable laws), we will investigate and
              promptly remove the game or content in question.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-900">3. Third-Party Links</h2>
            <p>
              The Website may contain links to third-party websites or services that are not owned or controlled by us.
              Likewise, other websites may link to kpopgamesgo.com. We have no control over, and assume no responsibility
              for, the content, privacy policies, or practices of any third-party websites. You access such websites at
              your own risk.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-900">4. Advertisements</h2>
            <p>
              The Website may display advertisements from third-party advertising networks. kpopgamesgo.com does not
              endorse and is not responsible for the content of these advertisements or for any products, services, or
              other materials related to them. Any dealings you have with advertisers are solely between you and the
              advertiser.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-900">5. Disclaimer of Warranties</h2>
            <p className="font-semibold">
              THE WEBSITE AND ALL SERVICES, GAMES, AND CONTENT ARE PROVIDED ON AN “AS IS” AND “AS AVAILABLE” BASIS,
              WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
            </p>
            <p>
              KPOPGAMESGO.COM DISCLAIMS ALL WARRANTIES, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-900">6. Limitation of Liability</h2>
            <p>
              TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT SHALL KPOPGAMESGO.COM, ITS OWNERS, OR AFFILIATES BE
              LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED
              TO YOUR USE OF (OR INABILITY TO USE) THE WEBSITE OR ITS SERVICES.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-900">Contact</h2>
            <p>
              Questions about these Terms? Email us at{" "}
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
