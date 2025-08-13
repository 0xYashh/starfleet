'use client';

import { useState, useEffect } from 'react';

interface SceneLoaderProps {
  children: React.ReactNode;
}

export function SceneLoader({ children }: SceneLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress for 3D universe preparation
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2; // Increment by 2% every 60ms for smooth progress
      });
    }, 60);

    // Keep loading screen for 4 seconds to allow full 3D scene preparation
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 4000); // 4 seconds

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-white text-center max-w-sm">
          <div className="w-16 h-16 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold [font-family:var(--font-barriecito)] mb-4">
            Initializing Starfleet
          </h2>
          <p className="text-white/60 text-sm mb-6">Preparing 3D universe...</p>
          
          {/* Progress bar */}
          <div className="w-full bg-white/10 rounded-full h-2 mb-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <p className="text-white/40 text-xs">
            {loadingProgress < 30 && "Loading planetary systems..."}
            {loadingProgress >= 30 && loadingProgress < 60 && "Positioning spacecraft..."}
            {loadingProgress >= 60 && loadingProgress < 90 && "Calibrating orbital mechanics..."}
            {loadingProgress >= 90 && "Finalizing universe..."}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
