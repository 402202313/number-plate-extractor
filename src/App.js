import React, { useEffect, useRef, useState } from 'react';
import Tesseract from 'tesseract.js';
import './App.css';

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [numberPlates, setNumberPlates] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    const startVideo = async () => {
      try {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setStream(userMediaStream);
        videoRef.current.srcObject = userMediaStream;
      } catch (err) {
        console.error('Error accessing camera: ', err);
      }
    };

    startVideo();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop()); // Stop all video tracks on cleanup
      }
    };
  }, [stream]);

  const detectPlates = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');

      setInterval(async () => {
        if (isRecording) {
          context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
          const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);

          // Use Tesseract to recognize the text in the video frame
          const result = await Tesseract.recognize(imageData.data, 'eng', {
            logger: info => console.log(info), // log progress
          });

          const detectedText = result.data.text.trim();
          if (detectedText) {
            setNumberPlates(prevPlates => [...new Set([...prevPlates, detectedText])]); // add new plate
          }
        }
      }, 3000); // Change this interval based on performance needs
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    detectPlates();
  };

  const handleStopRecording = () => {
    setIsRecording(false);
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
      <button onClick={handleStartRecording}>Start Recording</button>
      <button onClick={handleStopRecording}>Stop Recording</button>
    </div>
  );
}

export default App;
