import { Loader2, RocketIcon } from "lucide-react";
import React from "react";

type Props = {
  info: {
    isLoading: boolean;
    isMarkersDetected: boolean;
    isColliding: boolean;
    distance: number;
    livesRemainingState: number;
    isGameOver: boolean;
  };
};

const GameLogic: React.FC<Props> = ({ info }) => {
  const {
    isLoading,
    isMarkersDetected,
    isColliding,
    distance,
    livesRemainingState,
    isGameOver,
  } = info;

  const lives = [];
  for (let i = 0; i < livesRemainingState; i++) {
    lives.push(<RocketIcon key={i} size={20} className="fill-white-600" />);
  }

  return (
    <div
      className={`absolute z-30 h-screen w-screen flex items-center justify-center ${
        isColliding ? "border-[20px] border-red-600" : ""
      }`}
    >
      {isLoading && <Loader2 size={80} className="animate-spin" />}
      {!isMarkersDetected && !isGameOver && (
        <div className="text-2xl font-extrabold animate-ping">P A U S E D</div>
      )}
      {isGameOver && (
        <div className="text-2xl font-extrabold animate-ping" >
          G A M E - O V E R
        </div>
      )}
      <div className="fixed top-6 right-6">{`Distance: ${distance}`}</div>
      <div className="fixed top-12 right-6 flex flex-row gap-1">{lives}</div>
    </div>
  );
};

export default GameLogic;
