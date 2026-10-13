/**
 * Voice-to-Text (Speech Recognition) service supporting English and Telugu
 * Uses the Web Speech API with clean status handling and callbacks.
 */

// Define Web Speech API types for TypeScript
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export class SpeechRecognitionService {
  private static recognition: any = null;
  private static isListening: boolean = false;

  public static isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as IWindow;
    return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
  }

  public static startListening(options: {
    lang: 'en' | 'te' | 'bilingual';
    onResult: (transcript: string) => void;
    onError?: (error: string) => void;
    onEnd?: () => void;
  }): boolean {
    if (!this.isSupported()) {
      if (options.onError) {
        options.onError('Speech recognition is not supported in this browser.');
      }
      return false;
    }

    try {
      this.stopListening();

      const win = window as IWindow;
      const SpeechRecognitionConstructor =
        win.SpeechRecognition || win.webkitSpeechRecognition;

      const recognition = new SpeechRecognitionConstructor();
      this.recognition = recognition;

      recognition.continuous = false;
      recognition.interimResults = false;

      // Set language: Telugu (te-IN) or Indian English (en-IN)
      if (options.lang === 'te') {
        recognition.lang = 'te-IN';
      } else {
        recognition.lang = 'en-IN';
      }

      recognition.onstart = () => {
        this.isListening = true;
      };

      recognition.onresult = (event: any) => {
        const transcript =
          event.results[0]?.[0]?.transcript || '';
        if (transcript && options.onResult) {
          options.onResult(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        this.isListening = false;
        if (options.onError) {
          options.onError(event.error);
        }
      };

      recognition.onend = () => {
        this.isListening = false;
        if (options.onEnd) {
          options.onEnd();
        }
      };

      recognition.start();
      return true;
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      this.isListening = false;
      if (options.onError) {
        options.onError(err.message || 'Error initializing microphone');
      }
      return false;
    }
  }

  public static stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {
        // ignore
      }
      this.recognition = null;
    }
    this.isListening = false;
  }

  public static getListeningState(): boolean {
    return this.isListening;
  }
}
