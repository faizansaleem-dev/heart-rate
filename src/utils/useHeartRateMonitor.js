import { useState, useRef, useEffect } from "react";
import {
  percentile,
  removeOutliersIQR,
  movingAverage,
  findPeaks,
  calculateHeartRate,
  getHeartRate,
  breathingTechniques,
  classifyHeartRate,
} from "./heartRateUtils";
import { sendHeartRateDataToBackend } from "./api";

const useHeartRateMonitor = () => {
  const [bpm, setBpm] = useState(null);
  const [dataStats, setDataStats] = useState(null); // New state for data stats
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const videoRef = useRef(null);
  const samplingCanvasRef = useRef(null);
  const [breathingPattern, setBreathingPattern] = useState(null); // New state to store breathing pattern
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isComplete, setIsComplete] = useState(false); // Track if monitoring is complete
  const SAMPLE_BUFFER = useRef([]);
  const timerRef = useRef(null); // Timer reference for the 20-second timer
  const requestRef = useRef(null); // Reference for requestAnimationFrame
  const MAX_SAMPLES = 60 * 5;

  useEffect(() => {
    if (isComplete && bpm) {
      const classification = classifyHeartRate(bpm);
      setBreathingPattern(breathingTechniques[classification]);
    }
  }, [isComplete, bpm]);

  useEffect(() => {
    if (isMonitoring) {
      startMonitoring();
    } else {
      stopMonitoring();
    }
    return () => stopMonitoring();
  }, [isMonitoring]);

  const startMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = stream;
      videoRef.current.play();

      SAMPLE_BUFFER.current = []; // Reset sample buffer
      setIsComplete(false); // Reset completion status
      monitorLoop(); // Start the monitoring loop

      // Set a timer to stop monitoring after 20 seconds
      timerRef.current = setTimeout(() => {
        setIsMonitoring(false); // Stop monitoring
        setIsComplete(true); // Mark as complete
        setFeedbackMessage("Completed");
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current); // Ensure no further frames are requested
          requestRef.current = null;
        }
      }, 10000); // 20 seconds
    } catch (error) {
      console.log("Error with camera", error);
    }
  };

  const stopMonitoring = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.pause();
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    setIsMonitoring(false);
  };

  const monitorLoop = () => {
    if (!isMonitoring || isComplete) return; // Stop loop if monitoring has stopped or is complete
    processFrame();
    requestRef.current = requestAnimationFrame(monitorLoop); // Schedule the next loop if monitoring is active
  };

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  const processFrame = async () => {
    if (!isMonitoring || isComplete) return; // Ensure we exit if monitoring is stopped or complete

    const context = samplingCanvasRef.current.getContext("2d");
    context.drawImage(
      videoRef.current,
      0,
      0,
      samplingCanvasRef.current.width,
      samplingCanvasRef.current.height
    );
    const brightness = averageBrightness(context);

    const sample = { value: brightness, time: Date.now() };
    SAMPLE_BUFFER.current.push(sample);

    if (SAMPLE_BUFFER.current.length > MAX_SAMPLES) {
      SAMPLE_BUFFER.current.shift(); // Remove the oldest sample to keep the buffer size consistent
    }

    checkFingerPlacement(brightness);

    const bpmData = processHeartRateData(SAMPLE_BUFFER.current);
    if (bpmData) {
      setBpm(bpmData.bpm); // Only set once before stopping backend calls

      // Send final state to backend only if monitoring is not complete
      if (!isComplete) {
        const responseFromBackend = await sendHeartRateDataToBackend(
          SAMPLE_BUFFER.current
        );
        if (responseFromBackend) {
          if (responseFromBackend.bpm) {
            setBpm(responseFromBackend.bpm); // Set the final bpm from backend
          }
          if (responseFromBackend.dataStats) {
            setDataStats(responseFromBackend.dataStats);
          }
        }
      }
    }
  };

  const processHeartRateData = (sampleBuffer) => {
    const dataValues = sampleBuffer.map((sample) => sample.value);
    const cleanedData = removeOutliersIQR(dataValues, 1.5);
    const smoothedData = movingAverage(cleanedData, 3);
    const peaks = findPeaks(smoothedData);
    const heartRates = calculateHeartRate(peaks, 60);
    return { bpm: getHeartRate(heartRates) };
  };

  const checkFingerPlacement = (brightness) => {
    if (brightness < 0.1) {
      setFeedbackMessage("Pressing too hard, lighten your touch.");
    } else if (brightness > 0.6) {
      setFeedbackMessage("Cover the camera fully with your finger.");
    } else {
      setFeedbackMessage("Perfect! Hold steady for accurate readings.");
    }
  };

  const averageBrightness = (context) => {
    const pixelData = context.getImageData(
      0,
      0,
      samplingCanvasRef.current.width,
      samplingCanvasRef.current.height
    ).data;
    let sum = 0;
    for (let i = 0; i < pixelData.length; i += 4) {
      sum += pixelData[i] + pixelData[i + 1];
    }
    return sum / (pixelData.length * 0.5) / 255;
  };

  return {
    bpm,
    feedbackMessage,
    videoRef,
    samplingCanvasRef,
    toggleMonitoring,
    dataStats,
    SAMPLE_BUFFER,
    breathingPattern,
  };
};

export default useHeartRateMonitor;
