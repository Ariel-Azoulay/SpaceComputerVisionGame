"use client";

import React, { useEffect, useRef, useState } from "react";
import MarkerDetectorLogic from "../helpers/MarkerDetector";

type Props = {
  setMarkerResult: (result: any) => void;
};

const MarkerDetectorComponent: React.FC<Props> = ({ setMarkerResult }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [expectedSize] = useState(45); // Set a fixed expected size

  useEffect(() => {
    if (videoRef.current && canvasRef.current) {
      initVideoAndModel(videoRef.current, canvasRef.current);
    }
  }, []);

  const initVideoAndModel = async (
    videoElement: HTMLVideoElement,
    canvasElement: HTMLCanvasElement
  ) => {
    setMarkerResult({ isLoading: true });

    const markerDetector = new MarkerDetectorLogic();

    await initVideo(videoElement);

    const ctx = canvasElement.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const onVideoLoadedData = () => {
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;

      const loop = () => {
        if (videoElement.readyState >= 2) {
          ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
          ctx.save();
          ctx.scale(-1, 1);
          ctx.drawImage(
            videoElement,
            -canvasElement.width,
            0,
            canvasElement.width,
            canvasElement.height
          );
          ctx.restore();

          const imgData = ctx.getImageData(
            0,
            0,
            canvasElement.width,
            canvasElement.height
          );

          const result = markerDetector.detect(imgData);

          if (result && result.leftMarker && result.rightMarker) {
            ctx.fillStyle = "red";
            result.leftMarker.points.forEach((point: any) => {
              ctx.fillRect(point.x, point.y, 4, 4);
            });

            ctx.fillStyle = "yellow";
            result.rightMarker.points.forEach((point: any) => {
              ctx.fillRect(point.x, point.y, 4, 4);
            });

            const isDetected =
              result.leftMarker.radius > 0 && result.rightMarker.radius > 0;

            const tilt =
              (result.rightMarker.centroid.y - result.leftMarker.centroid.y) /
              (result.rightMarker.centroid.x - result.leftMarker.centroid.x);
            const degrees = (Math.atan(tilt) * 180) / Math.PI;

            const size = result.leftMarker.radius + result.rightMarker.radius;

            const tolerance = 5; // Adjust this as needed
            const forwardThreshold = expectedSize + tolerance; // Adjust threshold as needed

            let forward = false;
            let reverse = false;

            if (size < expectedSize - tolerance) {
              reverse = true;
            } else if (size > forwardThreshold) {
              forward = true;
            }

            setMarkerResult({ tilt, degrees, forward, reverse, isDetected });
          } else {
            // Reset values if markers are not detected
            setMarkerResult({
              tilt: 0,
              degrees: 0,
              forward: false,
              reverse: false,
              isDetected: false,
            });
          }
        }

        requestAnimationFrame(loop);
        setMarkerResult({ isLoading: false });
      };

      loop();
    };

    videoElement.addEventListener("loadeddata", onVideoLoadedData);
  };

  const initVideo = async (videoElement: HTMLVideoElement) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoElement.srcObject = stream;
      videoElement.addEventListener("loadeddata", () => {
        videoElement.play();
      });
    } catch (error) {}
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <video
        ref={videoRef}
        className="video-flip-horizontal"
        style={{ display: "none" }}
      ></video>
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      ></canvas>
    </div>
  );
};

export default MarkerDetectorComponent;
