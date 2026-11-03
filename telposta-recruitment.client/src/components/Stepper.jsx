import React from 'react';
import { IconCircleCheck, IconClock } from "@tabler/icons-react";

const Stepper = ({ steps, activeStep, onStepClick, stepBgColor = "bg-slate-50" }) => {
  return (
    <div className="flex items-center justify-between relative max-w-6xl mx-auto w-full">
      <div 
        className="absolute left-0 top-5 w-full h-0.5 bg-gray-200" 
        style={{ left: '5%', width: '90%' }}
      ></div>
      
      <div 
        className="absolute left-0 top-5 h-0.5 bg-green-500 transition-all duration-500"
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
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                isCompleted ? "bg-green-300 border-green-300 text-white" :
                isActive ? "bg-orange-200 border-orange-200 text-white scale-110" :
                "bg-gray-100 border-gray-300 text-gray-400"
              } group-hover:scale-110`}
            >
              {isCompleted ? (
                <IconCircleCheck size={20} stroke={2} />
              ) : isActive ? (
                <IconClock size={20} stroke={2} />
              ) : (
                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
              )}
            </div>
            <span className={`mt-3 text-[10px] font-medium text-center max-w-[60px] leading-tight ${
              isActive ? "text-gray-900 font-semibold" : 
              isCompleted ? "text-gray-600" :
              "text-gray-400"
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
