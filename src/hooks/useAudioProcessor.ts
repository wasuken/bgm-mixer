import { useState, useCallback, useRef } from "react";
import type {
  AudioFile,
  MixParams,
  ProcessingState,
  MixedAudio,
} from "../types/audio";

export const useAudioProcessor = () => {
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    error: null,
  });

  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const loadAudioFile = useCallback(
    async (file: File): Promise<AudioFile> => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const audioContext = getAudioContext();
        const buffer = await audioContext.decodeAudioData(arrayBuffer);
        const url = URL.createObjectURL(file);

        return {
          file,
          buffer,
          url,
          duration: buffer.duration,
          name: file.name,
        };
      } catch (error) {
        throw new Error(`Failed to load audio file: ${error}`);
      }
    },
    [getAudioContext],
  );

  const updateProgress = useCallback((progress: number) => {
    console.log("useAudioProcessor: updateProgress called with:", progress);
    setProcessingState((prev) => {
      console.log("useAudioProcessor: updateProgress - prev state:", prev);
      const newState = {
        ...prev,
        progress,
      };
      console.log("useAudioProcessor: updateProgress - new state:", newState);
      return newState;
    });
  }, []);

  const mixAudio = useCallback(
    async (
      original: AudioFile,
      bgm: AudioFile,
      params: MixParams,
    ): Promise<MixedAudio> => {
      console.log("useAudioProcessor: mixAudio called");

      // 開始時の状態設定
      console.log("useAudioProcessor: Setting initial processing state");
      setProcessingState({
        isProcessing: true,
        progress: 0,
        error: null,
      });

      // 状態設定の確認用 - 少し待機
      await new Promise((resolve) => setTimeout(resolve, 100));

      try {
        if (!original.buffer || !bgm.buffer) {
          throw new Error("Audio buffers not loaded");
        }

        const audioContext = getAudioContext();
        const originalBuffer = original.buffer;
        const bgmBuffer = bgm.buffer;

        // 最終的な長さを決定
        let finalDuration: number;
        switch (params.strategy) {
          case "fit_to_original":
            finalDuration = originalBuffer.duration;
            break;
          case "fit_to_bgm":
            finalDuration = bgmBuffer.duration;
            break;
          case "loop_bgm":
          default:
            finalDuration = originalBuffer.duration;
            break;
        }

        console.log("useAudioProcessor: Calling updateProgress(20)");
        updateProgress(20);
        await new Promise((resolve) => setTimeout(resolve, 200)); // 状態確認用

        // サンプルレートとチャンネル数
        const sampleRate = audioContext.sampleRate;
        const channels = Math.max(
          originalBuffer.numberOfChannels,
          bgmBuffer.numberOfChannels,
        );
        const frameCount = Math.floor(finalDuration * sampleRate);

        // 出力バッファを作成
        const outputBuffer = audioContext.createBuffer(
          channels,
          frameCount,
          sampleRate,
        );

        console.log("useAudioProcessor: Calling updateProgress(40)");
        updateProgress(40);
        await new Promise((resolve) => setTimeout(resolve, 200)); // 状態確認用

        // チャンネルごとに処理
        for (let channel = 0; channel < channels; channel++) {
          const outputData = outputBuffer.getChannelData(channel);

          // オリジナル音声データ
          const originalData =
            channel < originalBuffer.numberOfChannels
              ? originalBuffer.getChannelData(channel)
              : originalBuffer.getChannelData(0);

          // BGMデータ
          const bgmData =
            channel < bgmBuffer.numberOfChannels
              ? bgmBuffer.getChannelData(channel)
              : bgmBuffer.getChannelData(0);

          // サンプルごとにミックス
          for (let i = 0; i < frameCount; i++) {
            let originalSample = 0;
            let bgmSample = 0;

            // オリジナル音声のサンプル取得
            if (i < originalData.length) {
              originalSample = originalData[i] * params.originalVolume;
            }

            // BGMのサンプル取得（ループ対応）
            const bgmStartFrame = Math.floor(
              params.bgmStartOffset * sampleRate,
            );
            const bgmIndex = (i + bgmStartFrame) % bgmData.length;
            if (i < finalDuration * sampleRate) {
              bgmSample = bgmData[bgmIndex] * params.bgmVolume;

              // フェードイン処理
              const fadeInFrames = params.fadeInDuration * sampleRate;
              if (i < fadeInFrames) {
                const fadeInRatio = i / fadeInFrames;
                bgmSample *= fadeInRatio;
              }

              // フェードアウト処理
              const fadeOutFrames = params.fadeOutDuration * sampleRate;
              const fadeOutStart = frameCount - fadeOutFrames;
              if (i > fadeOutStart) {
                const fadeOutRatio = (frameCount - i) / fadeOutFrames;
                bgmSample *= fadeOutRatio;
              }
            }

            // ミックス（クリッピング防止）
            outputData[i] = Math.max(
              -1,
              Math.min(1, originalSample + bgmSample),
            );
          }
        }

        console.log("useAudioProcessor: Calling updateProgress(80)");
        updateProgress(80);
        await new Promise((resolve) => setTimeout(resolve, 200)); // 状態確認用

        // AudioBufferをBlobに変換
        const length = outputBuffer.length;
        const arrayBuffer = new ArrayBuffer(44 + length * channels * 2);
        const view = new DataView(arrayBuffer);

        // WAVヘッダー作成
        const writeString = (offset: number, string: string) => {
          for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
          }
        };

        writeString(0, "RIFF");
        view.setUint32(4, 36 + length * channels * 2, true);
        writeString(8, "WAVE");
        writeString(12, "fmt ");
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, channels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * channels * 2, true);
        view.setUint16(32, channels * 2, true);
        view.setUint16(34, 16, true);
        writeString(36, "data");
        view.setUint32(40, length * channels * 2, true);

        // 音声データ書き込み
        let offset = 44;
        for (let i = 0; i < length; i++) {
          for (let channel = 0; channel < channels; channel++) {
            const sample = outputBuffer.getChannelData(channel)[i];
            const intSample = Math.max(-1, Math.min(1, sample)) * 0x7fff;
            view.setInt16(offset, intSample, true);
            offset += 2;
          }
        }

        console.log("useAudioProcessor: Calling updateProgress(100)");
        updateProgress(100);
        await new Promise((resolve) => setTimeout(resolve, 200)); // 状態確認用

        const blob = new Blob([arrayBuffer], { type: "audio/wav" });
        const url = URL.createObjectURL(blob);

        const result = {
          buffer: outputBuffer,
          url,
          duration: finalDuration,
        };

        // 完了状態を設定
        console.log("useAudioProcessor: Setting final completion state");
        setProcessingState({
          isProcessing: false,
          progress: 100,
          error: null,
        });

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        console.log("useAudioProcessor: Error occurred:", errorMessage);
        setProcessingState({
          isProcessing: false,
          progress: 0,
          error: errorMessage,
        });

        throw error;
      }
    },
    [getAudioContext, updateProgress],
  );

  console.log(
    "useAudioProcessor: Hook render, processingState:",
    processingState,
  );

  return {
    loadAudioFile,
    mixAudio,
    processingState,
    audioContext: audioContextRef.current,
  };
};
