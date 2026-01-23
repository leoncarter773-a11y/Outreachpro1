
import React, { useState, useRef, useEffect } from 'react';
import { Mic, X, Sparkles, Loader2, Navigation, Command, CheckCircle2 } from 'lucide-react';
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
    setStatus('Ready for command...');
    setLoading(true);
    
    try {
      const sessionPromise = gemini.connectTranscription((text, isFinal) => {
        if (text) setTranscript(prev => prev + ' ' + text);
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
    setStatus('Understanding...');
    
    try {
      const intent = await gemini.interpretCommand(transcript);
      
      if (intent.action === 'navigate') {
        setStatus(`Navigating to ${intent.target}...`);
        setTimeout(() => {
          onNavigate(intent.target);
          closeAssistant();
        }, 800);
      } else if (intent.action === 'action' || intent.action === 'search') {
        setStatus(`Executing action: ${intent.target}...`);
        // Emit global event for the current view to pick up
        window.dispatchEvent(new CustomEvent('voice-command', { detail: intent }));
        setTimeout(closeAssistant, 1200);
      } else {
        setStatus(intent.message || "Unknown command.");
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
          className="w-16 h-16 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-indigo-600 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full" />
          <Mic className="relative z-10" size={28} />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-400 rounded-full animate-ping" />
        </button>
      ) : (
        <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 p-6 w-80 animate-in zoom-in-95 duration-300 ring-4 ring-indigo-500/10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-indigo-600">
              <Sparkles className="animate-pulse" size={18} />
              <span className="font-black text-[10px] uppercase tracking-[0.2em]">VA Command Center</span>
            </div>
            <button onClick={closeAssistant} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
          </div>

          <div className="space-y-4">
            <div className="min-h-[80px] flex flex-col justify-center">
              {transcript ? (
                <p className="text-slate-800 font-bold leading-tight italic">"{transcript.trim()}"</p>
              ) : (
                <div className="space-y-2 opacity-40">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Try saying:</p>
                  <p className="text-xs font-medium italic">"Go to outreach"</p>
                  <p className="text-xs font-medium italic">"Search for Alex"</p>
                  <p className="text-xs font-medium italic">"Export CSV"</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-50">
              {loading ? (
                <div className="flex items-center gap-2 text-indigo-600 justify-center">
                  <Loader2 className="animate-spin" size={16} />
                  <span className="text-[10px] font-black uppercase tracking-wider">{status}</span>
                </div>
              ) : (
                <button 
                  onClick={processCommand}
                  className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                >
                  <Command size={16} /> Run Command
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
