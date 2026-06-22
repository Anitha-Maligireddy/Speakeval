import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";

export type RecordingResult = { base64: string; mimeType: string; durationSeconds: number };

export function Recorder({ onComplete, maxSeconds = 120 }: { onComplete: (r: RecordingResult) => void; maxSeconds?: number }) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [processing, setProcessing] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRef.current?.stream.getTracks().forEach((t) => t.stop());
  }, []);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const mr = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      mr.onstop = async () => {
        setProcessing(true);
        const blob = new Blob(chunksRef.current, { type: mime });
        const buf = await blob.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let bin = "";
        for (let i = 0; i < bytes.length; i += 0x8000) {
          bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
        }
        const base64 = btoa(bin);
        stream.getTracks().forEach((t) => t.stop());
        onComplete({ base64, mimeType: mime, durationSeconds: elapsed });
        setProcessing(false);
      };
      mediaRef.current = mr;
      mr.start();
      setRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed((s) => {
          if (s + 1 >= maxSeconds) {
            stop();
            return s + 1;
          }
          return s + 1;
        });
      }, 1000);
    } catch (e) {
      console.error(e);
      alert("Microphone access denied or unavailable.");
    }
  }

  function stop() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRef.current && mediaRef.current.state !== "inactive") mediaRef.current.stop();
    setRecording(false);
  }

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className={`size-28 rounded-full grid place-items-center ${recording ? "bg-destructive/10 animate-pulse" : "bg-gradient-primary shadow-glow"}`}>
        <Mic className={`size-12 ${recording ? "text-destructive" : "text-primary-foreground"}`} />
      </div>
      <div className="text-3xl font-mono tabular-nums">
        {String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}
      </div>
      {!recording ? (
        <Button size="lg" onClick={start} disabled={processing} className="gap-2">
          {processing ? <Loader2 className="size-4 animate-spin" /> : <Mic className="size-4" />}
          {processing ? "Processing..." : "Start recording"}
        </Button>
      ) : (
        <Button size="lg" variant="destructive" onClick={stop} className="gap-2">
          <Square className="size-4" /> Stop ({maxSeconds - elapsed}s left)
        </Button>
      )}
    </div>
  );
}