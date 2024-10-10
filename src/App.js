import React, { useEffect, useRef, useState } from 'react';
import Tesseract from 'tesseract.js';
import './App.css';

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [numberPlates, setNumberPlates] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    const startVideo = async () => {
      const constraints = {
        video: { facingMode: { exact: "environment" } }, // Prefer back camera
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoRef.current.srcObject = stream;

      videoRef.current.onloadedmetadata = () => {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
      };
    };

    startVideo();

    return () => {
      // Cleanup on component unmount
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  const startRecording = () => {
    setIsRecording(true);
    const context = canvasRef.current.getContext('2d');
    const id = setInterval(async () => {
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const imageData = canvasRef.current.toDataURL('image/png');

      try {
        const result = await Tesseract.recognize(imageData, 'eng', {
          logger: info => console.log(info), // log progress
        });

        const detectedText = result.data.text.trim();
        if (detectedText) {
          setNumberPlates(prevPlates => [...new Set([...prevPlates, detectedText])]); // add new plate
        }
      } catch (error) {
        console.error("Error during Tesseract processing: ", error);
      }
    }, 3000); // Change this interval based on performance needs

    setIntervalId(id);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  return (
    <div className="App">
      <h1>Number Plate Detector</h1>
      <video ref={videoRef} autoPlay style={{ width: '100%', height: 'auto' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div>
        {isRecording ? (
          <button onClick={stopRecording}>Stop Recording</button>
        ) : (
          <button onClick={startRecording}>Start Recording</button>
        )}
      </div>
      <h2>Detected Number Plates:</h2>
      <ul>
        {numberPlates.map((plate, index) => (
          <li key={index}>{plate}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
