import React, { useState } from "react";
import BpmDisplay from "./components/bpmDisplay";
import BreathingCircle from "./components/breathingCircle";
import GraphCanvas from "./components/graph";
import Footer from "./components/footer";
import MenuButton from "./components/menuButton";
import useHeartRateMonitor from "./utils/useHeartRateMonitor";
import Grid from "@mui/material/Grid2";
import { Box } from "@mui/material";

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
  } = useHeartRateMonitor();
  const [modal, setModal] = useState(null);

  const openModal = (name) => setModal(name);
  const closeModal = () => setModal(null);

  return (
    <Box>
      <Grid sx={{ height: "100vh" }} container spacing={5} direction={"column"}>
        <Grid size={12}>
          <BpmDisplay
            bpm={bpm}
            feedbackMessage={feedbackMessage}
            onToggleMonitoring={toggleMonitoring}
          />
        </Grid>
        <Grid size={12}>
          <BreathingCircle breathingPattern={breathingPattern} />
        </Grid>
        <Grid size={12}>
          <GraphCanvas dataStats={dataStats} sampleBuffer={SAMPLE_BUFFER} />
        </Grid>
        <Grid size={12}>
          <MenuButton />
        </Grid>
      </Grid>

      <video ref={videoRef} style={{ display: "none" }} />
      <canvas ref={samplingCanvasRef} style={{ display: "none" }} />
    </Box>
  );
};

export default HeartRateMonitorApp;
