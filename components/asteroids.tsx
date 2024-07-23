import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

type Props = {
  isMoving?: boolean;
  what: any;
  soWhat: () => void;
  when: any;
};

const Asteroid = ({ isMoving, what, soWhat, when }: Props) => {
  const [xState, setXState] = useState(0);
  const [yState, setYState] = useState(0);
  const [rotation, setRotation] = useState(0);
  const asteroidRef = useRef(null);

  useEffect(() => {
    detectCollision();
  }, [when]);

  const detectCollision = () => {
    if (asteroidRef.current) {
      const asteroid = (asteroidRef.current as any).getBoundingClientRect();
      const didCollide =
        asteroid.left + 30 < what.right &&
        asteroid.right - 30 > what.left &&
        asteroid.bottom - 30 > what.top &&
        asteroid.top + 30 < what.bottom;
      if (didCollide) {
        soWhat();
      }
    }
  };

  useEffect(() => {
    setXState(Math.random() * (window.innerWidth - 80));
    setYState(-Math.random() * 100 - 100);
    setRotation(Math.random() * 360);
  }, []);

  return (
    <div
      ref={asteroidRef}
      className="asteroid-shadow z-10"
      style={{
        position: "absolute",
        left: xState,
        top: yState,
        animation: "moveDown 10s linear forwards",
        animationPlayState: isMoving ? "running" : "paused",
      }}
    >
      <Image
        src={"/astro.png"}
        width={80}
        height={80}
        alt={""}
        style={{
          rotate: `${rotation}deg`,
        }}
      />
    </div>
  );
};

export default Asteroid;
