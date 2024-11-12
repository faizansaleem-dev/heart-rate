export const calculateHeartRate = (peaks, frameRate = 60) => {
  const timeInterval = 1 / frameRate;
  const peakTimes = peaks.map((i) => i * timeInterval);

  const timeIntervals = peakTimes
    .slice(1)
    .map((time, i) => time - peakTimes[i]);
  return timeIntervals.map((interval) => 60 / interval); // BPM = 60 / time interval
};

export const updateBreathingRoutine = (classification, circleRef) => {
  let inhaleDuration, holdDuration, exhaleDuration, holdAfterExhale;

  switch (classification) {
    case "low":
      inhaleDuration = 4;
      holdDuration = 2;
      exhaleDuration = 4;
      holdAfterExhale = 2;
      circleRef.current.style.backgroundColor = "yellow";
      break;

    case "mild":
      inhaleDuration = 4;
      holdDuration = 4;
      exhaleDuration = 4;
      holdAfterExhale = 4;
      circleRef.current.style.backgroundColor = "green";
      break;

    case "high":
      inhaleDuration = 4;
      holdDuration = 7;
      exhaleDuration = 8;
      holdAfterExhale = 0;
      circleRef.current.style.backgroundColor = "blue";
      break;
  }

  const totalDuration =
    inhaleDuration + holdDuration + exhaleDuration + holdAfterExhale;
  circleRef.current.style.animationDuration = `${totalDuration}s`;
};

export const percentile = (arr, p) => {
  arr.sort((a, b) => a - b);
  const index = Math.floor((p / 100) * (arr.length - 1));
  return arr[index];
};

export const removeOutliersIQR = (data, factor = 1.5) => {
  const Q1 = percentile(data, 25);
  const Q3 = percentile(data, 75);
  const IQR = Q3 - Q1;
  const lowerBound = Q1 - factor * IQR;
  const upperBound = Q3 + factor * IQR;
  return data.map((value) =>
    value >= lowerBound && value <= upperBound ? value : Q3
  );
};

export const movingAverage = (data, windowSize) => {
  const result = [];
  for (let i = 0; i < data.length - windowSize + 1; i++) {
    result.push(
      data.slice(i, i + windowSize).reduce((acc, val) => acc + val, 0) /
        windowSize
    );
  }
  return result;
};

const findWidth = (data, peakIndex, direction, minWidth) => {
  let count = 0;
  let i = peakIndex;

  // Traverse in the specified direction to check for width
  while (
    i >= 0 &&
    i < data.length &&
    data[i] > data[peakIndex] - minWidth * 0.01 // Adjust based on prominence
  ) {
    count++;
    i += direction;
  }

  return count;
};

// Function to detect peaks (local maxima) in the data
export const findPeaks = (
  data,
  width = 2,
  distance = 5,
  prominence = 0.001
) => {
  const peaks = [];

  // Loop through the data to identify peaks
  for (let i = 1; i < data.length - 1; i++) {
    // Check if the current point is a local maximum
    if (data[i] > data[i - 1] && data[i] > data[i + 1]) {
      // Simplify prominence check
      const leftMax = Math.max(...data.slice(Math.max(0, i - distance), i));
      const rightMax = Math.max(...data.slice(i + 1, i + 1 + distance));

      const leftProminence = data[i] - leftMax;
      const rightProminence = data[i] - rightMax;

      // Debug the prominences
      console.log(
        `Index: ${i}, Value: ${data[i]}, Left Prominence: ${leftProminence}, Right Prominence: ${rightProminence}`
      );

      // Check if it satisfies the prominence threshold
      if (leftProminence >= prominence && rightProminence >= prominence) {
        // Check for width condition (optional simplification)
        const leftWidth = findWidth(data, i, -1, width);
        const rightWidth = findWidth(data, i, 1, width);

        console.log(
          `Index: ${i}, Left Width: ${leftWidth}, Right Width: ${rightWidth}`
        );

        // Only consider it a peak if it satisfies the width condition
        if (leftWidth >= width && rightWidth >= width) {
          peaks.push(i);
        }
      }
    }
  }

  return peaks;
};

export const getHeartRate = (heartRates) => {
  return heartRates.reduce((acc, bpm) => acc + bpm, 0) / heartRates.length;
};

export const classifyHeartRate = (bpm) => {
  if (bpm < 60) return "low";
  if (bpm < 100) return "mild";
  return "high";
};

export const breathingTechniques = {
  low: { inhale: 4, hold: 2, exhale: 4, holdAfterExhale: 2, color: "yellow" },
  mild: { inhale: 4, hold: 4, exhale: 4, holdAfterExhale: 4, color: "green" },
  high: { inhale: 4, hold: 7, exhale: 8, holdAfterExhale: 0, color: "blue" },
};
