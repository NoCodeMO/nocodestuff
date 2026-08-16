"""Turn an approved light-checker concept into an equal-cell alpha sprite sheet."""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

from PIL import Image


def is_background(pixel: tuple[int, int, int]) -> bool:
    darkest = min(pixel)
    return darkest >= 225 and max(pixel) - darkest <= 18


def extract_edge_background(image: Image.Image) -> Image.Image:
    rgb = image.convert("RGB")
    width, height = rgb.size
    pixels = rgb.load()
    exterior = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def seed(x: int, y: int) -> None:
        index = y * width + x
        if not exterior[index] and is_background(pixels[x, y]):
            exterior[index] = 1
            queue.append((x, y))

    for x in range(width):
        seed(x, 0)
        seed(x, height - 1)
    for y in range(height):
        seed(0, y)
        seed(width - 1, y)

    while queue:
        x, y = queue.popleft()
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < width and 0 <= ny < height:
                seed(nx, ny)

    rgba = rgb.convert("RGBA")
    output = rgba.load()
    for y in range(height):
        row = y * width
        for x in range(width):
            if exterior[row + x]:
                output[x, y] = (0, 0, 0, 0)

    # Remove only a one-pixel neutral checker fringe. Applying the relaxed
    # threshold as a flood fill would eat connected gray clothing details.
    alpha = rgba.getchannel("A")
    alpha_pixels = alpha.load()
    fringe: list[tuple[int, int]] = []
    for y in range(1, height - 1):
        for x in range(1, width - 1):
            if not alpha_pixels[x, y]:
                continue
            pixel = pixels[x, y]
            neutral_light = min(pixel) >= 160 and max(pixel) - min(pixel) <= 25
            touches_alpha = any(
                not alpha_pixels[nx, ny]
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1))
            )
            if neutral_light and touches_alpha:
                fringe.append((x, y))
    for x, y in fringe:
        output[x, y] = (0, 0, 0, 0)
    return rgba


def occupied_x_groups(image: Image.Image, minimum_gap: int = 8) -> list[tuple[int, int]]:
    alpha = image.getchannel("A")
    occupied = []
    for x in range(image.width):
        column = alpha.crop((x, 0, x + 1, image.height))
        occupied.append(column.getbbox() is not None)

    groups: list[tuple[int, int]] = []
    start: int | None = None
    gap = 0
    for x, has_pixels in enumerate(occupied):
        if has_pixels:
            if start is None:
                start = x
            gap = 0
        elif start is not None:
            gap += 1
            if gap >= minimum_gap:
                groups.append((start, x - gap + 1))
                start = None
                gap = 0
    if start is not None:
        groups.append((start, image.width))
    return groups


def normalize_frames(image: Image.Image, frames: int, cell_width: int, canvas_height: int, baseline: int) -> Image.Image:
    groups = occupied_x_groups(image)
    if len(groups) != frames:
        raise ValueError(f"expected {frames} separated frames, found {len(groups)}: {groups}")

    sheet = Image.new("RGBA", (frames * cell_width, canvas_height), (0, 0, 0, 0))
    for index, (left, right) in enumerate(groups):
        region = image.crop((left, 0, right, image.height))
        bbox = region.getbbox()
        if bbox is None:
            raise ValueError(f"frame {index + 1} is empty")
        sprite = region.crop(bbox)
        if sprite.width > cell_width - 20 or sprite.height > baseline - 10:
            raise ValueError(f"frame {index + 1} does not fit the normalized cell: {sprite.size}")
        x = index * cell_width + (cell_width - sprite.width) // 2
        y = baseline - sprite.height
        sheet.alpha_composite(sprite, (x, y))
    return sheet


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--frames", type=int, default=3)
    parser.add_argument("--cell-width", type=int, default=600)
    parser.add_argument("--height", type=int, default=760)
    parser.add_argument("--baseline", type=int, default=735)
    args = parser.parse_args()

    source = Image.open(args.input)
    transparent = extract_edge_background(source)
    sheet = normalize_frames(transparent, args.frames, args.cell_width, args.height, args.baseline)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(args.output, optimize=True)
    print(f"prepared {args.output}: {sheet.width}x{sheet.height}, {args.frames} equal alpha frames")


if __name__ == "__main__":
    main()
