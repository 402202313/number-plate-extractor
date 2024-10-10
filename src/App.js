import { saveAs } from "file-saver";
import React, { useRef, useState } from "react";
import Tesseract from "tesseract.js";
import './App.css';

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [detectedPlates, setDetectedPlates] = useState([]);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      videoRef.current.srcObject = stream;
    });
  };

  const captureFrame = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL("image/png");

    Tesseract.recognize(image, 'eng', { logger: (m) => console.log(m) })
      .then(({ data: { text } }) => {
        const detectedPlate = text.trim();
        if (detectedPlate) {
          setDetectedPlates((prev) => [...prev, detectedPlate]);
        }
      });
  };

  // Save detected plates locally
  const savePlates = () => {
    const blob = new Blob([JSON.stringify(detectedPlates, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, "detected_plates.json");
  };

  return (
    <div className="App">
      <h1>South African Number Plate Extractor</h1>
      <video ref={videoRef} width="640" height="480" autoPlay></video>
      <canvas ref={canvasRef} width="640" height="480" style={{ display: "none" }}></canvas>
      <button onClick={startVideo}>Start Video</button>
      <button onClick={captureFrame}>Capture Frame</button>
      <button onClick={savePlates}>Save Detected Plates</button>

      <h2>Detected Plates</h2>
      <ul>
        {detectedPlates.map((plate, index) => (
          <li key={index}>{plate}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
