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
  const [dataStats, setDataStats] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const videoRef = useRef(null);
  const samplingCanvasRef = useRef(null);
  const [breathingPattern, setBreathingPattern] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const SAMPLE_BUFFER = useRef([]);
  const skipCounter = useRef(0); // Counter to skip BPM updates
  const SKIP_INTERVAL = 5; // Number of frames to skip before updating BPM
  const timerRef = useRef(null);
  const requestRef = useRef(null);
  const [isFlashlightOn, setIsFlashlightOn] = useState(false);
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
        video: { facingMode: "environment" },
      });
      videoRef.current.srcObject = stream;
      videoRef.current.play();

      const track = stream.getVideoTracks()[0];
      if (track.getCapabilities && track.getCapabilities().torch) {
        await track.applyConstraints({ advanced: [{ torch: true }] });
        setIsFlashlightOn(true);
      }

      SAMPLE_BUFFER.current = [];
      setIsComplete(false);
      setIsLive(true);
      monitorLoop();

      timerRef.current = setTimeout(() => {
        setIsMonitoring(false);
        setIsComplete(true);
        // setIsLive(false);
        setFeedbackMessage("Completed");
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
          requestRef.current = null;
        }
      }, 15000); // 15 seconds
    } catch (error) {
      console.log("Error with camera", error);
    }
  };

  const stopMonitoring = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => {
        if (track.getConstraints().torch) {
          track.applyConstraints({ advanced: [{ torch: false }] });
        }
        track.stop();
      });
      videoRef.current.pause();
    }
    setIsFlashlightOn(false);

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
    if (!isMonitoring || isComplete) return;
    processFrame();
    requestRef.current = requestAnimationFrame(monitorLoop);
  };

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  const processFrame = async () => {
    if (!isMonitoring || isComplete) return;

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
      SAMPLE_BUFFER.current.shift();
    }

    checkFingerPlacement(brightness);

    const bpmData = processHeartRateData(SAMPLE_BUFFER.current);
    if (bpmData) {
      // Update the BPM only every `SKIP_INTERVAL` frames
      if (skipCounter.current >= SKIP_INTERVAL) {
        setBpm(Math.round(bpmData.bpm)); // Update the BPM value
        skipCounter.current = 0; // Reset the skip counter
      } else {
        skipCounter.current += 1;
      }

      if (!isComplete) {
        const responseFromBackend = await sendHeartRateDataToBackend(
          SAMPLE_BUFFER.current
        );
        if (responseFromBackend) {
          if (responseFromBackend.bpm) {
            setBpm(responseFromBackend.bpm);
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
    isFlashlightOn,
    isComplete,
    isLive,
  };
};

export default useHeartRateMonitor;
