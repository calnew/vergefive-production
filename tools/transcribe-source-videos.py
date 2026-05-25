from pathlib import Path
from faster_whisper import WhisperModel

root = Path(__file__).resolve().parents[1]
source_dir = root / "tools" / "source-videos"
out_dir = root / "tools" / "source-transcripts"
out_dir.mkdir(parents=True, exist_ok=True)

model = WhisperModel("base.en", device="cpu", compute_type="int8")

for video in sorted(source_dir.glob("*.mp4")):
    out = out_dir / f"{video.stem}.clean.txt"
    if out.exists() and out.stat().st_size > 50:
        print(f"skip {video.name}")
        continue
    segments, info = model.transcribe(
        str(video),
        language="en",
        beam_size=5,
        vad_filter=True,
        word_timestamps=False,
    )
    text = " ".join(segment.text.strip() for segment in segments if segment.text.strip())
    out.write_text(text.strip() + "\n", encoding="utf-8")
    print(f"{video.name}: {len(text)} chars")
