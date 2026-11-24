import React from 'react';
import { IconCircleCheck, IconClock } from "@tabler/icons-react";

const Stepper = ({ steps, activeStep, onStepClick, stepBgColor = "bg-slate-50" }) => {
  return (
    <div className="flex items-start justify-between relative max-w-6xl mx-auto w-full">
      <div 
        className="absolute left-0 top-[18px] w-full h-1 rounded-full bg-slate-200" 
        style={{ left: '5%', width: '90%' }}
      ></div>
      
      <div 
        className="absolute left-0 top-[18px] h-1 rounded-full bg-brand-green transition-all duration-500"
        style={{ 
          left: '5%',
          width: `${activeStep === 0 ? 0 : (activeStep / (steps.length - 1)) * 90}%` 
        }}
      ></div>

      {steps.map((step, index) => {
        const isCompleted = index < activeStep;
        const isActive = index === activeStep;

        return (
          <div 
            key={index} 
            className={`flex flex-col items-center ${stepBgColor} z-10 cursor-pointer group`}
            onClick={() => onStepClick && onStepClick(index)}
          >
            <div 
              className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ring-4 ring-white shadow-sm transition-all duration-300 ${
                isCompleted ? "bg-brand-green-600 border-brand-green-600 text-white" :
                isActive ? "bg-brand-green-400 border-brand-green-400 text-brand-green-800 scale-110" :
                "bg-slate-100 border-slate-300 text-slate-400"
              } group-hover:scale-110`}
            >
              {isCompleted ? (
                <IconCircleCheck size={20} stroke={2} />
              ) : isActive ? (
                <IconClock size={20} stroke={2} />
              ) : (
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              )}
            </div>
            <span className={`mt-2.5 hidden sm:block text-xs font-medium text-center max-w-[88px] leading-tight ${
              isActive ? "text-slate-900 font-semibold" : 
              isCompleted ? "text-slate-600" :
              "text-slate-400"
            }`}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;
