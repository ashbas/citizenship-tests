import type { TtsProvider } from "../provider.js";

/**
 * Example real TTS provider (ElevenLabs REST API), disabled unless
 * TTS_PROVIDER=elevenlabs and ELEVENLABS_API_KEY are both set. This is one
 * option among several evaluated in the spec's open questions (cost, voice
 * quality, redistribution licensing) — swap for whichever provider is
 * chosen at implementation time by adding a sibling file that implements
 * TtsProvider and registering it in ../registry.ts.
 *
 * The API key is read from process.env and used only in this build-time
 * script; it must never be embedded in client-side (island) bundles.
 */
export function createElevenLabsProvider(): TtsProvider {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM";

  if (!apiKey) {
    throw new Error(
      "ELEVENLABS_API_KEY is not set. Export it in your build environment (never commit it) to use the elevenlabs provider."
    );
  }

  return {
    id: "elevenlabs",
    fileExtension: "mp3",
    async synthesize(text: string): Promise<Buffer> {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5",
          output_format: "mp3_44100_128",
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs TTS request failed: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    },
  };
}
