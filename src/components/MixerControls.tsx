import React from "react";
import { Spinner, Card, Form, Row, Col, Button } from "react-bootstrap";
import type { MixParams } from "../types/audio";

interface MixerControlsProps {
  params: MixParams;
  onChange: (params: MixParams) => void;
  onMix: () => Promise<void>;
  disabled?: boolean;
  isProcessing?: boolean;
}

export const MixerControls: React.FC<MixerControlsProps> = ({
  params,
  onChange,
  onMix,
  disabled = false,
  isProcessing = false,
}) => {
  const handleMix = () => {
    console.log("MixerControls: handleMix called");
    onMix();
  };

  const handleNumberChange = (
    key: keyof Pick<
      MixParams,
      | "originalVolume"
      | "bgmVolume"
      | "fadeInDuration"
      | "fadeOutDuration"
      | "bgmStartOffset"
    >,
    value: number,
  ) => {
    onChange({ ...params, [key]: value });
  };

  const handleStringChange = (
    key: "strategy",
    value: MixParams["strategy"],
  ) => {
    onChange({ ...params, [key]: value });
  };

  console.log(
    "MixerControls: Render - disabled:",
    disabled,
    "isProcessing:",
    isProcessing,
  );

  return (
    <Card className="mb-3">
      <Card.Body>
        {/* 音量調整 */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                Original Volume: {Math.round(params.originalVolume * 100)}%
              </Form.Label>
              <Form.Range
                min={0}
                max={1}
                step={0.01}
                value={params.originalVolume}
                onChange={(e) =>
                  handleNumberChange(
                    "originalVolume",
                    parseFloat(e.target.value),
                  )
                }
                disabled={disabled}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                BGM Volume: {Math.round(params.bgmVolume * 100)}%
              </Form.Label>
              <Form.Range
                min={0}
                max={1}
                step={0.01}
                value={params.bgmVolume}
                onChange={(e) =>
                  handleNumberChange("bgmVolume", parseFloat(e.target.value))
                }
                disabled={disabled}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* フェード設定 */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                Fade In Duration: {params.fadeInDuration}s
              </Form.Label>
              <Form.Range
                min={0}
                max={10}
                step={0.1}
                value={params.fadeInDuration}
                onChange={(e) =>
                  handleNumberChange(
                    "fadeInDuration",
                    parseFloat(e.target.value),
                  )
                }
                disabled={disabled}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                Fade Out Duration: {params.fadeOutDuration}s
              </Form.Label>
              <Form.Range
                min={0}
                max={10}
                step={0.1}
                value={params.fadeOutDuration}
                onChange={(e) =>
                  handleNumberChange(
                    "fadeOutDuration",
                    parseFloat(e.target.value),
                  )
                }
                disabled={disabled}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* BGM開始位置 */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                BGM Start Offset: {params.bgmStartOffset}s
              </Form.Label>
              <Form.Range
                min={0}
                max={30}
                step={0.1}
                value={params.bgmStartOffset}
                onChange={(e) =>
                  handleNumberChange(
                    "bgmStartOffset",
                    parseFloat(e.target.value),
                  )
                }
                disabled={disabled}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Length Strategy</Form.Label>
              <Form.Select
                value={params.strategy}
                onChange={(e) =>
                  handleStringChange(
                    "strategy",
                    e.target.value as MixParams["strategy"],
                  )
                }
                disabled={disabled}
              >
                <option value="fit_to_original">Fit to Original</option>
                <option value="loop_bgm">Loop BGM</option>
                <option value="fit_to_bgm">Fit to BGM</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* プリセットボタン */}
        <Row className="mb-3">
          <Col>
            <Button
              variant="outline-secondary"
              size="sm"
              className="me-2"
              onClick={() =>
                onChange({
                  originalVolume: 1.0,
                  bgmVolume: 0.25,
                  fadeInDuration: 2.0,
                  fadeOutDuration: 1.0,
                  strategy: "loop_bgm",
                  bgmStartOffset: 0,
                })
              }
              disabled={disabled}
            >
              Subtle BGM
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              className="me-2"
              onClick={() =>
                onChange({
                  originalVolume: 0.8,
                  bgmVolume: 0.5,
                  fadeInDuration: 3.0,
                  fadeOutDuration: 2.0,
                  strategy: "loop_bgm",
                  bgmStartOffset: 0,
                })
              }
              disabled={disabled}
            >
              Balanced Mix
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() =>
                onChange({
                  originalVolume: 0.6,
                  bgmVolume: 0.8,
                  fadeInDuration: 1.0,
                  fadeOutDuration: 1.0,
                  strategy: "fit_to_original",
                  bgmStartOffset: 0,
                })
              }
              disabled={disabled}
            >
              BGM Focus
            </Button>
          </Col>
        </Row>

        {/* ミックスボタン */}
        <Row>
          <Col>
            <Button
              variant="success"
              size="lg"
              onClick={handleMix}
              disabled={disabled || isProcessing}
              className="w-100"
            >
              {isProcessing ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    className="me-2"
                  />
                  Mixing...
                </>
              ) : (
                "🎵 Mix Audio"
              )}
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};
