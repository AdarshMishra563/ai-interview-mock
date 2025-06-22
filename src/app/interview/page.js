"use client"

import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Editor } from '@monaco-editor/react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logout } from '../store/userSlice';
const ChatComponent = () => {
  const {token,user}=useSelector(state=>state.user.user || {});
  const socket = useRef(null);
  const [aiMessage, setAiMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [start, setStart] = useState(false);
  const [code, setCode] = useState('// Write your code here...');
  const [language,setLanguage]=useState("javascript")
  const recognitionRef = useRef(null);
  const hasInterviewStarted = useRef(false);
  const isSpeaking = useRef(false);

  const [topic, setTopic] = useState('');
const [interviewType, setInterviewType] = useState('with code');
const [level, setLevel] = useState('Medium');
const [loading,setLoading]=useState(true);
  const recognitionTranscript = useRef('');
const lastSentMessage = useRef('');
const router=useRouter();

const dispatch=useDispatch();
  useEffect(() => {
     window.speechSynthesis.cancel();
      if (!token) {
      router.push('/login');
      return;
    }
    if (token) {
      
      const newSocket = io('https://ai-interview-nodebackend.onrender.com', {
        auth: { token },
      });

      newSocket.on('connect', () => {
        console.log(' Connected:', newSocket.id);
        socket.current = newSocket;
        setLoading(false)
      });

      newSocket.on('ai_reply', (data) => {
       
        
        const cleanedResponse = data.response.replace(/\([^)]*\)/g, '').trim();
        console.log(cleanedResponse)
        setAiMessage(cleanedResponse);
        window.speechSynthesis.cancel(); 
        setTimeout(()=>{speakText(cleanedResponse)},500)
      });

      newSocket.on('disconnect', () => {
        console.log('🔌 Disconnected');
      });

      return () => {
  newSocket.disconnect();
  window.speechSynthesis.cancel();  
};
    }
  }, [token]);

 const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported.');
      return;
    }
 if (recognitionRef.current) {
    recognitionRef.current.stop();
    recognitionRef.current = null;
  }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = true;

    recognition.onstart = () => {
      console.log(' Voice recognition started');
      setIsListening(true);
      recognitionTranscript.current = '';
    };

  recognition.onresult = (event) => {
  const transcript = event.results[event.results.length - 1][0].transcript;
  console.log('You said:', transcript);
  if (transcript.trim()) {
    sendMessage(transcript.trim());
  }
};
  recognition.onerror = (event) => {
    console.error('Recognition error:', event.error);
    
  };
    
    recognition.onend = () => {
      console.log(' Voice recognition ended');
      setTimeout(()=>{startListening()},1000)
   
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsListening(false);
    }
  };

  const sendMessage = (text) => {
   
    console.log(text,"sent messageee");

    if (socket.current && text.trim()) {
      socket.current.emit('send_message', { message: text.trim(), token });
    }
  };

  const speakText = (text) => {
   
      

       if (text.trim() && !isSpeaking.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      isSpeaking.current = true;
      
      utterance.onend = () => {
        isSpeaking.current = false;
     
      };
      
      utterance.onerror = () => {
        isSpeaking.current = false;
      
      };
      
      window.speechSynthesis.speak(utterance);
    }}

