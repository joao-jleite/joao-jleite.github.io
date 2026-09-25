"""Converte a midia bruta de ../assets em WebP/MP4 otimizados para o site.

Uso: python tools/build_media.py  (rodar na raiz do repo)
- Imagens: WebP em 2 larguras (thumb + full), sem metadados.
- Videos: H.264 re-encodado (faststart, sem audio, sem metadados) + poster WebP + GIF leve de fallback.
A Demo A so e processada se a pasta de origem tiver demo.mp4/demo.gif + PNGs.
"""
import subprocess
import sys
from pathlib import Path

from PIL import Image
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT.parent / "assets"
OUT_IMG = ROOT / "assets" / "img"
OUT_MEDIA = ROOT / "assets" / "media"
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

# (origem, nome publico, larguras) - nomes publicos neutros
IMAGES = [
    ("rdo/rdo-1.png", "rdo-mobile", (800, 1600)),
    ("rdo/rdo-2.png", "rdo-dashboard", (800, 1600)),
    ("rdo/rdo-3.png", "rdo-activities", (800, 1600)),
    ("rdo/rdo-4.png", "rdo-pdf-report", (800, 1600)),
    ("dermatech/dermatech-desktop-home-hero-en.png", "dermatech-home-en", (720, 1440)),
    ("dermatech/dermatech-desktop-equipment-lineup-en.png", "dermatech-lineup-en", (720, 1440)),
    ("dermatech/dermatech-desktop-light-spectra.png", "dermatech-spectra", (720, 1440)),
    ("dermatech/dermatech-mobile-home.png", "dermatech-mobile-home", (390, 780)),
    ("dermatech/dermatech-mobile-contact-form.png", "dermatech-mobile-form", (390, 780)),
    ("demo-b/screenshot-1-headed-crawl.png", "demo-b-crawl", (640, 1280)),
    ("demo-b/screenshot-2-pdf-report.png", "demo-b-report", (800, 1600)),
    ("demo-b/screenshot-3-xlsx-preview.png", "demo-b-xlsx", (800, 1600)),
    ("demo-a/screenshot-1-photo-validation.png", "demo-a-validation", (800, 1600)),
    ("demo-a/screenshot-2-purchase-order.png", "demo-a-order", (800, 1600)),
    ("demo-a/screenshot-3-xlsx-items.png", "demo-a-xlsx", (800, 1600)),
]


def webp(src: Path, dst: Path, width: int, quality: int = 80) -> None:
    with Image.open(src) as im:
        im = im.convert("RGB")  # descarta alpha/perfis/EXIF
        if im.width > width:
            h = round(im.height * width / im.width)
            im = im.resize((width, h), Image.LANCZOS)
        im.save(dst, "WEBP", quality=quality, method=6)
        print(f"  {dst.name}: {im.size}, {dst.stat().st_size // 1024} KB")


def ff(*args: str) -> None:
    r = subprocess.run([FFMPEG, "-loglevel", "error", "-y", *args], capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(r.stderr)


def video(demo: str) -> None:
    src_dir = SRC / f"demo-{demo}"
    mp4 = src_dir / "demo.mp4"
    if not mp4.exists():
        print(f"  demo-{demo}: sem demo.mp4, pulando")
        return
    out = OUT_MEDIA / f"demo-{demo}.mp4"
    # 1280 px, CRF 30: legivel a 2x em cards de ~640 px; faststart p/ comecar a tocar antes do fim do download
    ff("-i", str(mp4), "-an", "-map_metadata", "-1", "-vf", "scale=1280:-2",
       "-c:v", "libx264", "-preset", "slow", "-crf", "30", "-pix_fmt", "yuv420p",
       "-movflags", "+faststart", str(out))
    print(f"  {out.name}: {out.stat().st_size // 1024} KB")
    # poster: quadro aos 60% do video
    tmp = OUT_MEDIA / f"_poster-{demo}.png"
    dur = probe_duration(mp4)
    ff("-ss", f"{dur * 0.6:.2f}", "-i", str(mp4), "-frames:v", "1", str(tmp))
    webp(tmp, OUT_MEDIA / f"demo-{demo}-poster.webp", 1280, 78)
    tmp.unlink()
    # GIF leve so para navegadores sem <video>
    gif = OUT_MEDIA / f"demo-{demo}.gif"
    ff("-i", str(mp4), "-vf",
       "fps=6,scale=560:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer:bayer_scale=4",
       str(gif))
    print(f"  {gif.name}: {gif.stat().st_size // 1024} KB")


def probe_duration(path: Path) -> float:
    r = subprocess.run([FFMPEG, "-i", str(path)], capture_output=True, text=True)
    for line in r.stderr.splitlines():
        if "Duration:" in line:
            h, m, s = line.split("Duration:")[1].split(",")[0].strip().split(":")
            return int(h) * 3600 + int(m) * 60 + float(s)
    return 5.0


def main() -> int:
    OUT_IMG.mkdir(parents=True, exist_ok=True)
    OUT_MEDIA.mkdir(parents=True, exist_ok=True)
    for rel, name, widths in IMAGES:
        src = SRC / rel
        if not src.exists():
            print(f"  (faltando) {rel}")
            continue
        small, full = widths
        webp(src, OUT_IMG / f"{name}-{small}.webp", small)
        webp(src, OUT_IMG / f"{name}-{full}.webp", full, 82)
    for d in ("a", "b"):
        video(d)
    return 0


if __name__ == "__main__":
    sys.exit(main())
