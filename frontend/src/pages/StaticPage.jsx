import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

export default function StaticPage({ title, lastUpdated = 'April 2026' }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [title]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface-0 pt-32 pb-24 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/[0.03] blur-[100px] rounded-full pointer-events-none" />
        
        <div className="container-lg relative z-10">
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
             className="max-w-3xl mx-auto"
          >
            <div className="mb-12">
              <h1 className="text-display-sm md:text-display-md font-display font-bold text-text-primary mb-4">{title}</h1>
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].includes(title) && (
                <p className="text-text-muted">Last updated: {lastUpdated}</p>
              )}
            </div>

            <div className="prose prose-invert prose-orange max-w-none">
              {title === 'Blog' ? (
                <div className="space-y-12">
                  {[
                    { date: 'April 15, 2026', title: 'How to save $500/year on subscriptions', excerpt: 'Discover the hidden costs of "free" trials and how to audit your bank feeds efficiently.' },
                    { date: 'April 02, 2026', title: 'The rise of the subscription economy', excerpt: 'Why everything is becoming a service and what it means for your personal privacy.' }
                  ].map((post, i) => (
                    <div key={i} className="border-b border-line pb-8">
                      <p className="text-micro text-accent mb-2 uppercase font-bold tracking-widest">{post.date}</p>
                      <h3 className="text-2xl font-bold text-text-primary mb-3 mt-0">{post.title}</h3>
                      <p className="text-text-secondary mb-4">{post.excerpt}</p>
                      <button className="text-accent font-semibold hover:underline">Read article →</button>
                    </div>
                  ))}
                </div>
              ) : title === 'Careers' ? (
                <div className="space-y-8">
                  <p className="text-body text-text-secondary leading-relaxed">We are a small, remote-first team dedicated to helping people reclaim their financial freedom. We are always looking for passionate engineers and designers.</p>
                  <div className="grid gap-4 mt-8">
                    {['Senior Frontend Engineer', 'Product Designer', 'Backend Architect'].map((job, i) => (
                      <div key={i} className="card p-5 flex items-center justify-between hover:border-accent/40 transition-colors cursor-pointer">
                        <div>
                          <h4 className="font-bold text-text-primary">{job}</h4>
                          <p className="text-micro text-text-muted">Remote · Full-time</p>
                        </div>
                        <span className="text-accent">Apply →</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : title === 'Changelog' ? (
                <div className="space-y-12">
                   <div className="relative pl-8 border-l border-line">
                    <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-accent" />
                    <p className="text-micro text-accent mb-2 uppercase font-bold tracking-widest">v1.2.0 — April 20, 2026</p>
                    <h3 className="text-xl font-bold text-text-primary mb-4 mt-0">Dashboard Refresh & True Value</h3>
                    <ul className="text-text-secondary list-disc pl-5 space-y-2">
                       <li>Introduced "True Value" cost-per-use calculation for all subscriptions.</li>
                       <li>Launched the new high-visibility "Insight Card" for savings potential.</li>
                       <li>Fixed currency formatting issues for global regions.</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-body text-text-secondary leading-relaxed mb-6">
                    Welcome to the {title} page. This is a generic placeholder document. All terms, conditions, and company policies will be fully drafted prior to the official production release.
                  </p>
                  
                  <h3 className="text-xl font-bold text-text-primary mt-8 mb-4">1. Introduction</h3>
                  <p className="text-text-secondary leading-relaxed mb-6">
                    By using our platform, you agree to these terms. SubTracker reserves the right to update this {title.toLowerCase()} as our services evolve to ensure compliance and transparency.
                  </p>
    
                  <h3 className="text-xl font-bold text-text-primary mt-8 mb-4">2. Usage Guidelines</h3>
                  <p className="text-text-secondary leading-relaxed mb-6">
                    Standard provisions apply. Do not misuse our API, scrape our application data, or perform any malicious actions against our infrastructure.
                  </p>
    
                  <h3 className="text-xl font-bold text-text-primary mt-8 mb-4">3. Contact Us</h3>
                  <p className="text-text-secondary leading-relaxed mb-6">
                    If you have questions regarding this {title.toLowerCase()}, please reach out to our legal and compliance team at <a href="mailto:support@subtracker.com" className="text-accent hover:underline">support@subtracker.com</a>.
                  </p>
                </>
              )}
            </div>
            
            {(title === 'Contact' || title === 'Careers' || title === 'About Us') && (
              <div className="mt-12 p-8 rounded-2xl bg-surface-1 border border-line flex flex-col items-center justify-center text-center">
                <span className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4 text-accent">📫</span>
                <h4 className="text-lg font-bold text-text-primary mb-2">We'd love to hear from you</h4>
                <p className="text-text-secondary mb-6 max-w-md">Our team is actively monitoring requests and growing our staff.</p>
                <button className="btn-primary">Get in touch</button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
