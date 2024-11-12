import React from "react";
import { Box, Typography, InputLabel } from "@mui/material";

const BpmDisplay = ({ bpm, feedbackMessage, onToggleMonitoring }) => (
  <Box
    sx={{
      border: "5px solid green",
      borderRadius: "100px",
      width: "10%",
      textAlign: "center",
      justifySelf: "center",
    }}
  >
    <Box id="bpm-display" onClick={onToggleMonitoring}>
      <Typography id="bpm-value">{Math.round(bpm) || "--"}</Typography>
      <InputLabel>bpm</InputLabel>
      <Box id="feedback" className="feedback-message">
        {feedbackMessage}
      </Box>
    </Box>
  </Box>
);

export default BpmDisplay;
