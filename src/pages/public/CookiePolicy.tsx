import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import SiteNav from '@/components/ui/site-nav';

const CookiePolicy = () => {
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
            Cookie Policy
          </h1>
          <p className="text-slate-400">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card className="bg-slate-900/70 backdrop-blur-sm border border-slate-800 mb-8">
          <CardContent className="p-8 space-y-6 text-slate-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">What Are Cookies</h2>
              <p className="leading-relaxed">
                Cookies are small text files that are placed on your device when you visit our website. They help us provide a better user experience by remembering your preferences, enabling certain features, and analyzing how you use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Types of Cookies We Use</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-teal-400 mb-2">Essential Cookies</h3>
                  <p className="leading-relaxed">
                    These cookies are necessary for the website to function properly. They enable core functionality such as security, authentication, and access to secure areas. The website cannot function properly without these cookies.
                  </p>
                  <p className="text-sm text-slate-400 mt-2">Examples: Session management, authentication tokens, security features</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-teal-400 mb-2">Performance Cookies</h3>
                  <p className="leading-relaxed">
                    These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This data helps us improve the website's performance and user experience.
                  </p>
                  <p className="text-sm text-slate-400 mt-2">Examples: Page load times, error tracking, usage analytics</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-teal-400 mb-2">Functional Cookies</h3>
                  <p className="leading-relaxed">
                    These cookies enable personalized features and remember your choices (such as language preferences or project settings) to provide a more personalized experience.
                  </p>
                  <p className="text-sm text-slate-400 mt-2">Examples: Language selection, saved project preferences, UI customization</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-teal-400 mb-2">Analytics Cookies</h3>
                  <p className="leading-relaxed">
                    We use analytics cookies to understand user behavior, track website traffic, and measure the effectiveness of our content. This information is used solely for improving our services.
                  </p>
                  <p className="text-sm text-slate-400 mt-2">Examples: Google Analytics, user journey tracking, conversion metrics</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Third-Party Cookies</h2>
              <p className="leading-relaxed mb-3">
                We may use third-party services that set cookies on our behalf. These include:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li><strong>Firebase Authentication:</strong> For secure user authentication and session management</li>
                <li><strong>Supabase:</strong> For database operations and real-time data synchronization</li>
                <li><strong>Analytics Providers:</strong> For website usage analysis and performance monitoring</li>
              </ul>
              <p className="leading-relaxed mt-3">
                These third parties have their own privacy policies and may use cookies according to their terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">How to Manage Cookies</h2>
              <p className="leading-relaxed mb-3">
                You have the right to accept or reject cookies. Most web browsers automatically accept cookies, but you can modify your browser settings to decline cookies if you prefer. Here's how:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                <li><strong>Edge:</strong> Settings → Privacy, search, and services → Cookies</li>
              </ul>
              <p className="leading-relaxed mt-3 text-amber-400">
                Note: Disabling cookies may affect the functionality of our website and prevent you from using certain features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Cookie Duration</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-teal-400 mb-2">Session Cookies</h3>
                  <p className="leading-relaxed">
                    Temporary cookies that expire when you close your browser. Used primarily for authentication and navigation.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-teal-400 mb-2">Persistent Cookies</h3>
                  <p className="leading-relaxed">
                    Remain on your device for a set period or until you delete them. Used to remember your preferences and improve your experience on repeat visits.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Your Consent</h2>
              <p className="leading-relaxed">
                By using our website, you consent to the use of cookies as described in this policy. If you do not agree to our use of cookies, you should disable them through your browser settings or refrain from using our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Updates to This Policy</h2>
              <p className="leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our business practices. The updated policy will be posted on this page with a revised date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
              <p className="leading-relaxed">
                If you have questions about our use of cookies, please contact us at:
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

export default CookiePolicy;
