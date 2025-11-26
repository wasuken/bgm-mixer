import React, { useCallback, useState } from "react";
import { Card, Form, Alert, Spinner } from "react-bootstrap";
import type { AudioFile } from "../types/audio";

interface FileUploaderProps {
  title: string;
  audioFile: AudioFile | null;
  onFileLoad: (audioFile: AudioFile) => void;
  onError: (error: string) => void;
  accept?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  title,
  audioFile,
  onFileLoad,
  onError,
  accept = "audio/*",
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsLoading(true);

      try {
        // ファイルサイズチェック（50MB制限）
        if (file.size > 50 * 1024 * 1024) {
          throw new Error("File size must be less than 50MB");
        }

        // ファイル形式チェック
        if (!file.type.startsWith("audio/")) {
          throw new Error("Please select an audio file");
        }

        const arrayBuffer = await file.arrayBuffer();
        const audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        const buffer = await audioContext.decodeAudioData(arrayBuffer);
        const url = URL.createObjectURL(file);

        const audioFile: AudioFile = {
          file,
          buffer,
          url,
          duration: buffer.duration,
          name: file.name,
        };

        onFileLoad(audioFile);
      } catch (error) {
        onError(error instanceof Error ? error.message : "Failed to load file");
      } finally {
        setIsLoading(false);
      }
    },
    [onFileLoad, onError],
  );

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="mb-3">
      <Card.Header>
        <h5>{title}</h5>
      </Card.Header>
      <Card.Body>
        <Form.Group>
          <Form.Control
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="mb-3"
            disabled={isLoading}
          />
        </Form.Group>

        {isLoading && (
          <Alert variant="info" className="d-flex align-items-center">
            <Spinner animation="border" size="sm" className="me-2" />
            <span>Loading audio file...</span>
          </Alert>
        )}

        {audioFile && !isLoading && (
          <Alert variant="success">
            <strong>✓ Loaded:</strong> {audioFile.name}
            <br />
            <small>Duration: {formatDuration(audioFile.duration)}</small>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};
