/**
 * Web Speech API text-to-speech and speech-to-text engines
 * Supporting bilingual English (en-IN) and Telugu (te-IN) voice interaction
 */

// Extend window type for webkitSpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface WebSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => WebSpeechRecognition;
    webkitSpeechRecognition?: new () => WebSpeechRecognition;
  }
}

export class SpeechService {
  private static synth: SpeechSynthesis | null =
    typeof window !== 'undefined' && 'speechSynthesis' in window
      ? window.speechSynthesis
      : null;

  private static currentUtterance: SpeechSynthesisUtterance | null = null;

  public static isSupported(): boolean {
    return Boolean(this.synth);
  }

  public static speak(
    text: string,
    lang: 'en' | 'te' = 'en',
    onEnd?: () => void
  ): void {
    if (!this.synth) return;

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;

    // Determine appropriate voice
    const voices = this.synth.getVoices();
    if (lang === 'te') {
      utterance.lang = 'te-IN';
      const teVoice = voices.find(
        (v) => v.lang.startsWith('te') || v.name.toLowerCase().includes('telugu')
      );
      if (teVoice) {
        utterance.voice = teVoice;
      }
      utterance.rate = 0.9; // slightly slower for clear articulation
    } else {
      utterance.lang = 'en-IN';
      const enVoice = voices.find(
        (v) => v.lang === 'en-IN' || (v.lang.startsWith('en') && v.default)
      );
      if (enVoice) {
        utterance.voice = enVoice;
      }
      utterance.rate = 0.95;
    }

    utterance.pitch = 1.0;

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis notice:', e);
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  public static stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public static isSpeaking(): boolean {
    return Boolean(this.synth?.speaking);
  }
}

/**
 * Robust Voice-to-Text (Speech Recognition) Service
 * Supports English and Telugu speech input with graceful fallback
 */
export class VoiceToTextService {
  private static recognitionInstance: WebSpeechRecognition | null = null;
  private static isListeningActive: boolean = false;

  public static isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  public static startListening(options: {
    lang?: 'en' | 'te';
    onTranscript: (text: string, isFinal: boolean) => void;
    onError?: (errorMessage: string) => void;
    onStart?: () => void;
    onEnd?: () => void;
  }): boolean {
    if (!this.isSupported()) {
      if (options.onError) {
        options.onError(
          'Voice-to-text is not supported in this browser. Please use Chrome, Edge, or Safari.'
        );
      }
      return false;
    }

    this.stopListening();

    try {
      const SpeechRecognitionConstructor =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionConstructor) return false;

      const recognition = new SpeechRecognitionConstructor();
      this.recognitionInstance = recognition;
      this.isListeningActive = true;

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = options.lang === 'te' ? 'te-IN' : 'en-IN';

      recognition.onstart = () => {
        this.isListeningActive = true;
        if (options.onStart) options.onStart();
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        const transcript = finalTranscript || interimTranscript;
        if (transcript) {
          options.onTranscript(transcript.trim(), Boolean(finalTranscript));
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.warn('Speech recognition error:', event.error);
        this.isListeningActive = false;
        if (options.onError) {
          let userFriendlyMessage = 'Speech recognition encountered an issue.';
          if (event.error === 'not-allowed') {
            userFriendlyMessage =
              'Microphone access was denied. Please allow microphone permissions to speak.';
          } else if (event.error === 'no-speech') {
            userFriendlyMessage = 'No speech was detected. Please try speaking again.';
          } else if (event.error === 'network') {
            userFriendlyMessage = 'Network error while connecting to speech recognition.';
          }
          options.onError(userFriendlyMessage);
        }
      };

      recognition.onend = () => {
        this.isListeningActive = false;
        this.recognitionInstance = null;
        if (options.onEnd) options.onEnd();
      };

      recognition.start();
      return true;
    } catch (err: any) {
      console.error('Failed to initialize speech recognition:', err);
      this.isListeningActive = false;
      if (options.onError) {
        options.onError(err.message || 'Unable to start microphone.');
      }
      return false;
    }
  }

  public static stopListening(): void {
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.stop();
      } catch (e) {
        // Ignore if already stopped
      }
      this.recognitionInstance = null;
    }
    this.isListeningActive = false;
  }

  public static isListening(): boolean {
    return this.isListeningActive;
  }
}
