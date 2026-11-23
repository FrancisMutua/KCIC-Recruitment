import { IconCheck } from "@tabler/icons-react";

/**
 * Wizard progress. Desktop: numbered steps with labels. Mobile: "Step x of n" with a bar.
 * Steps up to `furthestStep` can be revisited.
 */
const Stepper = ({ steps, activeStep, furthestStep = activeStep, onStepClick }) => {
  const percent = Math.round(((activeStep + 1) / steps.length) * 100);
  return (
    <nav aria-label="Application steps">
      <div className="md:hidden">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-900">{steps[activeStep]}</span>
          <span className="text-slate-500">Step {activeStep + 1} of {steps.length}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-brand-green transition-all duration-500" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <ol className="hidden md:flex md:items-start">
        {steps.map((step, index) => {
          const done = index < activeStep || (index <= furthestStep && index !== activeStep);
          const current = index === activeStep;
          const reachable = index <= Math.max(furthestStep, activeStep);
          return (
            <li key={step} className="relative flex flex-1 flex-col items-center">
              {index > 0 && (
                <span aria-hidden="true" className={`absolute left-0 right-1/2 top-4 h-0.5 -translate-x-0 ${index <= Math.max(furthestStep, activeStep) ? "bg-brand-green" : "bg-slate-200"}`} />
              )}
              {index < steps.length - 1 && (
                <span aria-hidden="true" className={`absolute left-1/2 right-0 top-4 h-0.5 ${index < Math.max(furthestStep, activeStep) ? "bg-brand-green" : "bg-slate-200"}`} />
              )}
              <button type="button" disabled={!reachable} onClick={() => onStepClick?.(index)} aria-current={current ? "step" : undefined}
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ring-4 ring-slate-50 transition ${
                  current ? "bg-brand-lime text-brand-forest ring-brand-lime/30" :
                  done ? "bg-brand-green-600 text-white hover:bg-brand-green-700" :
                  "border border-slate-300 bg-white text-slate-400"} disabled:cursor-not-allowed`}>
                {done && !current ? <IconCheck size={16} stroke={3} /> : index + 1}
                <span className="sr-only">{step}{done ? " (completed)" : ""}</span>
              </button>
              <span className={`mt-2 max-w-[6.5rem] text-center text-xs leading-tight ${current ? "font-semibold text-slate-900" : reachable ? "text-slate-600" : "text-slate-400"}`} aria-hidden="true">
                {step}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Stepper;
