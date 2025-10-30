import React, { useState, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';
import { ChatMessage, MessageSender } from './types';
import { initializeChat } from './services/geminiService';
import Header from './components/Header';
import ChatBubble from './components/ChatBubble';
import MessageInput from './components/MessageInput';

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      // result is "data:audio/webm;base64,...."
      // we only need the part after the comma
      const base64data = (reader.result as string).split(',')[1];
      resolve(base64data);
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
};


const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const init = async () => {
      setError(null);
      setIsLoading(true);
      const chatSession = initializeChat();
      if (chatSession) {
        chatRef.current = chatSession;
        // Sending an initial message to trigger the greeting from the AI.
        try {
          const response = await chatSession.sendMessage({ message: "" });
          setMessages([
            {
              id: crypto.randomUUID(),
              sender: MessageSender.AI,
              text: response.text,
            },
          ]);
        } catch (e) {
          console.error(e);
          setError("Failed to start a conversation with the AI tutor. Please check your API key and refresh the page.");
        }
      } else {
        setError("Failed to initialize the AI tutor. Please check your API key configuration.");
      }
      setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!chatRef.current) {
      setError("Chat session is not available. Please refresh.");
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: MessageSender.USER,
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatRef.current.sendMessage({ message: text });
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: MessageSender.AI,
        text: response.text,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (e) {
      console.error(e);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: MessageSender.AI,
        text: "I'm sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
      setError("An error occurred while communicating with the AI. Please check the console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendAudio = async (audioBlob: Blob) => {
    if (!chatRef.current) {
      setError("Chat session is not available. Please refresh.");
      return;
    }

    const userAudioMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: MessageSender.USER,
      text: "🎤 Pronunciation practice",
    };
    setMessages((prev) => [...prev, userAudioMessage]);
  
    setIsLoading(true);
    setError(null);
  
    try {
      const base64Audio = await blobToBase64(audioBlob);
  
      const audioPart = {
        inlineData: {
          mimeType: audioBlob.type,
          data: base64Audio,
        },
      };
  
      const textPart = {
        text: "I've sent an audio message. Please act as a pronunciation coach and provide feedback according to your instructions.",
      };
      
      const response = await chatRef.current.sendMessage({ message: [textPart, audioPart] });
  
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: MessageSender.AI,
        text: response.text,
      };
      setMessages((prev) => [...prev, aiMessage]);
  
    } catch (e) {
      console.error(e);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: MessageSender.AI,
        text: "I'm sorry, I couldn't process the audio. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
      setError("An error occurred while processing the audio. Please check the console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 font-sans">
      <Header />
      <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        {isLoading && messages.length > 0 && (
           <div className="flex items-end mb-4 justify-start">
            <div className="max-w-xs px-4 py-3 rounded-2xl bg-slate-700 text-slate-200 rounded-bl-none flex items-center space-x-2">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-0"></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-300"></span>
            </div>
           </div>
        )}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-500/20 text-red-300 p-3 rounded-lg text-center">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}
      </main>
      <MessageInput 
        onSendMessage={handleSendMessage} 
        onSendAudio={handleSendAudio} 
        isLoading={isLoading} 
      />
    </div>
  );
};

export default App;