useEffect(() => {
  const handleUnload = () => {
    window.speechSynthesis.cancel();
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (socket.current) {
      socket.current.disconnect();
    }
    hasInterviewStarted.current = false;
    setStart(false);
    window.location.reload();
  };

  window.addEventListener("beforeunload", handleUnload);

  return () => {
    window.removeEventListener("beforeunload", handleUnload);
  };
}, []);
useEffect(() => {

 
  const handleVisibilityChange = () => {
    if (document.hidden) {
      
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (socket.current) {
        socket.current.disconnect();
      }
      hasInterviewStarted.current = false;
      setStart(false);
      
      window.location.reload();

    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}, [token]);
useEffect(() => {
  return () => {
   
    window.speechSynthesis.cancel();
   
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
   
    if (socket.current) {
      socket.current.disconnect();
    }
  };
}, []);

  const startInterview = () => {
       if (!topic.trim() || !interviewType || !level) {
      alert('Please fill all the fields before starting.');
      return;
    }

       const fullTopic = `${topic} ${interviewType === 'withCode' ? 'with coding rounds' : 'without coding'}`;
    if (socket.current && !hasInterviewStarted.current) {
      socket.current.emit('start_interview', {
        topic: fullTopic,
        level,
        name: user.name,
        token,
      });
      hasInterviewStarted.current = true;
      setStart(true);
      startListening()
    }
  };

  const sendCode = () => {
    console.log(code)
    if (code.trim()) {
      sendMessage(code);
    }
  };
if(loading){
  return <Loading/>
}
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {!start ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          {!token ? (
            <div className="text-center">
              <h2 className="text-2xl mb-5">Unauthorized — Redirecting to login...</h2>
            </div>
          ) : (
            <div className="w-full max-w-md bg-gray-800/80 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-gray-700">
              <h2 className="text-3xl font-bold text-center mb-6 text-blue-400">
                Welcome, {user?.name} 
              </h2> <div style={{
  width: "100%",
  display: "flex",
  justifyContent: "flex-end",
 
}}>
  <button
    style={{
      color: "red",
      fontSize: 18,
      textDecoration: "underline"
    }}
    onClick={() => dispatch(logout())}
  >
    Logout
  </button>
</div>


              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Interview Topic
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. React Native, Data Structures"
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Interview Type
                  </label>
                  <select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition text-white"
                  >
                    <option value="">Select Interview Type</option>
                    <option value="withCode">With Coding Rounds</option>
                    <option value="withoutCode">Without Coding</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Difficulty Level
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition text-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <button
                  onClick={startInterview}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-lg font-bold text-lg shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                >
                  Start Interview
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div  className="flex flex-col lg:flex-row h-screen bg-gradient-to-br from-gray-900 to-gray-800">
         
          <div className="flex-1 flex flex-col p-6 bg-gray-800/70 backdrop-blur-sm border-r border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">AI Response</h2>
            <div style={{maxHeight:"65vh"}} className="flex-1 bg-gray-900/80 rounded-xl p-6 overflow-y-auto mb-6 border border-gray-700">
              <div  className="whitespace-pre-wrap break-words text-gray-200">
                {aiMessage || (
                  <div className="text-gray-500 italic">
                    Waiting for AI response. Speak to start the conversation...
                  </div>
                )}
              </div>
            </div>

            <div  style={{marginTop:10}} className="flex justify-center">
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isSpeaking.current}
               
                className={`relative w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg transition-all duration-300 ${
                  isListening
                    ? 'bg-gradient-to-br from-green-500 to-green-600 animate-pulse'
                    : 'bg-gray-700 hover:bg-gray-600'
                } ${isSpeaking.current ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                🎙️
                {isListening && (
                  <>
                    <span className="absolute inset-0 rounded-full bg-green-500/30 animate-ping-slow"></span>
                    <span className="absolute inset-0 rounded-full bg-green-500/20 animate-ping-slower delay-300"></span>
                  </>
                )}
              </button>
            </div>
          </div>

        
          <div className="flex-1 flex flex-col p-6 bg-gray-900/70 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-blue-400">Code Editor</h2>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="cpp">C++</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="html">HTML</option>
              </select>
            </div>

            <div className="flex-1 mb-4 rounded-xl overflow-hidden border border-gray-700">
              <Editor
                height="100%"
                theme="vs-dark"
                language={language}
                value={code}
                onChange={setCode}
                options={{
                  minimap: { enabled: false },
                  fontSize: 16,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>

            <button
              onClick={sendCode}
              className="self-start px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg font-medium shadow-lg transition-all hover:scale-[1.02]"
            >
              Send Code
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes pulse-slow {
          0% { transform: scale(0.8); opacity: 0.7; }
          70% { transform: scale(1.4); opacity: 0.2; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes pulse-slower {
          0% { transform: scale(0.8); opacity: 0.5; }
          70% { transform: scale(1.8); opacity: 0.1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .animate-ping-slow {
          animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-ping-slower {
          animation: pulse-slower 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

function Loading() {
  const [translateY, setTranslateY] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTranslateY((prev) => (prev === 0 ? -5 : 0));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className='bg-gradient-to-br from-gray-700 to-gray-900' style={styles.container}>
      <svg
        width="50"
        height="50"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transform: `translateY(${translateY}px)`,
          transition: 'transform 0.3s ease',
        }}
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12l2 2 4-4" />
      </svg>
     

      <h2 style={styles.text}>Mock Interview Loading....</h2>
    </div>
  );
}
const styles = {
  container: {
    height: '100vh',
    
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: 20,
    fontSize: '1.5rem',
    fontWeight: '600',
    letterSpacing: '1px',
  },
};
export default ChatComponent;