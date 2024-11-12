import React, { useEffect, useRef } from "react";
import { Box } from "@mui/material";
const GraphCanvas = ({ sampleBuffer, dataStats }) => {
  const canvasRef = useRef();
  useEffect(() => {
    if (!dataStats || sampleBuffer.current.length === 0) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Clear previous drawings
    context.clearRect(0, 0, canvas.width, canvas.height);

    const xScaling = canvas.width / sampleBuffer.current.length;
    const yScaling = canvas.height / (dataStats.max - dataStats.min);

    context.lineWidth = 2;
    context.strokeStyle = "blue";
    context.beginPath();

    sampleBuffer.current.forEach((sample, i) => {
      const x = i * xScaling;
      const y = canvas.height - (sample.value - dataStats.min) * yScaling;
      context.lineTo(x, y);
    });

    context.stroke();
  }, [dataStats, sampleBuffer]);

  return (
    <Box sx={{ height: "100px" }}>
      <canvas id="graph-canvas" ref={canvasRef}></canvas>
    </Box>
  );
};

export default GraphCanvas;
