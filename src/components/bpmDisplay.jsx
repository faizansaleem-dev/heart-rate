import { useState } from "react";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { HeartIcon } from "../assets/icons/HeartIcon";

const measuringDuration = 15000;

const BpmDisplay = ({
  bpm,
  feedbackMessage,
  onToggleMonitoring,
  isComplete,
}) => {
  const [state, setState] = useState("initial");
  const [progress, setProgress] = useState(0);

  const startMeasuring = () => {
    setState("measuring");
    onToggleMonitoring();
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = Math.min(
          prevProgress + 100 / (measuringDuration / 100),
          100
        );

        if (newProgress === 100) {
          clearInterval(interval);
          setTimeout(() => setState("result"), 500);
        }

        return newProgress;
      });
    }, 100);
  };

  const reset = () => {
    setState("initial");
    setProgress(0);
  };

  return (
    <>
      {isComplete && <></>}
      {state === "initial" && !isComplete && (
        <div className="text-center py-6">
          <p className="mb-6">Measure your heart rate</p>
          <button
            onClick={startMeasuring}
            className="px-6 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Measure
          </button>
        </div>
      )}

      {state === "measuring" && !isComplete && (
        <div className="text-center py-6">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <CircularProgressbarWithChildren
              value={progress}
              strokeWidth={5}
              styles={buildStyles({
                pathColor: `rgba(234, 67, 53, ${progress / 100})`,
                trailColor: "#d6d6d6",
              })}
            >
              <div className="text-red-500 flex flex-col justify-center items-center">
                <HeartIcon className="w-8 h-8 animate-pulse" />
                <div className="text-gray-600">
                  <span className=" text-red-500 text-4xl font-bold ">
                    {Math.round(bpm) || " "}
                    <span className="block text-gray-600 text-lg">bpm</span>
                  </span>
                </div>
              </div>
            </CircularProgressbarWithChildren>
          </div>
          <div className="flex flex-col text-gray-600">
            <span className="text-sm font-semibold">{feedbackMessage}</span>
            <span className="text-sm font-semibold">
              Measurement in progress...
            </span>
          </div>
        </div>
      )}

      {state === "result" && !isComplete && (
        <div className="text-center py-6">
          <p className="mb-4">Your heart rate is</p>
          <div className="mb-4">
            <span className="text-6xl text-gray-900 font-bold">
              {Math.round(bpm)}
            </span>
            <span className="text-3xl text-gray-400 ml-2">bpm</span>
          </div>
          <p className="text-green-500 mb-6">{feedbackMessage}</p>
          <button
            onClick={reset}
            className="px-6 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Measure again
          </button>
        </div>
      )}
    </>
  );
};

export default BpmDisplay;
