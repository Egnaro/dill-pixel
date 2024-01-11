// convenience methods for all the audio manager signals
import { AudioToken } from '../audio';
import { Signals } from '../signals';

export function playAudio(token: AudioToken): void {
  Signals.playAudio.emit(token);
}

export function loadAudio(opts: { assets: string[]; category: string; callback: () => void }): void {
  Signals.loadAudio.emit(opts);
}

export function stopAudio(id: string): void {
  Signals.stopAudio.emit(id);
}

export function audioLoadError(opts: {
  id: string;
  category: string;
  src: string;
  fallback: string[];
  error: any;
}): void {
  Signals.audioLoadError.emit(opts);
}

// convenience methods for caption / voiceover signals
export function playCaption(opts: { id: string; args?: any }): void {
  Signals.playCaption.emit(opts);
}

export function stopCaption(opts: { id: string }): void {
  Signals.stopCaption.emit(opts);
}

export function voiceoverStarted(key: string): void {
  Signals.voiceoverStarted.emit(key);
}

export function voiceoverEnded(key: string): void {
  Signals.voiceoverEnded.emit(key);
}