import type { TtsProvider } from "../provider.js";

const SAMPLE_RATE = 8000;

/** Builds a minimal, valid, silent PCM WAV file scaled roughly to reading time. */
function buildSilentWav(text: string): Buffer {
  const estimatedSeconds = Math.max(1, Math.round(text.split(/\s+/).length / 2.5));
  const numSamples = estimatedSeconds * SAMPLE_RATE;
  const dataSize = numSamples * 2; // 16-bit mono
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // fmt chunk size
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  // PCM samples are already zeroed by Buffer.alloc => silence.

  return buffer;
}

/**
 * No-op placeholder provider: generates silent audio files sized roughly
 * to the question length. Used as the default so `pnpm generate` works
 * out of the box without any TTS credentials — swap in a real provider
 * (see providers/README) before deploying to production.
 */
export const silenceProvider: TtsProvider = {
  id: "silence",
  fileExtension: "wav",
  async synthesize(text: string): Promise<Buffer> {
    return buildSilentWav(text);
  },
};
