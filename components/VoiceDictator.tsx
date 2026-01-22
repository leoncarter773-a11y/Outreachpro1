
import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, Loader2, Sparkles, CheckCircle2, Wand2, RefreshCw } from 'lucide-react';
import { gemini } from '../services/geminiService.ts';

interface VoiceDictatorProps {
  onResult: (text: string) => void;
  className?: string;
  variant?: 'default' | 'minimal';
  children?: React.ReactNode;
}

export const VoiceDictator: React.FC<VoiceDictatorProps> = ({ onResult, className, variant = 'default', children }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const micRef = useRef<{ analyser: AnalyserNode, stop: () => void } | null>(null);
  const sessionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  const startListening = async () => {
    setLoading(true);
    setTranscript('');
    try {
      const sessionPromise = gemini.connectTranscription((text, isFinal) => {
        if (text) {
          setTranscript(prev => prev + ' ' + text);
        }
      });
      
      sessionRef.current = await sessionPromise;
      const mic = await gemini.startMicStream(sessionPromise);
      micRef.current = mic;
      setIsListening(true);
      drawVisualizer();
    } catch (err) {
      console.error("Failed to start dictation", err);
    } finally {
      setLoading(false);
    }
  };

  const drawVisualizer = () => {
    if (!micRef.current || !canvasRef.current) return;
    const { analyser } = micRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const renderFrame = () => {
      animationRef.current = requestAnimationFrame(renderFrame);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = `rgba(79, 70, 229, ${dataArray[i] / 255 + 0.1})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    renderFrame();
  };

  const stopListening = () => {
    cancelAnimationFrame(animationRef.current);
    if (micRef.current) micRef.current.stop();
    if (sessionRef.current) sessionRef.current.close();
    setIsListening(false);
  };

  const handleRefine = async () => {
    if (!transcript) return;
    setIsPolishing(true);
    try {
      const refined = await gemini.refineText(transcript);
      if (refined) setTranscript(refined);
    } catch (err) {
      console.error("Refinement failed", err);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleComplete = () => {
    onResult(transcript.trim());
    setTranscript('');
    setIsListening(false);
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Trigger startListening on click if children are provided */}
      {children ? (
        <div onClick={startListening} className="cursor-pointer">
          {children}
        </div>
      ) : variant === 'minimal' ? (
        <button
          onClick={startListening}
          className="p-1.5 rounded-lg transition-all border bg-white border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-600"
          title="Voice Dictation"
        >
          <Mic size={14} />
        </button>
      ) : (
        <button
          onClick={startListening}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 font-bold text-[10px] uppercase tracking-wider"
        >
          <Mic size={12} />
          Voice Entry
        </button>
      )}

      {(isListening || transcript) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[500px]">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3 text-indigo-600">
                <Sparkles size={20} className={isListening ? 'animate-pulse' : ''} />
                <span className="font-black text-xs uppercase tracking-widest">
                  {isListening ? 'Gemini AI Listening...' : 'Transcription Complete'}
                </span>
              </div>
              <button onClick={() => { stopListening(); setTranscript(''); }} className="p-2 text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 flex-1 overflow-y-auto min-h-[150px] relative">
              {isListening && (
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" />
              )}
              
              {transcript ? (
                <div className="space-y-4">
                  <p className="text-xl font-medium text-slate-800 leading-relaxed">
                    {transcript}
                    {isListening && <span className="inline-block w-1.5 h-6 bg-indigo-600 ml-1 animate-pulse" />}
                  </p>
                  {!isListening && !isPolishing && (
                    <button 
                      onClick={handleRefine}
                      className="inline-flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest hover:text-indigo-800 transition-colors"
                    >
                      <Wand2 size={14} /> Magic Refine Transcript
                    </button>
                  )}
                  {isPolishing && (
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest italic">
                      <RefreshCw size={14} className="animate-spin" /> Polishing with Gemini AI...
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className={`w-1 bg-indigo-200 rounded-full h-8 animate-bounce`} style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                  <p className="font-bold text-sm uppercase tracking-widest">Speak naturally...</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              {isListening ? (
                <button 
                  onClick={stopListening}
                  className="px-8 py-3 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 transition-all shadow-lg shadow-rose-100"
                >
                  Stop Recording
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => { setTranscript(''); startListening(); }}
                    className="px-4 py-3 text-slate-500 font-bold text-sm hover:text-slate-800"
                  >
                    Discard & Retake
                  </button>
                  <button 
                    onClick={handleComplete}
                    disabled={isPolishing}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
                  >
                    <CheckCircle2 size={16} /> Insert Text
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
