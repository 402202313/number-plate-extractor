import React, { useEffect, useRef, useState } from 'react';
import Tesseract from 'tesseract.js';
import './App.css';

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [numberPlates, setNumberPlates] = useState([]);

  useEffect(() => {
    const startVideo = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;

      videoRef.current.onloadedmetadata = () => {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
      };
    };

    startVideo();

    const detectPlates = async () => {
      if (videoRef.current && canvasRef.current) {
        const context = canvasRef.current.getContext('2d');

        setInterval(async () => {
          try {
            context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
            const imageData = canvasRef.current.toDataURL('image/png');

            // Use Tesseract to recognize the text in the video frame
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
      }
    };

    detectPlates();
  }, []);

  return (
    <div className="App">
      <h1>Number Plate Detector</h1>
      <video ref={videoRef} autoPlay style={{ display: 'none' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
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
