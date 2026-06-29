import Link from "next/link";
import {
  CheckSquare, Users, BarChart3, ArrowRight, Zap, Shield, Clock,
  Star, ChevronDown, Mail, MessageCircle, Kanban, Bell, Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: CheckSquare,
    title: "Powerful Task Management",
    desc: "Create, assign, and prioritize tasks. Set due dates, filter by status, and never miss a deadline.",
  },
  {
    icon: Kanban,
    title: "Kanban Board",
    desc: "Drag tasks between To Do, In Progress, and Done columns. Visualize your workflow at a glance.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    desc: "Build teams, invite members, assign tasks, and keep everyone aligned on shared goals.",
  },
  {
    icon: BarChart3,
    title: "Insightful Dashboard",
    desc: "Live stats, completion rates, overdue alerts, and upcoming deadlines — all in one place.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    desc: "In-app notification center keeps you updated on task changes, comments, and team activity.",
  },
  {
    icon: Archive,
    title: "Archive & Restore",
    desc: "Keep your workspace clean. Archive completed projects and restore them whenever needed.",
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Engineering Manager at Volta",
    avatar: "SC",
    quote:
      "TaskFlow replaced three separate tools for us. Our team's velocity improved by 40% in the first month.",
  },
  {
    name: "Marcus Williams",
    role: "Founder at Launchpad",
    avatar: "MW",
    quote:
      "The Kanban board and team collaboration features are exactly what a small startup needs. Clean, fast, no bloat.",
  },
  {
    name: "Priya Nair",
    role: "Product Lead at NovaBuild",
    avatar: "PN",
    quote:
      "Finally a task manager that doesn't require a 3-day onboarding. My team was up and running in 15 minutes.",
  },
];

const pricing = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for individuals and small projects",
    features: [
      "Up to 3 team members",
      "100 tasks per month",
      "Basic Kanban board",
      "7-day activity history",
      "Email support",
    ],
    cta: "Get started free",
    href: "/sign-up",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "per user / month",
    description: "For growing teams that need more power",
    features: [
      "Unlimited team members",
      "Unlimited tasks",
      "Advanced Kanban & calendar view",
      "Full activity history",
      "File attachments (5 GB)",
      "Priority support",
      "Custom labels",
    ],
    cta: "Start Pro trial",
    href: "/sign-up",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "For large organizations with advanced needs",
    features: [
      "Everything in Pro",
      "SSO / SAML",
      "Audit logs",
      "Dedicated account manager",
      "SLA guarantee",
      "On-premise option",
      "Custom integrations",
    ],
    cta: "Contact sales",
    href: "mailto:sales@taskflow.app",
    highlight: false,
  },
];

const faqs = [
  {
    q: "Is there a free plan?",
    a: "Yes! The Free plan supports up to 3 team members and 100 tasks per month — no credit card required.",
  },
  {
    q: "Can I import data from other tools?",
    a: "We support CSV import from Trello, Asana, and Linear. Full import guides are in our documentation.",
  },
  {
    q: "How does billing work for teams?",
    a: "Pro is billed per seat, per month. You only pay for active users. Upgrade or downgrade anytime.",
  },
  {
    q: "Is my data secure?",
    a: "All data is encrypted at rest and in transit. We use industry-standard security practices and conduct regular audits.",
  },
  {
    q: "Can I self-host TaskFlow?",
    a: "Enterprise customers can self-host TaskFlow on their own infrastructure. Contact our sales team for details.",
  },
  {
    q: "What happens if I cancel?",
    a: "You keep access until the end of your billing period. Export all your data any time — we never hold it hostage.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto border-b border-white/5">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
            T
          </div>
          TaskFlow
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10">
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-blue-500 hover:bg-blue-400 text-white">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-24 pb-20 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-300 mb-8">
          <Zap className="w-3.5 h-3.5" />
          Built for high-performing teams
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
          Command your tasks.{" "}
          <span className="text-blue-400">Empower your team.</span>
        </h1>
        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
          TaskFlow is the professional command center for small teams. Kanban boards, team
          collaboration, smart notifications — everything in one clean interface.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/sign-up">
            <Button size="lg" className="bg-blue-500 hover:bg-blue-400 text-white px-8 text-base">
              Start for free <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 px-8 text-base bg-transparent"
            >
              Sign in
            </Button>
          </Link>
        </div>
        <p className="text-sm text-slate-500 mt-4">No credit card required · Free forever plan available</p>
      </section>

      {/* Stats bar */}
      <section className="border-y border-white/5 bg-white/[0.02] py-8 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "10,000+", label: "Tasks completed daily" },
            { value: "500+", label: "Teams onboarded" },
            { value: "99.9%", label: "Uptime SLA" },
            { value: "< 2 min", label: "Average setup time" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-sm text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything your team needs</h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            A complete task management platform — without the complexity.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:bg-white/8 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-20 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by teams</h2>
            <div className="flex items-center justify-center gap-1 text-yellow-400 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400" />
              ))}
            </div>
            <p className="text-slate-400 text-sm">4.9 / 5 average rating</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, avatar, quote }) => (
              <div
                key={name}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col gap-4"
              >
                <div className="flex items-center gap-1 text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed flex-1">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-500/30 flex items-center justify-center text-blue-300 text-xs font-bold">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="text-xs text-slate-500">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Start free. Upgrade when your team is ready. No hidden fees.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {pricing.map(({ name, price, period, description, features: feats, cta, href, highlight }) => (
            <div
              key={name}
              className={`rounded-2xl border p-6 flex flex-col gap-5 relative ${
                highlight
                  ? "border-blue-500/60 bg-blue-500/10 ring-1 ring-blue-500/30"
                  : "border-white/10 bg-white/5"
              }`}
            >
              {highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most popular
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold">{name}</h3>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-3xl font-extrabold">{price}</span>
                  <span className="text-slate-500 text-sm">{period}</span>
                </div>
                <p className="text-slate-400 text-sm mt-1">{description}</p>
              </div>
              <ul className="space-y-2.5 flex-1">
                {feats.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={href}>
                <Button
                  className={`w-full ${
                    highlight
                      ? "bg-blue-500 hover:bg-blue-400 text-white"
                      : "border-white/20 bg-white/5 hover:bg-white/10 text-white"
                  }`}
                  variant={highlight ? "default" : "outline"}
                >
                  {cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-20 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently asked questions</h2>
            <p className="text-slate-400">Can&apos;t find the answer? <a href="mailto:support@taskflow.app" className="text-blue-400 hover:underline">Ask us directly.</a></p>
          </div>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <details key={q} className="group rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer font-medium text-sm hover:bg-white/5 transition-colors list-none">
                  {q}
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-4 text-sm text-slate-400 leading-relaxed">{a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-slate-400 mb-8">
            Join hundreds of teams already using TaskFlow. Free forever — no credit card needed.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="bg-blue-500 hover:bg-blue-400 text-white px-10 text-base">
              Create your free account <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 font-bold text-lg mb-3">
                <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-white text-sm font-bold">T</div>
                TaskFlow
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                The professional command center for small teams.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Account</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="/sign-up" className="hover:text-white transition-colors">Sign up</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  <a href="mailto:support@taskflow.app" className="hover:text-white transition-colors">
                    support@taskflow.app
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Live chat in-app</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-600">
            <p>© {new Date().getFullYear()} TaskFlow. All rights reserved.</p>
            <div className="flex gap-6">
              {[
                { icon: Shield, label: "Secure & private" },
                { icon: Zap, label: "Lightning fast" },
                { icon: Clock, label: "Real-time updates" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
