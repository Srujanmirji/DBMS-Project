import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, BellRing, Lightbulb, TrendingUp, Shield, Zap } from 'lucide-react';
import { sectionHeader, staggerContainer, cardReveal, viewportOnce } from '../utils/scrollAnimations';

const data = [
  { Icon: BarChart3,   title: 'Spend analytics',     desc: 'Breakdown by service, category, and trend. Spot hidden leaks at a glance.', color: 'text-accent',       bg: 'bg-accent-muted' },
  { Icon: BellRing,    title: 'Due-date alerts',      desc: 'Notified before a charge hits. Cancel auto-renewals before they cost you.', color: 'text-amber-400',    bg: 'bg-amber-400/10' },
  { Icon: Lightbulb,   title: 'Smart suggestions',    desc: 'AI flags duplicate or dormant services so you cut waste instantly.',        color: 'text-green-accent',  bg: 'bg-green-muted' },
  { Icon: TrendingUp,  title: 'Savings tracker',      desc: 'Clear, motivating reports showing how much you\'ve reclaimed over time.',    color: 'text-purple-400',   bg: 'bg-purple-400/10' },
  { Icon: Shield,      title: 'Bank-grade security',  desc: 'AES-256 encryption, zero data sharing. Your finances stay private.',         color: 'text-cyan-400',     bg: 'bg-cyan-400/10' },
  { Icon: Zap,         title: 'Instant setup',        desc: 'Add subscriptions in seconds. No complex onboarding required.',              color: 'text-rose-400',     bg: 'bg-rose-400/10' },
];

export default function Features() {
  return (
    <section id="features" className="bg-surface-0 py-24 md:py-32 relative overflow-hidden">
      <div className="container-lg">
        <motion.div
          variants={sectionHeader}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="text-center mb-14 md:mb-20"
        >
          <p className="section-label">Features</p>
          <h2 className="text-display-sm md:text-display-md font-display font-bold text-text-primary mb-4">
            Everything you need to save
          </h2>
          <p className="text-body text-text-secondary max-w-md mx-auto">
            We track and manage your recurring bills automatically — so you don't have to.
          </p>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
          variants={staggerContainer(0.08, 0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          {data.map(({ Icon, title, desc, color, bg }, i) => (
            <motion.div key={i}
              variants={cardReveal}
              whileHover={{ y: -5, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
              className="card p-6 md:p-7 cursor-default group transition-shadow duration-300 hover:shadow-card-hover will-change-transform"
            >
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <h4 className="text-body font-semibold text-text-primary mb-1.5 group-hover:text-accent transition-colors duration-300">{title}</h4>
              <p className="text-caption text-text-secondary leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
