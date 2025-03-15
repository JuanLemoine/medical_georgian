import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://127.0.0.1:5001/api';
const MAX_RECORDING_TIME = 180; // 3 minutes in seconds

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [processingTranscription, setProcessingTranscription] = useState(false);
  const [formData, setFormData] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [showDocument, setShowDocument] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  
  // Timer for recording
  useEffect(() => {
    let interval;
    
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= MAX_RECORDING_TIME - 1) {
            // Auto stop recording when reaching the time limit
            handleStopRecording();
            return MAX_RECORDING_TIME;
          }
          return prev + 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Test backend connection
  const testBackendConnection = async () => {
    try {
      setStatus('Testing connection to backend...');
      const response = await axios.get(`${API_URL}/test`);
      setStatus(`Connection successful: ${response.data.status}`);
      setError('');
    } catch (error) {
      setStatus('Connection failed!');
      setError(`Cannot connect to backend: ${error.message}`);
      console.error('Backend connection error:', error);
    }
  };
  
  // Handle start recording
  const handleStartRecording = async () => {
    try {
      setStatus('Starting recording...');
      setError('');
      setRecordingTime(0);
      
      const response = await axios.post(`${API_URL}/start-recording`);
      console.log('Start recording response:', response.data);
      
      if (response.data.status === 'recording_started' || response.data.status === 'already_recording') {
        setIsRecording(true);
        setShowDocument(false);
        setStatus('Recording in progress...');
      }
    } catch (error) {
      setError(`Error starting recording: ${error.message}`);
      console.error('Error details:', error);
    }
  };
  
  // Handle stop recording
  const handleStopRecording = async () => {
    if (!isRecording) return;
    
    try {
      setIsRecording(false);
      setStatus('Processing recording...');
      setProcessingTranscription(true);
      
      // Stop recording
      const stopResponse = await axios.post(`${API_URL}/stop-recording`);
      console.log('Stop response:', stopResponse.data);
      
      if (stopResponse.data.status === 'processing_started') {
        setStatus('Transcribing audio and generating document...');
        
        // Process the recording
        const processResponse = await axios.post(`${API_URL}/process`, {
          filename: stopResponse.data.filename
        });
        console.log('Process response:', processResponse.data);
        
        // Get form data and transcription
        try {
          const formResponse = await axios.get(`${API_URL}/get-form`);
          setFormData(formResponse.data);
          
          const transcriptionResponse = await axios.get(`${API_URL}/get-transcription`);
          setTranscription(transcriptionResponse.data.transcription || '');
          
          setProcessingTranscription(false);
          setShowDocument(true);
          setStatus('Document generated successfully!');
        } catch (getError) {
          console.error('Error getting document:', getError);
          setError(`Error retrieving document: ${getError.message}`);
          setProcessingTranscription(false);
        }
      }
    } catch (error) {
      console.error('Error processing recording:', error);
      setError(`Error processing recording: ${error.message}`);
      setProcessingTranscription(false);
      setIsRecording(false);
    }
  };
  
  // Time left indicator (for 3-minute limit)
  const timeLeft = MAX_RECORDING_TIME - recordingTime;
  
  return (
    <div className="app-container">
      <h1 className="app-title">სამედიცინო ტრანსკრიფციის სისტემა</h1>
      
      {!showDocument ? (
        <div className="recording-container">
          {status && <p className="status-message">{status}</p>}
          {error && <p className="error-message">{error}</p>}
          
          {processingTranscription ? (
            <div className="processing-container">
              <div className="loading-spinner"></div>
              <p className="processing-text">მიმდინარეობს ტრანსკრიფცია...</p>
              <p className="wait-text">გთხოვთ მოიცადოთ, სანამ დოკუმენტი მზადდება</p>
            </div>
          ) : isRecording ? (
            <div className="recording-active">
              <div className="timer-container">
                <div className="time-recorded">{formatTime(recordingTime)}</div>
                <div className="time-left">{timeLeft <= 30 && timeLeft > 0 && 
                  <span className="time-warning">დარჩენილია {timeLeft} წამი</span>
                }</div>
              </div>
              
              <div className="recording-button recording">
                <div className="recording-icon"></div>
              </div>
              
              <button className="stop-button" onClick={handleStopRecording}>
                ჩაწერის შეწყვეტა
              </button>
              
              <div className="limit-notice">
                <p>მაქსიმალური ჩაწერის დრო: 3 წუთი</p>
              </div>
            </div>
          ) : (
            <div className="recording-inactive">
              <p className="instruction-text">საუბრეთ მიკროფონთან ჩაწერის დასაწყებად</p>
              
              <div className="button-container">
                <button 
                  className="test-button" 
                  onClick={testBackendConnection}
                >
                  Test Backend Connection
                </button>
                
                <button 
                  className="start-button" 
                  onClick={handleStartRecording}
                >
                  დაიწყეთ ჩაწერა
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="document-container">
          <div className="document-header">
            <h2 className="document-title">ფორმა № IV-100/ა</h2>
            <button 
              className="new-recording-button" 
              onClick={() => setShowDocument(false)}
            >
              ახალი ჩანაწერი
            </button>
          </div>
          
          <div className="document-tabs">
            <button 
              className={`tab-button ${formData ? 'active' : ''}`} 
              onClick={() => formData && setShowTranscription(false)}
            >
              შევსებული ფორმა
            </button>
            <button 
              className={`tab-button ${!formData ? 'active' : ''}`} 
              onClick={() => setShowTranscription(true)}
            >
              ორიგინალი ტრანსკრიფცია
            </button>
          </div>
          
          <div className="document-content">
            {formData ? (
              <div className="form-sections">
                {formData.sections && formData.sections.map((section, index) => (
                  <div key={index} className="form-section">
                    <h3 className="section-title">{section.title}</h3>
                    
                    {section.subsections ? (
                      <div className="subsections">
                        {section.subsections.map((subsection, subIndex) => (
                          <div key={subIndex} className="subsection">
                            <h4 className="subsection-title">{subsection.title}</h4>
                            <div className="subsection-content">{subsection.content || "-"}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="section-content">{section.content || "-"}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="transcription-content">
                <h3>ორიგინალი ტრანსკრიფცია</h3>
                <div className="transcription-text">
                  {transcription || "ტრანსკრიფცია არ არის ხელმისაწვდომი"}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;