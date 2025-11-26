import React, { useRef, useState, useEffect } from "react";
import { Card, Button, Row, Col } from "react-bootstrap";
import type { AudioFile } from "../types/audio";

interface AudioPreviewProps {
  title: string;
  audioFile: AudioFile | null;
}

export const AudioPreview: React.FC<AudioPreviewProps> = ({
  title,
  audioFile,
}) => {
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
  }, [audioFile]);

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

  if (!audioFile) {
    return (
      <Card className="mb-3">
        <Card.Header>
          <h6>{title}</h6>
        </Card.Header>
        <Card.Body>
          <p className="text-muted">No audio file selected</p>
        </Card.Body>
      </Card>
    );
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Card className="mb-3">
      <Card.Header>
        <h6>{title}</h6>
      </Card.Header>
      <Card.Body>
        <audio ref={audioRef} src={audioFile.url} preload="metadata" />

        <Row className="align-items-center mb-2">
          <Col xs="auto">
            <Button
              variant={isPlaying ? "danger" : "primary"}
              size="sm"
              onClick={togglePlay}
            >
              {isPlaying ? "⏸️" : "▶️"}
            </Button>
          </Col>
          <Col>
            <input
              type="range"
              className="form-range"
              min="0"
              max="100"
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

        <small className="text-muted">{audioFile.name}</small>
      </Card.Body>
    </Card>
  );
};
