import React, { useState, useRef } from 'react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onSendAudio: (audio: Blob) => void;
  isLoading: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, onSendAudio, isLoading }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };
  
  const handleMicClick = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          onSendAudio(audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Microphone access was denied:", err);
        alert("Microphone access is required for pronunciation practice. Please allow access in your browser settings.");
      }
    }
  };

  return (
    <div className="bg-slate-800 p-4 border-t border-slate-700 sticky bottom-0">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2 sm:space-x-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-slate-700 text-white placeholder-slate-400 rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
          disabled={isLoading || isRecording}
          aria-label="Chat message input"
        />
        <button
          type="button"
          onClick={handleMicClick}
          disabled={isLoading}
          className={`text-white rounded-full w-12 h-12 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200 active:scale-90 disabled:bg-slate-600 disabled:cursor-not-allowed ${
            isRecording 
              ? 'bg-red-600 hover:bg-red-500 focus:ring-red-500 animate-pulse' 
              : 'bg-purple-600 hover:bg-purple-500 focus:ring-purple-500'
          }`}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          <i className={`fa-solid ${isRecording ? 'fa-stop' : 'fa-microphone'} text-xl`}></i>
        </button>
        <button
          type="submit"
          disabled={isLoading || isRecording}
          className="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-transform duration-200 active:scale-90 disabled:bg-slate-600 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin" role="status" aria-label="Loading"></div>
          ) : (
            <i className="fa-solid fa-paper-plane text-xl"></i>
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;