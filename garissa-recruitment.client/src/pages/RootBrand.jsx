import { IconUserPlus, IconListCheck, IconSend, IconChartDots } from "@tabler/icons-react";

const STEPS = [
  { icon: IconUserPlus, title: "Create your account", text: "Register with your email and ID number, then confirm the link we send you." },
  { icon: IconListCheck, title: "Complete your application", text: "Add your qualifications, experience, referees and documents — save and return any time." },
  { icon: IconSend, title: "Submit before the deadline", text: "We check everything is complete before your application reaches HR." },
  { icon: IconChartDots, title: "Track your progress", text: "See whether your application is submitted, under review or closed." },
];

const RootBrand = () => (
  <section className="bg-hero text-white">
    <div className="mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pb-20">
      <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-gold ring-1 ring-white/20">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-lime" aria-hidden="true" /> Careers at Garissa University
      </p>
      <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-tight text-white sm:text-5xl">
        Build your career at the <span className="text-brand-lime">Oasis of Innovation</span>
      </h1>
      <p className="mt-4 max-w-2xl text-base text-white/80 sm:text-lg">
        Browse open positions, apply online in a few guided steps, and follow your application from submission to outcome.
      </p>
      <a href="#open-positions" className="btn btn-lg mt-8 bg-brand-lime text-brand-forest hover:bg-white">
        View open positions
      </a>

      <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map(({ icon, title, text }, index) => {
          const Icon = icon;
          return (
          <li key={title} className="rounded-2xl bg-white/[0.07] p-5 ring-1 ring-white/15 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-lime/90 text-brand-forest">
                <Icon size={20} />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-white/60">Step {index + 1}</span>
            </div>
            <h2 className="mt-3 text-base font-semibold text-white">{title}</h2>
            <p className="mt-1 text-sm text-white/70">{text}</p>
          </li>
          );
        })}
      </ol>
    </div>
  </section>
);

export default RootBrand;
