import { RocketIcon } from "lucide-react";
import React from "react";

type Props = {
  degrees: number;
};

const Rocket: React.FC<Props> = ({ degrees }) => {
  return (
    <div
      className="rocket-shadow"
      style={{
        willChange: "transform",
      }}
      key={degrees}
    >
      <RocketIcon
        size={32}
        className="fill-white"
        style={{
          transform: `rotate(${-45 + degrees}deg)`,
          transition: "transform 0.1s linear",
        }}
      />
    </div>
  );
};

export default Rocket;
