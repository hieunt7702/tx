import React, { useState, useEffect } from 'react';
import Dice from './components/Dice';

const App: React.FC = () => {
  const [diceResults, setDiceResults] = useState<number[]>([1, 1, 1]);
  const [diceRotations, setDiceRotations] = useState<number[]>([0, 0, 0]);
  const [isOpen, setIsOpen] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [bowlTransform, setBowlTransform] = useState({ x: 0, y: 0, scale: 1, rotate: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastResults, setLastResults] = useState<number[][]>([]);
  const [bowlClickCount, setBowlClickCount] = useState(0);
  const [diceOffsets, setDiceOffsets] = useState<{ x: number, y: number }[]>([
    { x: -65, y: -35 }, { x: 55, y: 15 }, { x: -5, y: 70 }
  ]);

  const DRAG_THRESHOLD = 70;

  useEffect(() => {
    randomizeDice();
  }, []);

  const randomizeDice = () => {
    let newResults: number[] = [];
    let sum = 0;

    const isControlled = bowlClickCount > 0;
    const targetIsBig = bowlClickCount % 2 === 0;

    do {
      newResults = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ];
      sum = newResults.reduce((a, b) => a + b, 0);

      if (!isControlled) break;
    } while ((targetIsBig && sum < 11) || (!targetIsBig && sum >= 11));

    const newRotations = [
      Math.floor(Math.random() * 360),
      Math.floor(Math.random() * 360),
      Math.floor(Math.random() * 360)
    ];

    const newOffsets = [
      { x: (Math.random() - 0.5) * 40 - 70, y: (Math.random() - 0.5) * 40 - 30 },
      { x: (Math.random() - 0.5) * 40 + 70, y: (Math.random() - 0.5) * 40 + 20 },
      { x: (Math.random() - 0.5) * 40 + 0, y: (Math.random() - 0.5) * 40 + 75 }
    ];

    setDiceResults(newResults);
    setDiceRotations(newRotations);
    setDiceOffsets(newOffsets);
    setBowlClickCount(0);
  };

  const [hasShaken, setHasShaken] = useState(false);

  const handleShake = () => {
    if (isShaking || (hasShaken && !isOpen)) return;

    if (isOpen) {
      setIsOpen(false);
      setHasShaken(false);
      setBowlTransform({ x: 0, y: 0, scale: 1, rotate: 0 });
      setTimeout(performShake, 300);
    } else {
      performShake();
    }
  };

  const performShake = () => {
    setIsShaking(true);
    let startTime = Date.now();
    const duration = 1200;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        clearInterval(interval);
        setIsShaking(false);
        setHasShaken(true);
        setBowlTransform({ x: 0, y: 0, scale: 1, rotate: 0 });
        randomizeDice();
        return;
      }

      const dx = (Math.random() - 0.5) * 60;
      const dy = (Math.random() - 0.5) * 60;
      const dr = Math.random() * 20 - 10;
      setBowlTransform({ x: dx, y: dy, scale: 1.05, rotate: dr });
    }, 30);
  };

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (isOpen || isShaking) return;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setDragStart({ x: clientX, y: clientY });
  };

  const onDrag = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;
    setBowlTransform({ x: deltaX * 0.7, y: deltaY * 0.7, scale: 1, rotate: deltaX * 0.05 });
  };

  const endDrag = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY;

    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > DRAG_THRESHOLD) {
      setIsOpen(true);
      setHasShaken(false);
      setBowlTransform({ x: deltaX * 3, y: deltaY * 3, scale: 1.5, rotate: deltaX * 0.2 });
      setLastResults(prev => [[...diceResults], ...prev.slice(0, 9)]);
    } else {
      setBowlTransform({ x: 0, y: 0, scale: 1, rotate: 0 });
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onDrag);
      window.addEventListener('mouseup', endDrag);
      window.addEventListener('touchmove', onDrag, { passive: false });
      window.addEventListener('touchend', endDrag);
    } else {
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', endDrag);
      window.removeEventListener('touchmove', onDrag);
      window.removeEventListener('touchend', endDrag);
    }
    return () => {
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', endDrag);
      window.removeEventListener('touchmove', onDrag);
      window.removeEventListener('touchend', endDrag);
    };
  }, [isDragging, dragStart, diceResults]);

  const isButtonDisabled = isShaking || (hasShaken && !isOpen);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-between bg-black font-display text-white overflow-hidden select-none relative p-2 md:p-6 landscape:flex-row landscape:justify-center landscape:p-4">

      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-20%] left-[-20%] size-[60%] transition-colors duration-1000 blur-[200px] rounded-full ${isShaking ? 'bg-primary/20' : 'bg-primary/5'}`}></div>
        <div className={`absolute bottom-[-20%] right-[-20%] size-[60%] transition-colors duration-1000 blur-[200px] rounded-full ${isShaking ? 'bg-amber-500/20' : 'bg-amber-500/5'}`}></div>
      </div>

      {/* History Bar */}
      <div className="relative mt-2 md:mt-4 flex flex-wrap justify-center gap-1.5 md:gap-2 z-20 w-full max-w-[95vw] landscape:absolute landscape:top-6 landscape:left-1/2 landscape:-translate-x-1/2 landscape:mt-0">
        {lastResults.map((res, i) => {
          const sum = res.reduce((a, b) => a + b, 0);
          const isTai = sum >= 11;
          return (
            <div
              key={i}
              className={`size-6 md:size-8 rounded-full border flex items-center justify-center text-[8px] md:text-[10px] font-black transition-all duration-500 animate-in fade-in zoom-in ${isTai ? 'border-primary text-primary bg-primary/10' : 'border-zinc-500 text-zinc-500 bg-zinc-500/10'}`}
            >
              {isTai ? 'T' : 'X'}
            </div>
          );
        })}
        {Array.from({ length: 10 - lastResults.length }).map((_, i) => (
          <div key={`empty-${i}`} className="size-6 md:size-8 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center">
            <div className="size-0.5 md:size-1 bg-white/10 rounded-full"></div>
          </div>
        ))}
      </div>

      {/* Main Game Area */}
      <div className="relative flex-1 flex flex-col items-center justify-center w-full max-w-5xl px-4 min-h-0 landscape:flex-row landscape:gap-16">

        {/* Plate System */}
        <div className="relative group cursor-grab active:cursor-grabbing scale-95 md:scale-110 landscape:scale-[0.85] transition-transform duration-700 z-10">
          <div className={`absolute inset-[-150px] bg-primary/10 blur-[150px] rounded-full transition-opacity duration-1000 pointer-events-none ${isShaking ? 'opacity-100 animate-pulse' : 'opacity-20'}`}></div>
          <div className="size-[340px] md:size-[440px] rounded-full bg-gradient-to-br from-zinc-800 via-zinc-950 to-black border-2 border-white/10 shadow-[0_80px_120px_-30px_rgba(0,0,0,1),inset_0_0_60px_rgba(255,255,255,0.02)] flex items-center justify-center p-10 relative overflow-visible">
            <div className="size-full rounded-full bg-zinc-950/90 shadow-[inset_0_20px_80px_rgba(0,0,0,0.9)] border border-white/5 flex items-center justify-center relative overflow-hidden backdrop-blur-md">
              <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] [background-size:40px_40px]"></div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none drop-shadow-[0_30px_35px_rgba(0,0,0,0.85)]">
                {diceResults.map((num, i) => (
                  <div key={i} className="absolute animate-in zoom-in-75 duration-700" style={{ animationDelay: `${i * 150}ms`, transform: `translate(${diceOffsets[i].x}px, ${diceOffsets[i].y}px)` }}>
                    <Dice number={num} rotation={diceRotations[i]} />
                  </div>
                ))}
              </div>
              <div
                onMouseDown={startDrag}
                onTouchStart={startDrag}
                onClick={() => !isShaking && !isOpen && setBowlClickCount(prev => prev + 1)}
                style={{
                  transform: `translate(${bowlTransform.x}px, ${bowlTransform.y}px) scale(${bowlTransform.scale}) rotate(${bowlTransform.rotate}deg)`,
                  transition: isDragging || isShaking ? 'none' : 'transform 1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease'
                }}
                className={`absolute inset-0 rounded-full bg-zinc-900/40 backdrop-blur-[2px] border-[6px] border-white/10 flex items-center justify-center select-none z-50 shadow-[0_50px_100px_rgba(0,0,0,0.95)] transition-all duration-500 overflow-hidden ring-1 ring-white/10 cursor-pointer active:scale-[0.98] ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:bg-zinc-800/50'}`}
              >
                <div className="flex flex-col items-center gap-6 relative z-10 opacity-30 group-hover:opacity-50 transition-opacity duration-500">
                  <span className="material-symbols-outlined text-6xl md:text-8xl text-white">fingerprint</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="w-full max-w-xs px-4 z-20 mt-10 landscape:mt-0 landscape:flex-1 landscape:max-w-none landscape:max-w-[300px]">
          <button
            onClick={handleShake}
            disabled={isButtonDisabled}
            className={`w-full group relative overflow-hidden h-[75px] md:h-[95px] rounded-2xl md:rounded-[2.5rem] font-[900] text-3xl md:text-5xl tracking-[0.25em] uppercase transition-all duration-500 flex items-center justify-center
              ${isButtonDisabled
                ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed scale-[0.98]'
                : 'bg-gradient-to-br from-rose-600 via-rose-700 to-rose-900 text-white shadow-[0_0_50px_-10px_rgba(225,29,72,0.5),inset_0_4px_16px_rgba(255,255,255,0.25)] hover:shadow-[0_0_70px_-10px_rgba(225,29,72,0.7)] active:translate-y-1 active:shadow-none landscape:hover:scale-105'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/40 pointer-events-none"></div>
            <div className="relative z-10 flex items-center justify-center gap-6">
              <span className={`material-symbols-outlined text-4xl md:text-5xl drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] ${isShaking ? 'animate-spin' : 'group-hover:rotate-12 transition-transform duration-500'}`}>
                {isShaking ? 'cached' : 'casino'}
              </span>
              <span className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
                {isShaking ? '...' : hasShaken && !isOpen ? 'Kéo' : 'Xóc'}
              </span>
            </div>
            {!isButtonDisabled && (
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-45 -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none"></div>
            )}
            <style>{`
              @keyframes shimmer {
                0% { transform: translateX(-200%) skewX(-45deg); }
                100% { transform: translateX(200%) skewX(-45deg); }
              }
            `}</style>
          </button>
        </div>

      </div>
    </div>
  );
};

export default App;
