import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Github, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const nav = {
  product: [
    { label: 'Features', href: '/#features' },
    { label: 'How it works', href: '/#how-it-works' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'Changelog', href: '/#changelog' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ]
};

export default function Footer() {
  return (
    <footer className="bg-surface-0 border-t border-line pt-16 pb-8 md:pt-24 md:pb-12 text-sm z-20 relative">
      <div className="container-lg grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 lg:gap-16 mb-16">
        
        {/* Brand Column */}
        <div className="col-span-2 lg:col-span-2">
          <Link to="/" className="flex items-center gap-2 mb-6 inline-flex hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
              <CreditCard className="w-4 h-4 text-orange-500" />
            </div>
            <span className="text-body font-display font-semibold text-text-primary tracking-tight">SubTracker</span>
          </Link>
          <p className="text-text-secondary mb-8 max-w-[320px] leading-relaxed">
            Take control of your recurring expenses. Stop paying for subscriptions you don't use and understand your financial footprint.
          </p>
        </div>

        {/* Links Columns */}
        <div>
          <h3 className="text-text-primary font-semibold mb-5 font-display tracking-wide">Product</h3>
          <ul className="space-y-3.5">
            {nav.product.map((l, i) => (
              <li key={i}><Link to={l.href} className="text-text-secondary hover:text-orange-400 transition-colors">{l.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-text-primary font-semibold mb-5 font-display tracking-wide">Company</h3>
          <ul className="space-y-3.5">
            {nav.company.map((l, i) => (
              <li key={i}><Link to={l.href} className="text-text-secondary hover:text-orange-400 transition-colors">{l.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-text-primary font-semibold mb-5 font-display tracking-wide">Legal</h3>
          <ul className="space-y-3.5">
            {nav.legal.map((l, i) => (
              <li key={i}><Link to={l.href} className="text-text-secondary hover:text-orange-400 transition-colors">{l.label}</Link></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container-lg pt-8 border-t border-line flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-text-muted/60 text-xs">© {new Date().getFullYear()} SubTracker Inc. All rights reserved.</p>
        <div className="flex items-center gap-6 text-xs text-text-muted/60">
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> All systems operational</span>
          <span className="hidden sm:inline">Designed with precision</span>
        </div>
      </div>
    </footer>
  );
}
