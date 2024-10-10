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
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }); // Use the back camera
      videoRef.current.srcObject = stream;
    };

    startVideo();
  }, []);

  const startRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      const context = canvasRef.current.getContext('2d');

      const id = setInterval(async () => {
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);

        // Convert image data to a format Tesseract can process
        const result = await Tesseract.recognize(imageData, 'eng', {
          logger: info => console.log(info), // log progress
        });

        const detectedText = result.data.text.trim();
        
        // Filter the detected text for likely number plates
        if (detectedText && isValidPlate(detectedText)) {
          setNumberPlates(prevPlates => [...new Set([...prevPlates, detectedText])]); // add new plate
        }
      }, 3000); // Change this interval based on performance needs
      
      setIntervalId(id); // Save the interval ID to stop it later
    }
  };

  const stopRecording = () => {
    if (isRecording) {
      clearInterval(intervalId);
      setIsRecording(false);
      setIntervalId(null);
    }
  };

  const isValidPlate = (text) => {
    // Add your validation logic here (e.g., regex to check for number plate patterns)
    return /^[A-Z0-9\s-]+$/.test(text); // Basic validation for alphanumeric characters, spaces, and dashes
  };

  return (
    <div className="App">
      <h1>Number Plate Detector</h1>
      <video ref={videoRef} autoPlay style={{ maxWidth: '100%' }} />
      <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }} />
      <h2>Detected Number Plates:</h2>
      <ul>
        {numberPlates.map((plate, index) => (
          <li key={index}>{plate}</li>
        ))}
      </ul>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
    </div>
  );
}

export default App;
