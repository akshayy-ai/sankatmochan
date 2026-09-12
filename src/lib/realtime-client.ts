/**
 * realtime-client.ts — WebRTC client for OpenAI Realtime API.
 *
 * Handles:
 * - Ephemeral token acquisition from /api/realtime/session
 * - RTCPeerConnection setup with mic capture
 * - Data channel ("oai-events") for bidirectional events
 * - Tool call handling (create_emergency_case, dispatch_emergency_unit)
 */

export type RealtimeEvent = {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export type VoiceCallState =
  | "idle"
  | "connecting"
  | "active"
  | "tool_calling"
  | "ended"
  | "error";

export type TranscriptEntry = {
  role: "caller" | "agent" | "system";
  text: string;
  language?: string;
  timestamp: number;
};

export type EmergencyCase = {
  emergency_type: string;
  severity: string;
  location: string;
  language: string;
  description_english: string;
  description_native?: string;
  people_affected?: number;
  injuries?: string;
  caller_name?: string;
};

export type DispatchRequest = {
  agency: string;
  location: string;
  priority: string;
  unit_type?: string;
};

export type RealtimeCallbacks = {
  onStateChange: (state: VoiceCallState) => void;
  onTranscript: (entry: TranscriptEntry) => void;
  onCaseCreated: (c: EmergencyCase) => void;
  onDispatchRequested: (d: DispatchRequest) => void;
  onError: (error: string) => void;
  onAudioLevel?: (level: number) => void;
};

export type RealtimeSession = {
  stop: () => void;
  sendText: (text: string) => void;
  mute: (muted: boolean) => void;
};

export async function startRealtimeSession(
  callbacks: RealtimeCallbacks,
): Promise<RealtimeSession> {
  callbacks.onStateChange("connecting");

  // 1. Get ephemeral token
  let clientSecret: string;
  try {
    const tokenRes = await fetch("/api/realtime/session", { method: "POST" });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      throw new Error(tokenData.error ?? `Token request failed: ${tokenRes.status}`);
    }
    clientSecret = tokenData.client_secret?.value;
    if (!clientSecret) {
      throw new Error("No client_secret in session response");
    }
  } catch (err) {
    callbacks.onError(`Session init failed: ${err}`);
    callbacks.onStateChange("error");
    throw err;
  }

  // 2. Create RTCPeerConnection
  const pc = new RTCPeerConnection();

  // 3. Audio playback (agent's voice)
  const audio = new Audio();
  audio.autoplay = true;
  pc.ontrack = (event) => {
    audio.srcObject = event.streams[0];
  };

  // 4. Capture microphone
  let micStream: MediaStream;
  let micTrack: MediaStreamTrack;
  try {
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 24000,
      },
    });
    micTrack = micStream.getAudioTracks()[0];
    pc.addTrack(micTrack, micStream);
  } catch (err) {
    callbacks.onError(
      "Microphone access denied. Please allow microphone to use voice calling.",
    );
    callbacks.onStateChange("error");
    pc.close();
    throw err;
  }

  // 5. Audio level monitoring
  let audioCtx: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let levelInterval: ReturnType<typeof setInterval> | null = null;
  if (callbacks.onAudioLevel) {
    try {
      audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(micStream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      levelInterval = setInterval(() => {
        analyser!.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        callbacks.onAudioLevel!(avg / 255);
      }, 100);
    } catch {
      // Audio level monitoring is optional
    }
  }

  // 6. Data channel for events
  const dc = pc.createDataChannel("oai-events");

  dc.onopen = () => {
    callbacks.onStateChange("active");
    callbacks.onTranscript({
      role: "system",
      text: "📞 Call connected — speak in any Indian language",
      timestamp: Date.now(),
    });
  };

  dc.onclose = () => {
    callbacks.onStateChange("ended");
  };

  dc.onmessage = (event) => {
    try {
      const msg: RealtimeEvent = JSON.parse(event.data);
      handleRealtimeEvent(msg, dc, callbacks);
    } catch {
      // Ignore unparseable messages
    }
  };

  // 7. SDP handshake with OpenAI
  try {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // The beta endpoint (/v1/realtime) now answers "The Realtime Beta API is
    // no longer supported. Please use /v1/realtime/calls for the GA API."
    const sdpRes = await fetch(
      "https://api.openai.com/v1/realtime/calls?model=gpt-realtime",
      {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${clientSecret}`,
          "Content-Type": "application/sdp",
        },
      },
    );

    if (!sdpRes.ok) {
      // Carry the body through — a bare status turns every cause into the
      // same unactionable "handshake failed: 400".
      const detail = await sdpRes.text().catch(() => "");
      throw new Error(
        `SDP handshake failed: ${sdpRes.status} ${detail.slice(0, 200)}`
      );
    }

    const answerSdp = await sdpRes.text();
    await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
  } catch (err) {
    callbacks.onError(`WebRTC connection failed: ${err}`);
    callbacks.onStateChange("error");
    micTrack.stop();
    pc.close();
    throw err;
  }

  // Connection state monitoring
  pc.oniceconnectionstatechange = () => {
    if (
      pc.iceConnectionState === "disconnected" ||
      pc.iceConnectionState === "failed"
    ) {
      callbacks.onStateChange("ended");
      callbacks.onTranscript({
        role: "system",
        text: "📞 Call disconnected",
        timestamp: Date.now(),
      });
    }
  };

  // Return control handle
  return {
    stop: () => {
      if (levelInterval) clearInterval(levelInterval);
      if (audioCtx) audioCtx.close();
      micTrack.stop();
      dc.close();
      pc.close();
      audio.srcObject = null;
      callbacks.onStateChange("ended");
    },
    sendText: (text: string) => {
      if (dc.readyState === "open") {
        dc.send(
          JSON.stringify({
            type: "conversation.item.create",
            item: {
              type: "message",
              role: "user",
              content: [{ type: "input_text", text }],
            },
          }),
        );
        dc.send(JSON.stringify({ type: "response.create" }));
      }
    },
    mute: (muted: boolean) => {
      micTrack.enabled = !muted;
    },
  };
}

// ── Event handler ────────────────────────────────────────────

function handleRealtimeEvent(
  event: RealtimeEvent,
  dc: RTCDataChannel,
  callbacks: RealtimeCallbacks,
) {
  switch (event.type) {
    // Agent speaking (transcript of audio output)
    case "response.audio_transcript.done":
      callbacks.onTranscript({
        role: "agent",
        text: event.transcript ?? "",
        timestamp: Date.now(),
      });
      break;

    // Caller speaking (input audio transcription)
    case "conversation.item.input_audio_transcription.completed":
      callbacks.onTranscript({
        role: "caller",
        text: event.transcript ?? "",
        timestamp: Date.now(),
      });
      break;

    // Tool call completed — execute and return result
    case "response.function_call_arguments.done": {
      callbacks.onStateChange("tool_calling");
      const { name, call_id, arguments: argsStr } = event;
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(argsStr);
      } catch {
        // Use empty args
      }

      let result: Record<string, unknown>;

      if (name === "create_emergency_case") {
        const emergencyCase = args as unknown as EmergencyCase;
        callbacks.onCaseCreated(emergencyCase);
        result = {
          status: "CASE_CREATED",
          case_id: `CASE-${String(Math.floor(Math.random() * 9000) + 1000)}`,
          message: `Emergency case logged: ${emergencyCase.emergency_type} at ${emergencyCase.location}. Severity: ${emergencyCase.severity}.`,
        };
        callbacks.onTranscript({
          role: "system",
          text: `🚨 Case created: ${emergencyCase.emergency_type} — ${emergencyCase.severity} — ${emergencyCase.location}`,
          timestamp: Date.now(),
        });
      } else if (name === "dispatch_emergency_unit") {
        const dispatch = args as unknown as DispatchRequest;
        callbacks.onDispatchRequested(dispatch);
        result = {
          status: "DISPATCHED",
          message: `${dispatch.agency} unit dispatched to ${dispatch.location}. Priority: ${dispatch.priority}. ETA: 8-12 minutes.`,
        };
        callbacks.onTranscript({
          role: "system",
          text: `🚑 ${dispatch.agency} dispatched → ${dispatch.location} (${dispatch.priority})`,
          timestamp: Date.now(),
        });
      } else {
        result = { error: `Unknown tool: ${name}` };
      }

      // Send result back to the model
      if (dc.readyState === "open") {
        dc.send(
          JSON.stringify({
            type: "conversation.item.create",
            item: {
              type: "function_call_output",
              call_id,
              output: JSON.stringify(result),
            },
          }),
        );
        dc.send(JSON.stringify({ type: "response.create" }));
      }

      callbacks.onStateChange("active");
      break;
    }

    case "error":
      callbacks.onError(event.error?.message ?? "Realtime API error");
      break;
  }
}
