"use client";

import Rocket from "@/components/Rocket";
import MarkerDetectorComponent from "../components/MarkerDetector";
import { useEffect, useRef, useState } from "react";
import Asteroid from "../components/asteroids";
import GameLogic from "@/components/gameLogic";
import { BackgroundBeams } from "@/components/background-beams";

let isInvincible = false;
let astroidGenerationInterval: any;
let removeAstroidInterval: any;
let livesRemaining: number;
let distanceInterval: any;

export default function Home() {
  const [rocketLeft, setRocketLeft] = useState(0);
  const [degrees, setDegrees] = useState(0);
  const [asteroids, setAsteroids] = useState<any[]>([]);
  const [isMarkersDetected, setIsMarkersDetected] = useState(false);
  const [detectCollisionTrigger, setDetectCollisionTrigger] =
    useState<number>(0);

  const [livesRemainingState, setLivesRemainingState] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const rocketRef = useRef<HTMLDivElement>(null);
  const [rocket, setRocket] = useState<any>();

  const [isLoading, setisLoading] = useState(false);
  const [isColliding, setIsColliding] = useState(false);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    if (isMarkersDetected && !isGameOver) {
      distanceInterval = setInterval(() => {
        setDistance((prev) => prev + 1);
      }, 100);
    }

    return () => {
      clearInterval(distanceInterval);
    };
  }, [isMarkersDetected, isGameOver]);

  useEffect(() => {
    setRocketLeft(window.innerWidth / 2);
    livesRemaining = 4;
    setLivesRemainingState(livesRemaining);
  }, []);

  useEffect(() => {
    if (isMarkersDetected && !isGameOver) {
      astroidGenerationInterval = setInterval(() => {
        setAsteroids((prevArr) => {
          let retArr = [...prevArr];
          for (let i = 0; i < 4; i++) {
            const now = Date.now();
            retArr = [
              ...retArr,
              {
                timeStamp: now,
                key: `${now}-${Math.random()}`,
              },
            ];
          }
          return retArr;
        });
      }, 1000);

      removeAstroidInterval = setInterval(() => {
        const now = Date.now();
        setAsteroids((prevArr) => {
          return prevArr.filter((a) => now - a.timeStamp < 5000);
        });
      }, 5000);
    } else {
      clearInterval(astroidGenerationInterval);
      clearInterval(removeAstroidInterval);
    }

    return () => {
      clearInterval(astroidGenerationInterval);
      clearInterval(removeAstroidInterval);
    };
  }, [isMarkersDetected, isGameOver]);

  const setMarkerResults = (result: any) => {
    setisLoading(result.isLoading);
    if (result.degrees !== undefined) {
      setDegrees(result.degrees);
    }

    if (result.isDetected !== undefined) {
      setIsMarkersDetected(result.isDetected);
    }

    if (result.degrees && result.degrees !== 0) {
      setDetectCollisionTrigger(Math.random());
      setRocketLeft((prev) => {
        const ret = prev + result.degrees / 6;

        if (ret < 20) return prev;
        if (ret > window.innerWidth - 52) return prev;

        return ret;
      });
    }

    if (rocketRef.current) {
      setRocket(rocketRef.current.getBoundingClientRect());
    }
  };

  const collisionHandler = () => {
    if (!isInvincible && !isGameOver) {
      console.log("COLLISION");
      isInvincible = true;
      setIsColliding(isInvincible);
      livesRemaining--;
      setLivesRemainingState(livesRemaining);
      if (livesRemaining <= 0) {
        setIsGameOver(true);
      }
      setTimeout(() => {
        isInvincible = false;
        setIsColliding(isInvincible);
      }, 1500);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className={`absolute left-3 top-3 z-30 w-24 `}>
        <MarkerDetectorComponent setMarkerResult={setMarkerResults} />
      </div>

      <div
        ref={rocketRef}
        id="rocket-container"
        className={`${!isMarkersDetected ? "hidden" : ""}`}
        style={{
          position: "absolute",
          left: rocketLeft,
          marginTop: 700,
          transition: "all",
          animationDuration: "10ms",
        }}
      >
        <Rocket degrees={degrees} />
      </div>

      <div
        id="asteroids-container"
        className="absolute z-10 h-screen w-screen overflow-hidden"
      >
        {asteroids.map((a) => (
          <Asteroid
            key={a.key}
            isMoving={isMarkersDetected}
            what={rocket}
            soWhat={collisionHandler}
            when={detectCollisionTrigger}
          />
        ))}
      </div>

      <GameLogic
        info={{
          isLoading,
          isMarkersDetected,
          isColliding,
          distance,
          livesRemainingState,
          isGameOver,
        }}
      />
      <BackgroundBeams />
    </main>
  );
}
