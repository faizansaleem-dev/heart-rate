import { useState } from "react";
import BpmDisplay from "./components/bpmDisplay";
import BreathingCircle from "./components/breathingCircle";
import GraphCanvas from "./components/graph";
import GraphD3 from "./components/graphd3";
import useHeartRateMonitor from "./utils/useHeartRateMonitor";
import { HeartIcon } from "./assets/icons/HeartIcon";
import { HeartBeatIcon } from "./assets/icons/HeartBeatIcon";
import Modal from "./components/Modal";

const HeartRateMonitorApp = () => {
  const {
    bpm,
    feedbackMessage,
    videoRef,
    samplingCanvasRef,
    toggleMonitoring,
    dataStats,
    SAMPLE_BUFFER,
    breathingPattern,
    isComplete,
    isLive,
  } = useHeartRateMonitor();

  const [modal, setModal] = useState(false);

  const openModal = () => setModal(true);
  const closeModal = () => setModal(false);

  return (
    <section className="flex flex-col gap-5 py-5">
      <div className="w-full max-w-md mx-auto px-5 sm:px-10 lg:px-4 ">
        <div className="bg-white rounded-lg shadow-xl p-6 min-h-[380px]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-red-500">
                <HeartIcon />
              </div>
              <span className="text-lg font-semibold">Heart rate monitor</span>
            </div>
            {isLive && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span>Live</span>
              </div>
            )}
          </div>

          <BpmDisplay
            bpm={bpm}
            feedbackMessage={feedbackMessage}
            onToggleMonitoring={toggleMonitoring}
            dataStats={dataStats}
            SAMPLE_BUFFER={SAMPLE_BUFFER}
            isComplete={isComplete}
          />

          {isComplete && (
            <BreathingCircle breathingPattern={breathingPattern} />
          )}
        </div>

        <canvas ref={samplingCanvasRef} style={{ display: "none" }} />
        <video ref={videoRef} style={{ display: "none" }} />
      </div>

      <div className="w-full max-w-md mx-auto px-5 sm:px-10 lg:px-4">
        <div className="relative bg-white rounded-lg shadow-xl p-6 min-h-[260px]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-red-500">
                <HeartBeatIcon />
              </div>
              <span className="text-lg font-semibold">Heart Beat</span>
            </div>
          </div>
          <GraphD3 dataStats={dataStats} sampleBuffer={SAMPLE_BUFFER} />
        </div>
      </div>

      <div className="w-full max-w-md mx-auto px-5 sm:px-10 lg:px-4 ">
        <div className="bg-white flex justify-center gap-5 rounded-lg shadow-xl p-4">
          <button onClick={openModal} className="hover:text-black">
            Instructions
          </button>
          {/* <button onClick={openModal} className="hover:text-black">
            About
          </button> */}
        </div>
      </div>

      <Modal isOpen={modal} closeModal={closeModal} />
    </section>
  );
};

export default HeartRateMonitorApp;
