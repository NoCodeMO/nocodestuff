"""Normalize a supplied transparent enemy portrait for runtime use."""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

from PIL import Image


def largest_component(alpha: Image.Image) -> Image.Image:
    """Keep the connected portrait and discard low-alpha export debris."""
    width, height = alpha.size
    pixels = alpha.load()
    visited = bytearray(width * height)
    largest: list[tuple[int, int]] = []
    for y in range(height):
        for x in range(width):
            offset = y * width + x
            if visited[offset] or not pixels[x, y]:
                continue
            visited[offset] = 1
            queue = deque([(x, y)])
            component: list[tuple[int, int]] = []
            while queue:
                current_x, current_y = queue.popleft()
                component.append((current_x, current_y))
                for next_x, next_y in (
                    (current_x - 1, current_y),
                    (current_x + 1, current_y),
                    (current_x, current_y - 1),
                    (current_x, current_y + 1),
                ):
                    if not (0 <= next_x < width and 0 <= next_y < height):
                        continue
                    next_offset = next_y * width + next_x
                    if visited[next_offset] or not pixels[next_x, next_y]:
                        continue
                    visited[next_offset] = 1
                    queue.append((next_x, next_y))
            if len(component) > len(largest):
                largest = component
    clean = Image.new("L", alpha.size, 0)
    clean_pixels = clean.load()
    for x, y in largest:
        clean_pixels[x, y] = 255
    return clean


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--height", type=int, default=720)
    parser.add_argument("--padding", type=int, default=24)
    parser.add_argument("--alpha-threshold", type=int, default=24)
    args = parser.parse_args()

    image = Image.open(args.input).convert("RGBA")
    alpha = image.getchannel("A").point(
        lambda value: 0 if value < args.alpha_threshold else 255
    )
    alpha = largest_component(alpha)
    image.putalpha(alpha)
    bounds = alpha.getbbox()
    if bounds is None:
        raise ValueError("enemy portrait contains no visible pixels")

    sprite = image.crop(bounds)
    target_height = max(1, args.height)
    target_width = max(1, round(sprite.width * target_height / sprite.height))
    sprite = sprite.resize((target_width, target_height), Image.Resampling.NEAREST)
    padding = max(0, args.padding)
    canvas = Image.new(
        "RGBA",
        (target_width + padding * 2, target_height + padding * 2),
        (0, 0, 0, 0),
    )
    canvas.alpha_composite(sprite, (padding, padding))
    canvas_alpha = canvas.getchannel("A")
    canvas = Image.composite(
        canvas,
        Image.new("RGBA", canvas.size, (0, 0, 0, 0)),
        canvas_alpha,
    )
    canvas.putalpha(canvas_alpha)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(args.output, "WEBP", lossless=True, method=6, exact=True)
    print(
        f"prepared {args.output}: {canvas.width}x{canvas.height}, "
        f"alpha threshold {args.alpha_threshold}"
    )


if __name__ == "__main__":
    main()
