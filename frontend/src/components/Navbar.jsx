import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CreditCard, Menu, X } from 'lucide-react';

const links = [
  { label: 'Features',  href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Dashboard', href: '#dashboard' },
];

export default function Navbar() {
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <>
    <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-orange-500 origin-left z-[60]" style={{ scaleX }} />
    <motion.nav
      initial={{ y: -72 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`fixed w-full z-50 top-0 transition-colors duration-300 ${
        scrolled ? 'bg-surface-0/80 backdrop-blur-xl border-b border-line' : 'bg-transparent'
      }`}
    >
      <div className="container-lg h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center">
            <CreditCard className="w-3.5 h-3.5 text-accent" />
          </div>
          <span className="text-body font-display font-semibold text-text-primary tracking-tight">SubTracker</span>
        </a>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l, i) => (
            <a key={i} href={l.href}
               className="px-3.5 py-1.5 text-caption font-medium text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-2 transition-all duration-150">
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2.5">
          <Link to="/login" className="px-4 py-1.5 text-caption font-medium text-text-muted hover:text-text-primary transition-colors duration-150">Log in</Link>
          <Link to="/register" className="btn-primary !py-2 !px-5 !text-micro inline-block">Get Started</Link>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden p-1.5 text-text-muted hover:text-text-primary transition-colors">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-surface-1 border-t border-line overflow-hidden"
          >
            <div className="px-5 py-4 flex flex-col gap-0.5">
              {links.map((l, i) => (
                <a key={i} href={l.href} onClick={() => setOpen(false)}
                   className="py-2.5 text-caption font-medium text-text-secondary hover:text-text-primary transition-colors">
                  {l.label}
                </a>
              ))}
              <div className="pt-3 mt-2 border-t border-line space-y-2">
                <Link to="/login" className="block py-2 text-caption font-medium text-text-secondary">Log in</Link>
                <Link to="/register" className="btn-primary w-full !text-caption block text-center">Get Started</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
    </>
  );
}
