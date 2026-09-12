#!/usr/bin/env bash
# Side-by-side composite: Telegram capture (left) + operator console (right).
#
#   ./scripts/combine-sbs.sh <telegram-recording> [dashboard.mp4] [out.mp4]
#
# Both sources are letterboxed into equal 960x1080 halves, so a portrait phone
# capture and a landscape desktop capture sit together without either being
# stretched. Audio is taken from the dashboard track (the narration); pass
# DASH_AUDIO=0 to keep the Telegram track instead.
set -euo pipefail

LEFT="${1:?usage: combine-sbs.sh <telegram-recording> [dashboard.mp4] [out.mp4]}"
RIGHT="${2:-sankatmochan-dashboard.mp4}"
OUT="${3:-sankatmochan-sidebyside.mp4}"

[ -f "$LEFT" ]  || { echo "not found: $LEFT"; exit 1; }
[ -f "$RIGHT" ] || { echo "not found: $RIGHT"; exit 1; }

dur() { ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$1" | cut -d. -f1; }
echo "left  : $LEFT ($(dur "$LEFT")s)"
echo "right : $RIGHT ($(dur "$RIGHT")s)"

# Which audio track survives. The narration usually carries more than the
# ambient noise of a screen recording.
if [ "${DASH_AUDIO:-1}" = "1" ]; then AMAP="1:a?"; else AMAP="0:a?"; fi

ffmpeg -y \
  -i "$LEFT" -i "$RIGHT" \
  -filter_complex "\
    [0:v]scale=960:1080:force_original_aspect_ratio=decrease,\
pad=960:1080:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1[l];\
    [1:v]scale=960:1080:force_original_aspect_ratio=decrease,\
pad=960:1080:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1[r];\
    [l][r]hstack=inputs=2[v]" \
  -map "[v]" -map "$AMAP" \
  -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p \
  -c:a aac -b:a 192k \
  -shortest \
  "$OUT"

echo "→ $OUT"
ffprobe -v quiet -show_entries format=duration,size -of default=nw=1 "$OUT"
