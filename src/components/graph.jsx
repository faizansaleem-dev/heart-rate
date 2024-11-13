import React, { useEffect, useRef } from "react";
import { Box } from "@mui/material";

const GraphCanvas = ({ sampleBuffer, dataStats }) => {
  const canvasRef = useRef();

  useEffect(() => {
    if (!dataStats || sampleBuffer.current.length === 0) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Set canvas dimensions explicitly to ensure correct rendering
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear previous drawings
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Scaling for X-axis and Y-axis
    const xScaling = canvas.width / sampleBuffer.current.length;
    const yScaling = (canvas.height / (dataStats.max - dataStats.min)) * 2;

    // Center calculation for Y-axis based on the mid-point of the data range
    const centerY = canvas.height;

    context.lineWidth = 2;
    context.strokeStyle = "black";
    context.beginPath();

    // Offset the Y-value to center the graph
    sampleBuffer.current.forEach((sample, i) => {
      const x = i * xScaling;
      // Offset the Y value by subtracting the center of the graph to align it centrally
      const y = centerY - (sample.value - dataStats.min) * yScaling; // Use dataStats.min for consistency
      if (i === 0) {
        context.moveTo(x, y); // Start the path
      } else {
        context.lineTo(x, y);
      }
    });

    context.stroke();
  }, [dataStats, sampleBuffer]);

  return (
    <canvas
      id="graph-canvas"
      className="w-full mt-auto heartbeat_background"
      ref={canvasRef}
      style={{ height: "200" }} // Set a fixed height or adjust as needed
    ></canvas>
  );
};

export default GraphCanvas;
