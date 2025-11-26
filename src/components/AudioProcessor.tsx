import React from 'react';
import { Card, ProgressBar, Alert, Spinner } from 'react-bootstrap';
import type { ProcessingState } from '../types/audio';

interface AudioProcessorProps {
  processingState: ProcessingState;
}

const getProgressMessage = (progress: number): string => {
  if (progress < 20) return 'Initializing audio processing...';
  if (progress < 40) return 'Loading audio buffers...';
  if (progress < 60) return 'Mixing audio channels...';
  if (progress < 80) return 'Applying effects and filters...';
  if (progress < 100) return 'Finalizing output...';
  return 'Completed!';
};

export const AudioProcessor: React.FC<AudioProcessorProps> = ({ processingState }) => {
  if (!processingState.isProcessing && !processingState.error && processingState.progress === 0) {
    return null;
  }

  return (
    <Card className="mb-3">
      <Card.Header>
        <h6>🔄 Processing Status</h6>
      </Card.Header>
      <Card.Body>
        {processingState.error && (
          <Alert variant="danger">
            <strong>❌ Error:</strong> {processingState.error}
          </Alert>
        )}

        {processingState.isProcessing && (
          <>
            <div className="d-flex align-items-center mb-2">
              <Spinner animation="border" size="sm" className="me-2" />
              <small className="text-muted">{getProgressMessage(processingState.progress)}</small>
            </div>
            <ProgressBar
              now={processingState.progress}
              label={`${Math.round(processingState.progress)}%`}
              animated
              striped
              variant="info"
            />
            <small className="text-muted d-block mt-1">
              This may take a few seconds depending on file size...
            </small>
          </>
        )}

        {!processingState.isProcessing && processingState.progress === 100 && !processingState.error && (
          <Alert variant="success">
            <strong>✅ Completed!</strong> Audio mixing finished successfully.
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};
