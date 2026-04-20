import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { scaleUp, viewportOnce } from '../utils/scrollAnimations';

const premiumEase = [0.16, 1, 0.3, 1];

export default function CTA() {
  return (
    <section className="py-24 md:py-32 bg-surface-0 relative overflow-hidden">
      {/* Ambient breathing glow */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-[600px] h-[350px] bg-orange-500/[0.05] rounded-full blur-[120px]" />
      </motion.div>

      <div className="container-lg relative z-10">
        <motion.div
          variants={scaleUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="card p-10 md:p-16 text-center max-w-3xl mx-auto border-accent/10 will-change-transform"
        >
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: premiumEase }}
            className="text-display-sm md:text-display-md font-display font-bold text-text-primary mb-4"
          >
            Ready to take control?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: premiumEase }}
            className="text-body text-text-secondary max-w-md mx-auto mb-8"
          >
            Join thousands of people who stopped overpaying for subscriptions they forgot about.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.35, ease: premiumEase }}
            className="flex flex-wrap justify-center gap-3"
          >
            <motion.div 
              whileHover={{ 
                scale: 1.04, 
                boxShadow: '0 0 40px rgba(249, 115, 22, 0.35), 0 0 80px rgba(249, 115, 22, 0.1)' 
              }} 
              whileTap={{ scale: 0.97 }} 
              transition={{ duration: 0.3, ease: premiumEase }}
              className="rounded-full"
            >
              <Link to="/register" className="btn-primary inline-block">Get started — it's free</Link>
            </motion.div>
            <motion.button 
              whileHover={{ scale: 1.04 }} 
              whileTap={{ scale: 0.97 }} 
              transition={{ duration: 0.25, ease: premiumEase }} 
              className="btn-ghost"
            >
              Talk to us
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
