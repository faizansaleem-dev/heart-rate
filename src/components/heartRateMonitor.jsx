import React, { useEffect, useRef, useState } from "react";
import "./heartRateMonitor.css";
const HeartRateMonitor = ({ isMonitoring, setBpm }) => {
  const videoRef = useRef(null);
  const samplingCanvasRef = useRef(null);
  const graphCanvasRef = useRef(null);
  const [sampleBuffer, setSampleBuffer] = useState([]);

  useEffect(() => {
    if (isMonitoring) {
      startMonitoring();
    } else {
      stopMonitoring();
    }
    return () => stopMonitoring();
  }, [isMonitoring]);

  // Function to start video monitoring
  const startMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;

      setTimeout(() => {
        requestAnimationFrame(processFrame);
      }, 1500); // Start delay for camera stabilization
    } catch (error) {
      console.error("Error starting video stream:", error);
    }
  };

  // Function to stop video monitoring
  const stopMonitoring = () => {
    const stream = videoRef.current.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Function to process each frame and extract heart rate data
  const processFrame = () => {
    const samplingCanvas = samplingCanvasRef.current;
    const samplingContext = samplingCanvas.getContext("2d");
    const video = videoRef.current;
    const width = 30;
    const height = 30;

    // Draw the current video frame onto the sampling canvas
    samplingContext.drawImage(video, 0, 0, width, height);

    // Get average brightness
    const brightness = getAverageBrightness(samplingContext, width, height);
    const currentTime = Date.now();

    setSampleBuffer((prevBuffer) => {
      const newBuffer = [
        ...prevBuffer,
        { value: brightness, time: currentTime },
      ];
      if (newBuffer.length > 300) newBuffer.shift();
      processHeartRateData(newBuffer);
      return newBuffer;
    });

    // Continue the loop
    if (isMonitoring) {
      requestAnimationFrame(processFrame);
    }
  };

  // Function to calculate the average brightness of the frame
  const getAverageBrightness = (context, width, height) => {
    const imageData = context.getImageData(0, 0, width, height).data;
    let brightnessSum = 0;

    // Calculate brightness from red and green channels for accuracy
    for (let i = 0; i < imageData.length; i += 4) {
      brightnessSum += imageData[i] + imageData[i + 1];
    }
    return brightnessSum / (imageData.length * 0.5) / 255;
  };

  // Process heart rate data from sample buffer
  const processHeartRateData = (buffer) => {
    const data = buffer.map((sample) => sample.value);
    const peaks = findPeaks(data);
    const heartRates = calculateHeartRate(peaks);
    const averageBpm =
      heartRates.reduce((a, b) => a + b, 0) / heartRates.length;

    setBpm(Math.round(averageBpm));
  };

  // Helper function to find peaks in the brightness data
  const findPeaks = (data) => {
    const peaks = [];
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1] && data[i] > data[i + 1]) {
        peaks.push(i);
      }
    }
    return peaks;
  };

  // Helper function to calculate BPM from peaks
  const calculateHeartRate = (peaks, frameRate = 60) => {
    const intervals = peaks.slice(1).map((_, i) => peaks[i + 1] - peaks[i]);
    return intervals.map((interval) => (60 * frameRate) / interval);
  };

  return (
    <div className="monitor-container">
      <video ref={videoRef} id="camera-feed" autoPlay muted></video>
      <canvas ref={samplingCanvasRef} width="30" height="30"></canvas>
      <canvas ref={graphCanvasRef} id="graph-canvas"></canvas>
    </div>
  );
};

export default HeartRateMonitor;
