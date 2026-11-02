r"""Prepara el clip de inicio entregado por el cliente (848 x 480).

Uso: .venv\Scripts\python.exe scripts/prepare_hero_video.py "ruta/al/video.mp4"
Requiere imageio-ffmpeg en el entorno local, no en el sitio publicado.
"""

import argparse
from pathlib import Path
import subprocess

import imageio_ffmpeg


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    args = parser.parse_args()
    source = args.source.resolve(strict=True)
    assets = Path(__file__).resolve().parents[1] / "assets"
    video = assets / "inicio-avion.mp4"
    poster = assets / "inicio-avion-poster.webp"
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()

    # Zona de la marca de agua de este clip. No recorta el avión ni la pista.
    subprocess.run([
        ffmpeg, "-hide_banner", "-y", "-i", str(source),
        "-map", "0:v:0", "-an", "-map_metadata", "-1", "-map_chapters", "-1",
        "-vf", "delogo=x=740:y=441:w=104:h=34:show=0",
        "-c:v", "libx264", "-preset", "medium", "-crf", "21",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(video),
    ], check=True)
    subprocess.run([
        ffmpeg, "-hide_banner", "-y", "-ss", "0.8", "-i", str(video),
        "-frames:v", "1", "-c:v", "libwebp", "-quality", "85", str(poster),
    ], check=True)
    subprocess.run([
        ffmpeg, "-hide_banner", "-y", "-sseof", "-0.04", "-i", str(video),
        "-frames:v", "1", "-c:v", "libwebp", "-quality", "92",
        str(assets / "inicio-avion-final.webp"),
    ], check=True)
    print(f"Video: {video}\nPortada: {poster}")


if __name__ == "__main__":
    main()
