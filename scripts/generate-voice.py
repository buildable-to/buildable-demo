"""Generate voiceover audio for each scene using Edge TTS."""
import asyncio
import edge_tts
import os

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
        "text": "After winning a contract, engineers spend twenty out of twenty-five project days just producing shop drawings. Connection details, fabrication plans, section views, rebar schedules. It's the biggest bottleneck in precast construction.",
    },
    {
        "name": "design-studio",
        "text": "With Buildable, you simply describe what you need. A beam detail, a column section, a foundation plan. The AI writes the drawing script, executes it, and renders the result in seconds. This is a real rectangular beam detail, complete with elevation view, cross-sections, rebar layout, stirrup spacing, and dimensions. Every layer follows standard CAD conventions, ready for production.",
    },
    {
        "name": "modeling-studio",
        "text": "Need a three-D model for estimation? Describe the structure, and Buildable generates it using FreeCAD. Here's a real precast beam with forty-two stirrups and five longitudinal rebars. Watch as we toggle between normal view, x-ray mode to see through the concrete, and rebar-only view for reinforcement inspection. From concept to model, in minutes.",
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

    print("\nAll voice files generated in", OUTPUT_DIR)
    print("Files:", os.listdir(OUTPUT_DIR))


if __name__ == "__main__":
    asyncio.run(generate())
