import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import SiteNav from '@/components/ui/site-nav';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      <SiteNav
        brand="Cleub Automation"
        links={[
          { label: 'Home', href: '/' },
          { label: 'About Us', href: '/about' },
        ]}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-white to-slate-300 mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-400">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card className="bg-slate-900/70 backdrop-blur-sm border border-slate-800 mb-8">
          <CardContent className="p-8 space-y-6 text-slate-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Introduction</h2>
              <p className="leading-relaxed">
                At Cleub Automation, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, store, and protect your data when you use our services, website, or mobile applications.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Information We Collect</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-teal-400 mb-2">Personal Information</h3>
                  <p className="leading-relaxed">
                    We collect information you provide directly, including name, email address, phone number, property address, and project details when you submit inquiries, create an account, or use our planning tools.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-teal-400 mb-2">Usage Data</h3>
                  <p className="leading-relaxed">
                    We automatically collect information about how you interact with our services, including IP address, browser type, device information, pages visited, and timestamps.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-teal-400 mb-2">Project Data</h3>
                  <p className="leading-relaxed">
                    When using our planning platform, we store project details including room configurations, automation requirements, budget preferences, and cost estimates.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>To provide, maintain, and improve our services</li>
                <li>To process inquiries and communicate with you about projects</li>
                <li>To generate cost estimates and project proposals</li>
                <li>To send service updates and important notifications</li>
                <li>To analyze usage patterns and enhance user experience</li>
                <li>To comply with legal obligations and protect our rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Data Security</h2>
              <p className="leading-relaxed">
                We implement industry-standard security measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction. This includes encryption, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Data Sharing and Disclosure</h2>
              <p className="leading-relaxed mb-3">
                We do not sell your personal information. We may share your data only in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>With service providers who assist in delivering our services</li>
                <li>With your explicit consent for specific purposes</li>
                <li>When required by law or to protect our legal rights</li>
                <li>In connection with a business transfer or merger</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Your Rights</h2>
              <p className="leading-relaxed mb-3">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>Access, update, or delete your personal information</li>
                <li>Opt-out of marketing communications</li>
                <li>Request a copy of your data</li>
                <li>Object to data processing in certain circumstances</li>
                <li>Lodge a complaint with a supervisory authority</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Cookies and Tracking</h2>
              <p className="leading-relaxed">
                We use cookies and similar technologies to enhance your experience, analyze site usage, and support authentication. You can control cookie preferences through your browser settings. For more details, see our Cookie Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Data Retention</h2>
              <p className="leading-relaxed">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, resolve disputes, and enforce our agreements. Project data is retained according to your account status and usage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Children's Privacy</h2>
              <p className="leading-relaxed">
                Our services are not directed to individuals under 18 years of age. We do not knowingly collect personal information from children. If we become aware of such collection, we will take steps to delete the information promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Changes to This Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. We will notify you of significant changes by posting the updated policy on our website with a revised effective date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
              <p className="leading-relaxed">
                If you have questions or concerns about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="mt-3 space-y-1">
                <p>Email: <a href="mailto:support@cleub.com" className="text-teal-400 hover:underline">support@cleub.com</a></p>
                <p>Phone: <a href="tel:+919667603999" className="text-teal-400 hover:underline">+91 9667603999</a></p>
              </div>
            </section>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button onClick={() => navigate('/')} variant="outline" className="border-teal-600 text-teal-400 hover:bg-teal-600/10">
            Back to Home
          </Button>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-xl py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-400">
          &copy; {new Date().getFullYear()} Cleub Automation. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
