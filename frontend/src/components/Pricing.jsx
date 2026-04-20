import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { cardReveal, staggerContainer, sectionHeader, viewportOnce } from '../utils/scrollAnimations';

// --- PRIMITIVES (from User) ---
function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'bg-surface-1 relative w-full rounded-2xl p-2 shadow-2xl backdrop-blur-xl border border-line',
        className
      )}
      {...props}
    />
  );
}

function Header({ className, children, glassEffect = true, ...props }) {
  return (
    <div
      className={cn(
        'bg-surface-2 relative mb-4 rounded-xl border border-line p-5',
        className
      )}
      {...props}
    >
      {glassEffect && (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-48 rounded-[inherit]"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,165,0,0.07) 0%, rgba(255,165,0,0.03) 40%, rgba(0,0,0,0) 100%)',
          }}
        />
      )}
      {children}
    </div>
  );
}

function Plan({ className, ...props }) {
  return (
    <div className={cn('mb-8 flex items-center justify-between', className)} {...props} />
  );
}

function Description({ className, ...props }) {
  return (
    <p className={cn('text-text-secondary text-sm', className)} {...props} />
  );
}

function PlanName({ className, ...props }) {
  return (
    <div
      className={cn(
        "text-text-primary flex items-center gap-2 text-base font-semibold [&_svg:not([class*='size-'])]:size-5",
        className
      )}
      {...props}
    />
  );
}

function Badge({ className, ...props }) {
  return (
    <span
      className={cn(
        'border-orange-500/20 text-orange-400 bg-orange-500/10 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        className
      )}
      {...props}
    />
  );
}

function Price({ className, ...props }) {
  return (
    <div className={cn('mb-3 flex items-end gap-1', className)} {...props} />
  );
}

function MainPrice({ className, ...props }) {
  return (
    <span className={cn('text-4xl font-extrabold tracking-tight text-white', className)} {...props} />
  );
}

function Period({ className, ...props }) {
  return (
    <span className={cn('text-text-muted pb-1 text-sm font-medium', className)} {...props} />
  );
}

function OriginalPrice({ className, ...props }) {
  return (
    <span
      className={cn('text-text-muted/50 mr-1 ml-auto text-lg line-through font-semibold', className)}
      {...props}
    />
  );
}

function Body({ className, ...props }) {
  return <div className={cn('space-y-6 p-4', className)} {...props} />;
}

function List({ className, ...props }) {
  return <ul className={cn('space-y-4', className)} {...props} />;
}

function ListItem({ className, ...props }) {
  return (
    <li
      className={cn('text-text-secondary flex items-start gap-4 text-sm', className)}
      {...props}
    >
      <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">✓</span>
      {props.children}
    </li>
  );
}

function Separator({ children = 'Upgrade to access', className, ...props }) {
  return (
    <div
      className={cn('text-text-muted flex items-center gap-3 text-sm font-medium my-6', className)}
      {...props}
    >
      <span className="bg-line h-[1px] flex-1" />
      <span className="shrink-0">{children}</span>
      <span className="bg-line h-[1px] flex-1" />
    </div>
  );
}

// --- ACTUAL SECTION COMPONENT ---
export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-surface-0 border-t border-line">
      <div className="container-lg">
        <motion.div
          variants={sectionHeader}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <h2 className="text-display-md font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-body-lg text-text-secondary">Stop bleeding money on unused tools. Save hundreds with the right plan.</p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-start max-w-6xl mx-auto"
          variants={staggerContainer(0.15, 0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          
          {/* Free Plan */}
          <motion.div variants={cardReveal}>
            <Card>
              <Header glassEffect={false}>
                <Plan>
                  <PlanName>Hobby</PlanName>
                </Plan>
                <Price>
                  <MainPrice>$0</MainPrice>
                  <Period>/forever</Period>
                </Price>
                <Description>Perfect for personal expense tracking.</Description>
              </Header>
              <Body>
                <Link to="/login" className="btn-ghost w-full mb-2 text-center block">Get Started</Link>
                <List>
                  <ListItem>Track up to 5 subscriptions</ListItem>
                  <ListItem>Basic analytics dashboard</ListItem>
                  <ListItem>Email reminders limits</ListItem>
                  <ListItem className="opacity-50">Custom category sorting</ListItem>
                </List>
              </Body>
            </Card>
          </motion.div>

          {/* Pro Plan */}
          <motion.div variants={cardReveal}>
            <Card className="border-orange-500/50 shadow-glow shadow-orange-500/20 transform md:-translate-y-4 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-orange-500 to-yellow-500 text-black text-[10px] font-bold uppercase tracking-wider rounded-full z-10 shadow-lg">
                Most Popular
              </div>
              <Header>
                <Plan>
                  <PlanName>Pro</PlanName>
                  <Badge>Save 20%</Badge>
                </Plan>
                <Price>
                  <MainPrice>$8</MainPrice>
                  <Period>/month</Period>
                  <OriginalPrice>$10</OriginalPrice>
                </Price>
                <Description>Advanced tooling to reclaim wasted expenses.</Description>
              </Header>
              <Body>
                <Link to="/login" className="btn-primary w-full mb-2 text-center block">Upgrade to Pro</Link>
                <List>
                  <ListItem>Unlimited subscription tracking</ListItem>
                  <ListItem>Full predictive analytics & charts</ListItem>
                  <ListItem>Smart 1-day & 3-day renewals alerts</ListItem>
                  <ListItem>Custom categorical mapping</ListItem>
                </List>
              </Body>
            </Card>
          </motion.div>

          {/* Enterprise Plan */}
          <motion.div variants={cardReveal}>
            <Card>
              <Header glassEffect={false}>
                <Plan>
                  <PlanName>Enterprise</PlanName>
                </Plan>
                <Price>
                  <MainPrice>$29</MainPrice>
                  <Period>/month</Period>
                </Price>
                <Description>For teams managing corporate software stacks.</Description>
              </Header>
              <Body>
                <Link to="/contact" className="btn-ghost w-full mb-2 text-center block">Contact Sales</Link>
                <List>
                  <ListItem>Everything in Pro</ListItem>
                  <ListItem>Team member seat assignments</ListItem>
                  <ListItem>SSO & advanced security logs</ListItem>
                  <ListItem>Direct API access & webhooks</ListItem>
                </List>
              </Body>
            </Card>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
