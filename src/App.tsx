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
  const [showResultText, setShowResultText] = useState(false);
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

    // Logic: 0 clicks = Random, Odd clicks = Xỉu (< 11), Even clicks (>=2) = Tài (>= 11)
    const isControlled = bowlClickCount > 0;
    const targetIsBig = bowlClickCount % 2 === 0;

    do {
      newResults = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ];
      sum = newResults.reduce((a, b) => a + b, 0);

      if (!isControlled) break; // Fully random if no clicks
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
    setBowlClickCount(0); // Reset for next round
  };

  const handleShake = () => {
    if (isShaking) return;

    if (isOpen) {
      setIsOpen(false);
      setShowResultText(false);
      setBowlTransform({ x: 0, y: 0, scale: 1, rotate: 0 });
      setTimeout(performShake, 300);
    } else {
      performShake();
    }
  };

  const performShake = () => {
    setIsShaking(true);
    let startTime = Date.now();
    const duration = 1000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        clearInterval(interval);
        setIsShaking(false);
        setBowlTransform({ x: 0, y: 0, scale: 1, rotate: 0 });
        randomizeDice();
        return;
      }

      const dx = (Math.random() - 0.5) * 60;
      const dy = (Math.random() - 0.5) * 60;
      const dr = Math.random() * 16 - 8;
      setBowlTransform({ x: dx, y: dy, scale: 1.05, rotate: dr });
    }, 30);
  };

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (isOpen || isShaking) return;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX, y: clientY });
  };

  const onDrag = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

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
      setBowlTransform({ x: deltaX * 3, y: deltaY * 3, scale: 1.5, rotate: deltaX * 0.2 });
      setLastResults(prev => [[...diceResults], ...prev.slice(0, 9)]);
      setTimeout(() => setShowResultText(true), 300);
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

  const total = diceResults.reduce((a, b) => a + b, 0);
  const resultType = total >= 11 ? 'TÀI' : 'XỈU';

  return (
    <div className="flex h-screen w-full flex-col items-center justify-between bg-black font-display text-white overflow-hidden select-none relative p-2 md:p-6">

      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-20%] left-[-20%] size-[60%] transition-colors duration-1000 blur-[150px] rounded-full ${isShaking ? 'bg-primary/10' : 'bg-primary/5'}`}></div>
        <div className={`absolute bottom-[-20%] right-[-20%] size-[60%] transition-colors duration-1000 blur-[150px] rounded-full ${isShaking ? 'bg-amber-500/10' : 'bg-amber-500/5'}`}></div>
      </div>

      {/* History Bar - Scaled for mobile */}
      <div className="relative mt-2 md:mt-4 flex flex-wrap justify-center gap-1.5 md:gap-2 z-20 w-full max-w-[95vw]">
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

      {/* Plate Area */}
      <div className="relative flex-1 flex flex-col items-center justify-center w-full max-w-2xl px-4 min-h-0">

        {/* Result Announcement - Centered and Styled with Inter */}
        <div className={`absolute left-0 right-0 top-0 md:top-[-80px] flex flex-col items-center justify-center transition-all duration-1000 z-[100] pointer-events-none ${showResultText ? 'opacity-100 scale-100 translate-y-[-20px] md:translate-y-0' : 'opacity-0 scale-90 translate-y-10'}`}>
          <div className="flex items-center justify-center gap-6 mb-[-15px] w-full">
            <div className="h-[2px] flex-1 max-w-[80px] md:max-w-[120px] bg-gradient-to-r from-transparent to-primary/60"></div>
            <span className="text-9xl md:text-[12rem] font-[900] text-white drop-shadow-[0_0_80px_rgba(225,29,72,0.8)] tracking-tighter leading-none select-none">
              {total}
            </span>
            <div className="h-[2px] flex-1 max-w-[80px] md:max-w-[120px] bg-gradient-to-l from-transparent to-primary/60"></div>
          </div>

          <div className="relative flex flex-col items-center mt-2">
            <span className={`text-2xl md:text-4xl font-black tracking-[1.8em] uppercase transition-all duration-700 mr-[-1.8em] ${resultType === 'TÀI' ? 'text-primary drop-shadow-[0_0_30px_rgba(225,29,72,0.6)]' : 'text-zinc-500'}`}>
              {resultType}
            </span>
            <div className={`mt-4 w-32 md:w-48 h-[3px] rounded-full bg-gradient-to-r from-transparent via-current to-transparent opacity-30 ${resultType === 'TÀI' ? 'text-primary' : 'text-zinc-500'}`}></div>
          </div>
        </div>

        {/* Plate System */}
        <div className="relative group cursor-grab active:cursor-grabbing scale-[0.75] sm:scale-90 md:scale-110 transition-transform duration-500 z-10">

          {/* Ambient Lighting Rings */}
          <div className={`absolute inset-[-120px] bg-primary/5 blur-[120px] rounded-full transition-opacity duration-1000 pointer-events-none ${isShaking ? 'opacity-100 animate-pulse' : 'opacity-20'}`}></div>

          {/* The Plate (Đĩa) - High-end Ceramic feel */}
          <div className="size-[320px] md:size-[420px] rounded-full bg-gradient-to-br from-zinc-800 via-zinc-950 to-black border-2 border-white/5 shadow-[0_60px_100px_-20px_rgba(0,0,0,1),inset_0_0_40px_rgba(255,255,255,0.02)] flex items-center justify-center p-10 md:p-14 relative overflow-visible">

            {/* Inner Plate Recess */}
            <div className="size-full rounded-full bg-zinc-950/90 shadow-[inset_0_15px_60px_rgba(0,0,0,0.9)] border border-white/5 flex items-center justify-center relative overflow-hidden backdrop-blur-md">

              {/* Floor Pattern */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] [background-size:32px_32px]"></div>

              {/* Dice Container - Natural Scattered Positioning */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none drop-shadow-[0_25px_25px_rgba(0,0,0,0.8)]">
                {diceResults.map((num, i) => (
                  <div
                    key={i}
                    className="absolute animate-in zoom-in-75 duration-700"
                    style={{
                      animationDelay: `${i * 150}ms`,
                      transform: `translate(${diceOffsets[i].x}px, ${diceOffsets[i].y}px)`
                    }}
                  >
                    <Dice number={num} rotation={diceRotations[i]} />
                  </div>
                ))}
              </div>

              {/* The Bowl - Semi-transparent Development Mode */}
              <div
                onMouseDown={startDrag}
                onTouchStart={startDrag}
                onClick={() => !isShaking && !isOpen && setBowlClickCount(prev => prev + 1)}
                style={{
                  transform: `translate(${bowlTransform.x}px, ${bowlTransform.y}px) scale(${bowlTransform.scale}) rotate(${bowlTransform.rotate}deg)`,
                  transition: isDragging || isShaking ? 'none' : 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease'
                }}
                className={`absolute inset-0 rounded-full bg-zinc-900/60 backdrop-blur-[1px] border-[5px] border-white/10 flex items-center justify-center select-none z-50 shadow-[0_40px_80px_rgba(0,0,0,0.9)] transition-all duration-500 overflow-hidden ring-1 ring-white/5 cursor-pointer active:scale-[0.97] ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:bg-zinc-800/60'}`}
              >
                <div className="flex flex-col items-center gap-5 relative z-10 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
                  <span className="material-symbols-outlined text-6xl md:text-8xl text-white">fingerprint</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Simplified Action Footer */}
      <div className="w-full h-40 md:h-56 flex flex-col items-center justify-center z-10">
        <button
          onClick={handleShake}
          disabled={isShaking}
          className={`relative group px-20 py-6 md:px-28 md:py-8 rounded-full overflow-hidden transition-all duration-500 active:scale-95 shadow-2xl ${isShaking ? 'cursor-not-allowed grayscale-[0.5]' : 'hover:scale-105 shadow-primary/20'}`}
        >
          <div className="absolute inset-0 bg-primary/95 group-hover:bg-primary transition-colors duration-300"></div>

          <div className="relative flex items-center gap-4">
            <span className={`material-symbols-outlined text-white text-2xl font-black transition-all duration-700 ${isShaking ? 'animate-spin' : 'group-hover:rotate-180 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]'}`}>
              {isShaking ? 'progress_activity' : 'casino'}
            </span>
            <span className="text-white font-black uppercase text-sm md:text-lg">
              {isShaking ? 'Đang xóc...' : 'Xóc Đĩa'}
            </span>
          </div>
          <div className="absolute inset-x-0 top-0 h-[1px] bg-white/30"></div>
        </button>
      </div>
    </div>
  );
};

export default App;
