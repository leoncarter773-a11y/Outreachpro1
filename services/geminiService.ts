
import { GoogleGenAI, Type, Modality, LiveServerMessage } from "@google/genai";

// Audio helpers as per guidelines
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): any {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

export class GeminiService {
  ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async connectTranscription(onTranscript: (text: string, isFinal: boolean) => void) {
    const sessionPromise = this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => console.log('Transcription session opened'),
        onmessage: async (message: LiveServerMessage) => {
          if (message.serverContent?.inputTranscription) {
            const text = message.serverContent.inputTranscription.text;
            onTranscript(text, false);
          }
          if (message.serverContent?.turnComplete) {
            onTranscript('', true);
          }
        },
        onerror: (e) => console.error('Transcription error', e),
        onclose: () => console.log('Transcription session closed'),
      },
      config: {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {},
        systemInstruction: 'You are a silent transcription assistant. Only provide transcriptions of the user input audio. Do not respond with audio or text yourself.'
      },
    });

    return sessionPromise;
  }

  async startMicStream(sessionPromise: Promise<any>) {
    const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    const analyser = inputAudioContext.createAnalyser();
    analyser.fftSize = 256;
    
    const source = inputAudioContext.createMediaStreamSource(stream);
    const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);

    source.connect(analyser);

    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
      const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
      const pcmBlob = createBlob(inputData);
      sessionPromise.then((session) => {
        session.sendRealtimeInput({ media: pcmBlob });
      });
    };

    source.connect(scriptProcessor);
    scriptProcessor.connect(inputAudioContext.destination);

    return {
      analyser,
      stop: () => {
        stream.getTracks().forEach(track => track.stop());
        source.disconnect();
        scriptProcessor.disconnect();
        inputAudioContext.close();
      }
    };
  }

  async parseLeadFromVoice(transcript: string) {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract lead information from this transcript: "${transcript}"
      
      Format the response as a JSON object with:
      - name (string)
      - email (string)
      - company (string)
      - desc (string, a short summary of the notes)
      
      If information is missing, use empty strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            email: { type: Type.STRING },
            company: { type: Type.STRING },
            desc: { type: Type.STRING },
          },
          required: ["name", "email", "company", "desc"]
        }
      },
    });
    return JSON.parse(response.text || '{}');
  }

  async refineText(text: string) {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Polish and professionally format this transcript. Fix grammar, remove filler words like 'um', and ensure it makes sense in a business context. Keep it concise.
      
      Transcript: "${text}"`,
      config: {
        responseMimeType: "text/plain"
      },
    });
    return response.text;
  }

  async interpretCommand(command: string) {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Interpret this user voice command for a VA Outreach app.
      Command: "${command}"
      
      Output one of these intents in JSON:
      1. { "action": "navigate", "target": "dashboard" | "leads" | "outreach" | "settings" | "analytics" | "team" }
      2. { "action": "unknown", "message": "I didn't understand that command." }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING },
            target: { type: Type.STRING },
            message: { type: Type.STRING }
          },
          required: ["action"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  }

  async generateBrandVoice(serviceType: string, targetClient: string) {
    const prompt = `Act as a high-end Brand Strategist for Virtual Assistants.
    User Service: ${serviceType}
    Target Market: ${targetClient}
    
    Task: Create a "Business Identity Activation" profile.
    Output: Must be valid JSON object.`;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tagline: { type: Type.STRING },
            voiceKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            usp: { type: Type.STRING },
          },
          required: ["tagline", "voiceKeywords", "usp"],
        },
      },
    });

    try {
      return JSON.parse(response.text || '{}');
    } catch (e) {
      return null;
    }
  }

  async generateOutreachSequence(serviceType: string, targetClient: string, goal: string) {
    const prompt = `Create a 3-step outreach sequence for ${serviceType} targeting ${targetClient}. Goal: ${goal}. JSON output.`;
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.NUMBER },
              subject: { type: Type.STRING },
              content: { type: Type.STRING },
            },
            required: ["day", "subject", "content"],
          },
        },
      },
    });
    return JSON.parse(response.text || '[]');
  }

  async analyzeLeadQuality(leadDescription: string) {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze lead: "${leadDescription}". Score 1-10. advice.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rating: { type: Type.NUMBER },
            reasons: { type: Type.ARRAY, items: { type: Type.STRING } },
            nextAction: { type: Type.STRING },
          },
          required: ["rating", "reasons", "nextAction"],
        },
      },
    });
    return JSON.parse(response.text || '{}');
  }
}

export const gemini = new GeminiService();
