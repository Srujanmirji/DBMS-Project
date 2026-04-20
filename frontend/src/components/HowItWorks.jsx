import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, LayoutDashboard, PiggyBank } from 'lucide-react';
import { sectionHeader, staggerContainer, stepReveal, viewportOnce } from '../utils/scrollAnimations';

const premiumEase = [0.16, 1, 0.3, 1];

const steps = [
  { num: '01', Icon: UserPlus,        title: 'Add your subscriptions',   desc: 'Enter services manually or connect your bank feed. Takes under a minute.' },
  { num: '02', Icon: LayoutDashboard, title: 'Watch the dashboard work', desc: 'Spending breakdowns, due-date alerts, and trend charts update in real time.' },
  { num: '03', Icon: PiggyBank,       title: 'Start saving money',       desc: 'Act on AI suggestions to cancel, downgrade, or consolidate subscriptions.' },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-surface-1 py-24 md:py-32 border-y border-line">
      <div className="container-lg">
        <motion.div
          variants={sectionHeader}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="text-center mb-14 md:mb-20"
        >
          <p className="section-label">How it works</p>
          <h2 className="text-display-sm md:text-display-md font-display font-bold text-text-primary mb-4">
            Three steps. Zero friction.
          </h2>
          <p className="text-body text-text-secondary max-w-md mx-auto">
            From sign-up to savings in under five minutes.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-6 md:gap-8 relative"
          variants={staggerContainer(0.25, 0.15)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          {/* Connector line (desktop) — draws from left to right */}
          <motion.div
            className="hidden md:block absolute top-[52px] left-[16.6%] right-[16.6%] h-px bg-gradient-to-r from-line via-accent/30 to-line"
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, delay: 0.3, ease: premiumEase }}
            style={{ originX: 0 }}
          />

          {steps.map(({ num, Icon, title, desc }, i) => (
            <motion.div key={i}
              variants={stepReveal}
              className="flex flex-col items-center text-center will-change-transform"
            >
              <div className="relative mb-6">
                <motion.div
                  className="w-[72px] h-[72px] rounded-2xl bg-surface-2 border border-line flex items-center justify-center shadow-inner"
                  whileHover={{ scale: 1.08, borderColor: 'rgba(249,115,22,0.3)' }}
                  transition={{ duration: 0.3, ease: premiumEase }}
                >
                  <Icon className="w-6 h-6 text-accent" />
                </motion.div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent text-[10px] font-bold text-white flex items-center justify-center">{num}</span>
              </div>
              <h4 className="text-body font-semibold text-text-primary mb-2">{title}</h4>
              <p className="text-caption text-text-secondary max-w-[280px]">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
