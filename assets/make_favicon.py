# -*- coding: utf-8 -*-
"""favicon_origin.png(이미 투명 배경) -> 정사각 크롭 -> 파비콘 세트 생성."""
import os
from PIL import Image

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(BASE)
SRC = os.path.join(BASE, "favicon_origin.png")

img = Image.open(SRC).convert("RGBA")
print(f"원본: {img.size}, mode=RGBA (투명 배경 유지)")

# 1) 불투명 콘텐츠 bbox로 크롭 (여백 제거)
bbox = img.getbbox()
cropped = img.crop(bbox)
cw, ch = cropped.size

# 2) 정사각 캔버스 중앙 배치 (여백 10%)
side = int(max(cw, ch) * 1.20)
canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
canvas.paste(cropped, ((side - cw) // 2, (side - ch) // 2), cropped)
print(f"콘텐츠 bbox: {cw}x{ch} -> 정사각 캔버스: {side}x{side}")

# 3) 산출물 저장
canvas.save(os.path.join(BASE, "favicon.png"))  # 풀 해상도 투명 마스터

def save(size, name):
    canvas.resize((size, size), Image.LANCZOS).save(os.path.join(BASE, name))

save(32, "favicon-32.png")
save(16, "favicon-16.png")
save(180, "apple-touch-icon.png")
save(192, "icon-192.png")
save(512, "icon-512.png")

# favicon.ico (멀티사이즈) - 루트에 배치
canvas.resize((256, 256), Image.LANCZOS).save(
    os.path.join(ROOT, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48), (64, 64)]
)

print("생성 완료: assets/favicon.png, favicon-32/16.png, apple-touch-icon.png, icon-192/512.png + favicon.ico(루트)")
