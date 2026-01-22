
import React, { useState, useRef, useEffect } from 'react';
import { Mic, X, Sparkles, Loader2, Navigation } from 'lucide-react';
import { gemini } from '../services/geminiService.ts';

interface VoiceAssistantProps {
  onNavigate: (view: string) => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onNavigate }) => {
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  
  const micRef = useRef<any>(null);
  const sessionRef = useRef<any>(null);

  const startAssistant = async () => {
    setIsListening(true);
    setTranscript('');
    setStatus('Listening...');
    setLoading(true);
    
    try {
      const sessionPromise = gemini.connectTranscription((text, isFinal) => {
        if (text) setTranscript(prev => prev + ' ' + text);
        if (isFinal) {
          // Intentional delay to capture command
        }
      });
      
      sessionRef.current = await sessionPromise;
      micRef.current = await gemini.startMicStream(sessionPromise);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const processCommand = async () => {
    if (!transcript) return;
    setLoading(true);
    setStatus('Processing intent...');
    
    try {
      const intent = await gemini.interpretCommand(transcript);
      if (intent.action === 'navigate') {
        setStatus(`Navigating to ${intent.target}...`);
        setTimeout(() => {
          onNavigate(intent.target);
          closeAssistant();
        }, 1000);
      } else {
        setStatus(intent.message || "I didn't understand that command.");
        setTimeout(closeAssistant, 2000);
      }
    } catch (err) {
      console.error(err);
      closeAssistant();
    }
  };

  const closeAssistant = () => {
    if (micRef.current) micRef.current.stop();
    if (sessionRef.current) sessionRef.current.close();
    setIsListening(false);
    setTranscript('');
    setStatus(null);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[200]">
      {!isListening ? (
        <button 
          onClick={startAssistant}
          className="w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-200 flex items-center justify-center hover:scale-110 transition-all group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-150 transition-transform duration-700 rounded-full" />
          <Mic size={28} />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-400 rounded-full animate-ping" />
        </button>
      ) : (
        <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 p-6 w-80 animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-indigo-600">
              <Sparkles className="animate-pulse" size={18} />
              <span className="font-black text-[10px] uppercase tracking-[0.2em]">Voice AI Assistant</span>
            </div>
            <button onClick={closeAssistant} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="min-h-[60px]">
              {transcript ? (
                <p className="text-slate-800 font-medium italic">"{transcript.trim()}..."</p>
              ) : (
                <p className="text-slate-400 italic">"Go to leads dashboard..."</p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-50">
              {loading ? (
                <div className="flex items-center gap-2 text-indigo-600">
                  <Loader2 className="animate-spin" size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">{status}</span>
                </div>
              ) : (
                <button 
                  onClick={processCommand}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  Confirm Command
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
