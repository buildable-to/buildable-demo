"""Generate voiceover audio for each scene using Edge TTS."""
import asyncio
import edge_tts
import os
import json

# Professional male voice — good for product demos
VOICE = "en-US-GuyNeural"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "voice")

# Script for each scene — timed to match the video
SCENES = [
    {
        "name": "intro",
        "text": "Introducing Buildable. AI-powered design for precast concrete.",
    },
    {
        "name": "problem",
        "text": "After winning a contract, engineers spend twenty out of twenty-five project days just producing shop drawings. Connection details, fabrication plans, section views. It's the biggest bottleneck in precast construction.",
    },
    {
        "name": "design-studio",
        "text": "With Buildable, you simply describe what you need. A column cross-section, a beam detail, a wall panel. The AI writes the drawing script, runs it, and renders the result in seconds. Every layer follows standard CAD conventions.",
    },
    {
        "name": "modeling-studio",
        "text": "Need a three-D model for estimation? Describe the structure, and Buildable generates it using FreeCAD. Toggle x-ray mode to inspect rebar placement. From concept to model, in minutes.",
    },
    {
        "name": "outro",
        "text": "Buildable. From description to drawing. In minutes, not weeks.",
    },
]


async def generate():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    for scene in SCENES:
        output_path = os.path.join(OUTPUT_DIR, f"{scene['name']}.mp3")
        print(f"Generating: {scene['name']}...")

        communicate = edge_tts.Communicate(scene["text"], VOICE, rate="-5%")
        await communicate.save(output_path)
        print(f"  -> {output_path}")

    # Also generate a manifest for Remotion to know durations
    print("\nAll voice files generated in", OUTPUT_DIR)
    print("Files:", os.listdir(OUTPUT_DIR))


if __name__ == "__main__":
    asyncio.run(generate())
