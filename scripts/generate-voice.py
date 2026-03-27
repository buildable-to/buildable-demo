"""Generate voiceover audio for each scene using ElevenLabs."""
import os
from elevenlabs import ElevenLabs

API_KEY = "sk_80037ef5e6189c52f61a8a2d7c0d51d4dfb44ffda6e33d8f"
VOICE_ID = "TX3LPaxmHKxFdv7VOQHJ"  # Liam — Energetic, Confident
MODEL = "eleven_multilingual_v2"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "voice")

SCENES = [
    {
        "name": "intro",
        "text": (
            "Two months of drawings. "
            "Fifteen days of construction. "
            "That's the reality of precast concrete today."
        ),
    },
    {
        "name": "problem",
        "text": (
            "Engineers spend eighty percent of their time drafting. "
            "The same templates. The same beam sections. The same rebar schedules. "
            "Just different numbers, every single time. "
            "One drawing error costs ten thousand dollars in rework. "
            "One parameter change takes hours to propagate across every sheet. "
            "And seventy-five percent of precast companies are still doing this in AutoCAD. Manually."
        ),
    },
    {
        "name": "design-studio",
        "text": (
            "Buildable changes that. "
            "Describe your element in plain language. Dimensions, rebar, concrete class. "
            "And get a complete, production-ready drawing in seconds. "
            "This is a real beam detail. Elevation view, cross-sections, "
            "rebar layout, stirrup spacing, and full dimensioning. "
            "All following standard CAD layer conventions. Ready for the shop floor. "
            "Change one parameter, and everything regenerates instantly. "
            "No manual updates. No offshore coordination. No three-day revision cycles."
        ),
    },
    {
        "name": "modeling-studio",
        "text": (
            "For detailed engineering, describe an element and inspect it from any angle. "
            "Toggle x-ray mode to see through the concrete and verify rebar placement. "
            "Switch to rebar-only view for reinforcement inspection. "
            "Every element, fully reproducible."
        ),
    },
    {
        "name": "warehouse",
        "text": (
            "Before committing to a project, management needs a quick three-D model "
            "for cost estimation and client presentations. "
            "Describe the structure — dimensions, bays, element types — "
            "and get a complete building model with over a hundred sixty precast elements. "
            "Columns, beams, purlins, roof panels, wall panels, foundations. "
            "All in minutes, ready to share with your client."
        ),
    },
    {
        "name": "outro",
        "text": (
            "A hundred and fifty billion dollar industry. "
            "Eighty percent of project time on repetitive drawings. "
            "Buildable. Accelerate precast engineering. "
            "Reduce project timelines, two to three times."
        ),
    },
]


def generate():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    client = ElevenLabs(api_key=API_KEY)

    for scene in SCENES:
        output_path = os.path.join(OUTPUT_DIR, f"{scene['name']}.mp3")
        print(f"Generating: {scene['name']}...")

        audio = client.text_to_speech.convert(
            voice_id=VOICE_ID,
            text=scene["text"],
            model_id=MODEL,
            output_format="mp3_44100_128",
        )

        with open(output_path, "wb") as f:
            for chunk in audio:
                f.write(chunk)

        print(f"  -> {output_path}")

    print("\nDone!")


if __name__ == "__main__":
    generate()
