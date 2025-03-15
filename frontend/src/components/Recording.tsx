import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const Recording: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [processingTranscription, setProcessingTranscription] = useState(false);
  const [recordingFilename, setRecordingFilename] = useState('');
  const navigate = useNavigate();
  
  // Timer for recording
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
        
        // Also check status from server
        axios.get(`${API_URL}/status`)
          .then(response => {
            if (!response.data.is_recording) {
              setIsRecording(false);
              clearInterval(interval);
            }
          })
          .catch(err => console.error('Error checking recording status:', err));
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);
  
  // Handle start recording
  const handleStartRecording = async () => {
    try {
      const response = await axios.post(`${API_URL}/start-recording`);
      if (response.data.status === 'recording_started' || response.data.status === 'already_recording') {
        setIsRecording(true);
      }
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };
  
  // Handle stop recording
  const handleStopRecording = async () => {
    try {
      setIsRecording(false);
      setProcessingTranscription(true);
      
      // Stop recording
      const stopResponse = await axios.post(`${API_URL}/stop-recording`);
      
      if (stopResponse.data.status === 'processing_started') {
        setRecordingFilename(stopResponse.data.filename);
        
        // Process the recording
        const processResponse = await axios.post(`${API_URL}/process`, {
          filename: stopResponse.data.filename
        });
        
        // Navigate to form
        setProcessingTranscription(false);
        navigate(`/document/${processResponse.data.document}`);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      setProcessingTranscription(false);
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">ახალი ჩანაწერი - ფორმა IV-100ა</h1>
        <p className="text-gray-600">მოახდინეთ თქვენი დიქტოვკის ჩაწერა, რომელიც ავტომატურად შეავსებს ფორმას</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        {processingTranscription ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-medium text-gray-700">მიმდინარეობს ტრანსკრიფცია...</p>
            <p className="text-sm text-gray-500 mt-2">გთხოვთ მოიცადოთ, სანამ დოკუმენტი მზადდება</p>
          </div>
        ) : isRecording ? (
          <div className="py-12">
            <div className="flex flex-col items-center">
              <div className="text-xl mb-8">ჩაწერილია - {formatTime(recordingTime)}</div>
              
              <div className="relative mb-8">
                <div className="w-32 h-32 bg-red-500 rounded-full flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div className="absolute -bottom-2 right-0 animate-pulse">
                  <div className="w-6 h-6 bg-red-600 rounded-full"></div>
                </div>
              </div>
              
              <div className="mb-8">
                <div className="h-16 w-64">
                  <svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <path d="M0,30 Q10,10 20,30 T40,30 T60,30 T80,10 T100,50 T120,30 T140,40 T160,20 T180,30 T200,30" fill="none" stroke="#4299e1" strokeWidth="2" />
                  </svg>
                </div>
              </div>
              
              <button 
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={handleStopRecording}
              >
                ჩაწერის შეწყვეტა
              </button>
            </div>
          </div>
        ) : (
          <div className="py-12">
            <div className="flex flex-col items-center">
              <div className="text-xl mb-4">საუბრეთ მიკროფონთან ჩაწერის დასაწყებად</div>
              <p className="text-gray-500 mb-8">გთხოვთ, დაიმკვიდროთ მიკროფონთან წვდომა ჩაწერის დასაწყებად</p>
              
              <div className="mb-8">
                <button 
                  className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition duration-200"
                  onClick={handleStartRecording}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
              </div>
              
              <div className="text-sm text-gray-500">
                <p>დააწექით ღილაკს, რათა დაიწყოთ სანოტაციო ტექსტის ჩაწერა.</p>
                <p>დარწმუნდით, რომ საუბრობთ მკაფიოდ და ნელა ოპტიმალური შედეგებისთვის.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recording;