# Title film

A 1:49 motion-graphics film built from `docs/VIDEO_SCRIPT.md`, compositing real
screenshots of the app into the graphics. 1280x720, silent, no narration baked in.

```bash
cd film
python3 -m http.server 8145 &
node render.mjs        # writes ./out/*.webm
```

Playwright records webm. For MP4, Playwright's bundled ffmpeg is a stripped build
with VP8 only, so use a full one:

```bash
pip install imageio-ffmpeg
FF=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")
"$FF" -i out/*.webm -c:v libx264 -preset slow -crf 19 \
      -pix_fmt yuv420p -movflags +faststart nikaas-film.mp4
```

The same conversion works for `test/record-demo.mjs` output.

`film.html` is the composition — twelve scenes, timing in the `TL` array at the
bottom, in seconds. `assets/` holds cropped app captures.

**This is not the hackathon demo video.** The rules ask for a self-recorded video,
and minute one has to show the working product, because that is how the organisers
confirm the entrant built it. Use this as a title sequence or a reference for
pacing, and record the demo yourself — `test/record-demo.mjs` captures the live app
for that.
