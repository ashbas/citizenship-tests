/**
 * A TTS provider turns text into audio bytes. Implementations are
 * build-time only — this package never runs in the browser, so it's safe
 * to read API keys from process.env here. Do not import this package from
 * any client-side (island) code.
 */
export interface TtsProvider {
  /** Short id used in file naming / logs, e.g. "elevenlabs", "silence". */
  readonly id: string;
  /**
   * File extension this provider outputs, without the leading dot. Prefer
   * "mp3" or "ogg" for any provider used in production builds (Section 8:
   * small file size matters for a page-speed-sensitive site). The bundled
   * "silence" placeholder provider outputs "wav" purely because it needs
   * no encoder dependency — it exists for local dev/CI, not deployment.
   */
  readonly fileExtension: string;
  synthesize(text: string): Promise<Buffer>;
}
