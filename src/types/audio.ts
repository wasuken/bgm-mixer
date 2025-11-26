export interface AudioFile {
  file: File;
  buffer: AudioBuffer | null;
  url: string;
  duration: number;
  name: string;
}

export interface MixParams {
  originalVolume: number;
  bgmVolume: number;
  fadeInDuration: number;
  fadeOutDuration: number;
  strategy: "fit_to_original" | "fit_to_bgm" | "loop_bgm";
  bgmStartOffset: number;
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  error: string | null;
}

export interface MixedAudio {
  buffer: AudioBuffer | null;
  url: string;
  duration: number;
}
