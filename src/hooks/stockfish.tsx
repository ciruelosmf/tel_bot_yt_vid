// hooks/useStockfish.ts
"use client";

import { useEffect, useState } from 'react';

export const useStockfish = () => {
  const [engine, setEngine] = useState<Worker | null>(null);

  useEffect(() => {
    // Ensure we're in the browser
    if (typeof window !== 'undefined') {
      // Instantiate the Web Worker from the public directory
      const worker = new Worker('/stockfish.wasm.js');
      setEngine(worker);
    }

    // Clean up the worker when the component unmounts
    return () => {
      if (engine) {
        engine.terminate();
      }
    };
  }, []);

  return engine;
};