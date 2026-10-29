#!/usr/bin/env bash
# Прави кадрите за фона при скрол от видео.  Употреба: scripts/make-frames.sh видео.mp4
# Изисква ffmpeg. След промяна на броя кадри обнови SETS.count в src/components/ScrollScene.tsx
# (брой кадри = (общо кадри във видеото / стъпка) закръглено нагоре; виж с: ls public/scene/d | wc -l)
set -euo pipefail
IN="${1:?дай видео файл}"
rm -rf public/scene && mkdir -p public/scene/d public/scene/m
ffmpeg -v error -y -i "$IN" -vf "select='not(mod(n\,3))',scale=720:1280:flags=lanczos" -fps_mode vfr -c:v libwebp -quality 72 -start_number 0 public/scene/d/f%03d.webp
ffmpeg -v error -y -i "$IN" -vf "select='not(mod(n\,4))',scale=480:854:flags=lanczos" -fps_mode vfr -c:v libwebp -quality 68 -start_number 0 public/scene/m/f%03d.webp
echo "десктоп: $(ls public/scene/d | wc -l) кадъра, мобилен: $(ls public/scene/m | wc -l) кадъра"
