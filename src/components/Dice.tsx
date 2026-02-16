import React from 'react';

interface DiceProps {
    number: number;
    rotation?: number;
}

const Dice: React.FC<DiceProps> = ({ number, rotation = 0 }) => {
    const dotBase = "bg-[#fdfdfc] rounded-full shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.4),0_0.5px_1px_rgba(255,255,255,0.3)]";
    const dotHighlight = "bg-white rounded-full scale-110 shadow-[0_0_12px_rgba(255,255,255,0.4),inset_0_1px_2px_rgba(0,0,0,0.3)] border-[0.5px] border-white/20";

    const getFaceContent = (n: number) => {
        const dotSize = "size-[14px]";
        const centerDotSize = "size-[22px]";

        switch (n) {
            case 1:
                return (
                    <div className="flex items-center justify-center w-full h-full">
                        <div className={`${centerDotSize} ${dotHighlight}`}></div>
                    </div>
                );
            case 2:
                return (
                    <div className="flex flex-col justify-between items-center w-full h-full p-4">
                        <div className={`${dotSize} ${dotBase} self-start`}></div>
                        <div className={`${dotSize} ${dotBase} self-end`}></div>
                    </div>
                );
            case 3:
                return (
                    <div className="flex flex-col justify-between items-center w-full h-full p-3.5">
                        <div className={`${dotSize} ${dotBase} self-start`}></div>
                        <div className={`${dotSize} ${dotBase} self-center`}></div>
                        <div className={`${dotSize} ${dotBase} self-end`}></div>
                    </div>
                );
            case 4:
                return (
                    <div className="flex flex-col justify-between w-full h-full p-4">
                        <div className="flex justify-between w-full">
                            <div className={`${dotSize} ${dotBase}`}></div>
                            <div className={`${dotSize} ${dotBase}`}></div>
                        </div>
                        <div className="flex justify-between w-full">
                            <div className={`${dotSize} ${dotBase}`}></div>
                            <div className={`${dotSize} ${dotBase}`}></div>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="flex flex-col justify-between w-full h-full p-3.5">
                        <div className="flex justify-between w-full">
                            <div className={`${dotSize} ${dotBase}`}></div>
                            <div className={`${dotSize} ${dotBase}`}></div>
                        </div>
                        <div className="flex justify-center w-full">
                            <div className={`${dotSize} ${dotBase}`}></div>
                        </div>
                        <div className="flex justify-between w-full">
                            <div className={`${dotSize} ${dotBase}`}></div>
                            <div className={`${dotSize} ${dotBase}`}></div>
                        </div>
                    </div>
                );
            case 6:
                return (
                    <div className="flex flex-col justify-between w-full h-full p-3.5">
                        <div className="flex justify-between w-full">
                            <div className={`${dotSize} ${dotBase}`}></div>
                            <div className={`${dotSize} ${dotBase}`}></div>
                        </div>
                        <div className="flex justify-between w-full">
                            <div className={`${dotSize} ${dotBase}`}></div>
                            <div className={`${dotSize} ${dotBase}`}></div>
                        </div>
                        <div className="flex justify-between w-full">
                            <div className={`${dotSize} ${dotBase}`}></div>
                            <div className={`${dotSize} ${dotBase}`}></div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="scene" style={{ transform: `rotate(${rotation}deg)` }}>
            <div className={`cube show-${number}`}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className={`cube__face cube__face--${i}`}>
                        {getFaceContent(i)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dice;
