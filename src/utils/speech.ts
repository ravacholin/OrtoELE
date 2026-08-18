/**
 * Web Speech API wrapper for Spanish Audio Synthesis in ELE Orthography
 */

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private preferredVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    // Prioritize high quality Spanish voices (es-ES, es-MX, es-AR, es-US)
    this.preferredVoice = 
      this.voices.find(v => v.lang.startsWith('es') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium'))) ||
      this.voices.find(v => v.lang.startsWith('es')) ||
      null;
  }

  public isSupported(): boolean {
    return !!this.synth;
  }

  public speak(
    text: string, 
    options?: { 
      rate?: number; 
      pitch?: number; 
      lang?: string; 
      onEnd?: () => void;
      onError?: () => void;
    }
  ) {
    if (!this.synth) {
      if (options?.onEnd) options.onEnd();
      return;
    }

    this.synth.cancel(); // Stop any pending speech

    const cleanText = text.replace(/\[[A-Z]+\]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    utterance.lang = options?.lang || (this.preferredVoice?.lang || 'es-ES');
    utterance.rate = options?.rate || 0.9;
    utterance.pitch = options?.pitch || 1.0;
    
    if (this.preferredVoice) {
      utterance.voice = this.preferredVoice;
    }

    utterance.onend = () => {
      if (options?.onEnd) options.onEnd();
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis error", e);
      if (options?.onError) options.onError();
    };

    this.synth.speak(utterance);
  }

  public speakSyllables(syllables: string[], onComplete?: () => void) {
    if (!syllables || syllables.length === 0) {
      if (onComplete) onComplete();
      return;
    }
    
    let index = 0;
    const playNext = () => {
      if (index >= syllables.length) {
        if (onComplete) onComplete();
        return;
      }
      const syll = syllables[index];
      index++;
      this.speak(syll, {
        rate: 0.8,
        onEnd: () => {
          setTimeout(playNext, 250);
        }
      });
    };
    playNext();
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const speechService = new SpeechService();
