import React, { useState } from "react";
import { Container, Row, Col, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import { FileUploader } from "./components/FileUploader";
import { AudioPreview } from "./components/AudioPreview";
import { MixerControls } from "./components/MixerControls";
import { AudioProcessor } from "./components/AudioProcessor";
import { ResultPlayer } from "./components/ResultPlayer";
import { useAudioProcessor } from "./hooks/useAudioProcessor";
import type { AudioFile, MixParams, MixedAudio } from "./types/audio";

const App: React.FC = () => {
  const [originalAudio, setOriginalAudio] = useState<AudioFile | null>(null);
  const [bgmAudio, setBgmAudio] = useState<AudioFile | null>(null);
  const [mixedAudio, setMixedAudio] = useState<MixedAudio | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [mixParams, setMixParams] = useState<MixParams>({
    originalVolume: 1.0,
    bgmVolume: 0.25,
    fadeInDuration: 2.0,
    fadeOutDuration: 1.0,
    strategy: "loop_bgm",
    bgmStartOffset: 0,
  });

  const { mixAudio, processingState } = useAudioProcessor();

  const handleOriginalFileLoad = (audioFile: AudioFile) => {
    setOriginalAudio(audioFile);
    setError(null);
  };

  const handleBgmFileLoad = (audioFile: AudioFile) => {
    setBgmAudio(audioFile);
    setError(null);
  };

  const handleMix = async () => {
    if (processingState.isProcessing) {
      console.log("App.tsx: Already processing, returning");
      return;
    }

    if (!originalAudio || !bgmAudio) {
      setError("Please load both original audio and BGM files");
      return;
    }

    try {
      setError(null);
      const result = await mixAudio(originalAudio, bgmAudio, mixParams);
      setMixedAudio(result);
    } catch (err) {
      console.log("App.tsx: mixAudio error:", err);
      setError(err instanceof Error ? err.message : "Failed to mix audio");
    }
  };

  const canMix =
    originalAudio != null && bgmAudio != null && !processingState.isProcessing;

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="text-center">🎵 BGM Mixer</h1>
          <p className="text-center text-muted">
            Mix background music with your original audio files
          </p>
        </Col>
      </Row>

      {error && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col md={6}>
          <FileUploader
            title="📢 Original Audio"
            audioFile={originalAudio}
            onFileLoad={handleOriginalFileLoad}
            onError={setError}
          />
          <AudioPreview
            title="Original Audio Preview"
            audioFile={originalAudio}
          />
        </Col>
        <Col md={6}>
          <FileUploader
            title="🎶 Background Music"
            audioFile={bgmAudio}
            onFileLoad={handleBgmFileLoad}
            onError={setError}
          />
          <AudioPreview title="BGM Preview" audioFile={bgmAudio} />
        </Col>
      </Row>

      <Row>
        <Col>
          <MixerControls
            params={mixParams}
            onChange={setMixParams}
            onMix={handleMix}
            disabled={!canMix}
            isProcessing={processingState.isProcessing}
          />
        </Col>
      </Row>

      <Row>
        <Col>
          <AudioProcessor processingState={processingState} />
        </Col>
      </Row>

      <Row>
        <Col>
          <ResultPlayer mixedAudio={mixedAudio} />
        </Col>
      </Row>
    </Container>
  );
};

export default App;
