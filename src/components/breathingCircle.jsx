import React, { useEffect, useRef } from "react";
import { Box } from "@mui/material";

const BreathingCircle = ({ breathingPattern }) => {
  const circleRef = useRef(null);

  useEffect(() => {
    if (!breathingPattern) return;

    const { inhale, hold, exhale, holdAfterExhale, color } = breathingPattern;
    const totalDuration = inhale + hold + exhale + holdAfterExhale;

    const keyframes = [
      { transform: "scale(1)", backgroundColor: color, offset: 0 },
      {
        transform: "scale(1.5)",
        backgroundColor: color,
        offset: inhale / totalDuration,
      }, // Inhale
      {
        transform: "scale(1.5)",
        backgroundColor: color,
        offset: (inhale + hold) / totalDuration,
      }, // Hold
      {
        transform: "scale(1)",
        backgroundColor: color,
        offset: (inhale + hold + exhale) / totalDuration,
      }, // Exhale
      { transform: "scale(1)", backgroundColor: color, offset: 1 }, // Complete
    ];

    const animation = circleRef.current.animate(keyframes, {
      duration: totalDuration * 1000,
      iterations: Infinity, // Loop the animation
    });

    return () => animation.cancel(); // Cleanup animation on unmount
  }, [breathingPattern]);

  return (
    <Box
      sx={{ textAlign: "center", justifySelf: "center", mt: 10 }}
      ref={circleRef}
      id="breathing-circle"
    ></Box>
  );
};

export default BreathingCircle;
