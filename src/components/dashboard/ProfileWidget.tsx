"use client";

export default function ProfileWidget() {
  return (
    <div className="glass p-6 h-full flex flex-col items-center justify-center relative">
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="56"
            cy="56"
            r="52"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="4"
          />
          <circle
            cx="56"
            cy="56"
            r="52"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="4"
            strokeDasharray="326.7"
            strokeDashoffset="100" // Example progress
            className="transition-all duration-1000"
          />
        </svg>
        
        <div className="w-24 h-24 rounded-full overflow-hidden border-[3px] border-white z-10">
          <img src="https://ui-avatars.com/api/?name=Budi&background=random" alt="Profile" className="w-full h-full object-cover" />
        </div>
      </div>
      
      <div className="mt-4 flex gap-1 items-center justify-center">
         <div className="w-12 h-1 bg-blue-200 rounded-full"></div>
         <div className="w-6 h-1 bg-slate-200 rounded-full"></div>
      </div>
      
      <div className="mt-4 opacity-50">
        <svg width="100%" height="20" viewBox="0 0 200 20" preserveAspectRatio="none">
          <path d="M0,10 Q50,20 100,10 T200,10" fill="none" stroke="#93c5fd" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}
