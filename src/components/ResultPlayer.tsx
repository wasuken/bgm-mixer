import React, { useRef, useState, useEffect } from "react";
import { Card, Button, Row, Col, Form, Alert } from "react-bootstrap";
import type { MixedAudio } from "../types/audio";

interface ResultPlayerProps {
  mixedAudio: MixedAudio | null;
}

export const ResultPlayer: React.FC<ResultPlayerProps> = ({ mixedAudio }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [mixedAudio]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const seekTime = (parseFloat(event.target.value) / 100) * duration;
    audio.currentTime = seekTime;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const copyUrl = async () => {
    if (mixedAudio?.url) {
      try {
        await navigator.clipboard.writeText(mixedAudio.url);
        alert("URL copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy URL:", err);
      }
    }
  };

  if (!mixedAudio) {
    return (
      <Card className="mb-3">
        <Card.Header>
          <h5>🎵 Mixed Audio Result</h5>
        </Card.Header>
        <Card.Body>
          <p className="text-muted">
            No mixed audio available. Please mix your audio files first.
          </p>
        </Card.Body>
      </Card>
    );
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Card className="mb-3">
      <Card.Header>
        <h5>🎵 Mixed Audio Result</h5>
      </Card.Header>
      <Card.Body>
        <audio ref={audioRef} src={mixedAudio.url} preload="metadata" />

        <Alert variant="success" className="mb-3">
          <strong>✓ Audio mixed successfully!</strong>
          <br />
          <small>Duration: {formatTime(mixedAudio.duration)}</small>
        </Alert>

        <Row className="align-items-center mb-3">
          <Col xs="auto">
            <Button
              variant={isPlaying ? "danger" : "primary"}
              onClick={togglePlay}
            >
              {isPlaying ? "⏸️ Pause" : "▶️ Play"}
            </Button>
          </Col>
          <Col>
            <Form.Range
              min={0}
              max={100}
              value={progressPercentage}
              onChange={handleSeek}
            />
          </Col>
          <Col xs="auto">
            <small className="text-muted">
              {formatTime(currentTime)} / {formatTime(duration)}
            </small>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Button
              variant="outline-secondary"
              onClick={copyUrl}
              className="w-100 mb-2"
            >
              📋 Copy URL
            </Button>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Audio URL (for copying):</Form.Label>
              <Form.Control
                type="text"
                value={mixedAudio.url}
                readOnly
                size="sm"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};
