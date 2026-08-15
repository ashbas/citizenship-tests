import type { TtsProvider } from "./provider.js";
import { silenceProvider } from "./providers/silence.js";
import { createElevenLabsProvider } from "./providers/elevenlabs.js";

/**
 * Resolves a provider by id (TTS_PROVIDER env var or --provider CLI flag).
 * Defaults to "silence" so the pipeline is runnable with zero credentials.
 */
export function resolveProvider(id: string = process.env.TTS_PROVIDER ?? "silence"): TtsProvider {
  switch (id) {
    case "silence":
      return silenceProvider;
    case "elevenlabs":
      return createElevenLabsProvider();
    default:
      throw new Error(`Unknown TTS provider "${id}". Known providers: silence, elevenlabs.`);
  }
}
