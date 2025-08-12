import { useState, useEffect } from 'react';

const KEY = '2048.bestScore';

export function loadBest(): number { 
  if (typeof window === 'undefined') return 0;
  return Math.max(0, Number(localStorage.getItem(KEY) ?? 0)); 
}

export function saveBest(v: number) { 
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, String(v)); 
}

export function useBestScore(currentScore: number) {
  const [best, setBest] = useState(() => loadBest());
  
  useEffect(() => {
    if (currentScore > best) { 
      setBest(currentScore); 
      saveBest(currentScore); 
    }
  }, [currentScore, best]);
  
  return best;
}
