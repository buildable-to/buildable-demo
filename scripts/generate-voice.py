"""Generate voiceover audio for each scene using ElevenLabs."""
import os
from elevenlabs import ElevenLabs

API_KEY = "sk_80037ef5e6189c52f61a8a2d7c0d51d4dfb44ffda6e33d8f"
VOICE_ID = "TX3LPaxmHKxFdv7VOQHJ"  # Liam — Energetic, Confident
MODEL = "eleven_multilingual_v2"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "voice")

SCENES = [
    {
        "name": "win-the-project",
        "text": (
            "Part one. Win the project. "
            "A client sends you a brief. Five-story residential building, "
            "precast sandwich wall panels, hollow core slabs, ground floor commercial space. "
            "You type the description into Buildable. Hit generate. "
            "In seconds, a full three-D model appears. "
            "Every panel, every slab, columns at the ground floor, stairwell cores. "
            "Color-coded by element type. "
            "A cost panel slides in — structural elements, materials, labor, transport, installation. "
            "Pricing calculated using your company's actual material and labor rates. "
            "Change the floor height from three meters to three point two. "
            "The model updates. The cost updates. New total, instantly. "
            "What took your estimator two days of manual takeoff now takes two minutes. "
            "And it's accurate enough for a client presentation. "
            "You won the project. Now let's engineer it."
        ),
    },
    {
        "name": "engineer-the-project",
        "text": (
            "Part two. Engineer the project. "
            "Same three-D model, but now we zoom in. "
            "Click on any element — the engineer selects beam B-01. "
            "The shop drawing opens. Outline, dimensions, mark number. "
            "AI-generated and ready for review. "
            "Now the engineer adds detail. "
            "Toggle x-ray mode to verify rebar placement inside the concrete. "
            "Switch to rebar-only view for reinforcement inspection. "
            "Then open the full shop drawing. "
            "Elevation view, cross-sections, stirrup spacing, full dimensioning. "
            "Change a parameter in the properties panel — spacing from two hundred to one fifty. "
            "The drawing updates instantly. More stirrups appear, annotations update. "
            "Ninety-six panels detailed. Thirty-four required corrections. "
            "Sixty-two approved as generated. "
            "Average engineer time per panel — four minutes. "
            "Compare that to the manual baseline — forty-five minutes per panel. "
            "Every correction makes the AI smarter. "
            "Today, sixty-five percent auto-approved. Next month, eighty. Next year, ninety-five."
        ),
    },
    {
        "name": "run-the-business",
        "text": (
            "Part three. Run the business. "
            "The CEO opens Buildable Intelligence. "
            "How much concrete do we need for all active projects this quarter? "
            "A table appears — Tbilisi Residential, Rustavi Warehouse, Batumi Hotel. "
            "Total across all projects: eighteen hundred ninety-five cubic meters. "
            "Bulk ordering at this volume qualifies for the eight percent volume discount. "
            "Compare cost estimates versus actual costs on completed projects. "
            "A chart shows five past projects. One exceeded estimate by fifteen percent. "
            "Primary driver — rebar weight was underestimated due to additional seismic reinforcement. "
            "The AI recommends updating default seismic rebar ratios in your cost model. "
            "Which engineer is most productive this month? "
            "Nika — a hundred twenty-seven panels, three point eight minutes average, seventy-two percent auto-approve. "
            "Can we take on the Zugdidi school project? We quoted forty-five days. "
            "Based on current capacity, your team averages thirty-eight panels per day. "
            "Realistic completion — May second. Thirteen days of buffer. Recommendation — accept the project. "
            "Every project, every panel, every correction — all connected. "
            "Your AI analyst doesn't forget, doesn't guess, and gets smarter every quarter."
        ),
    },
    {
        "name": "final-card",
        "text": (
            "Buildable. "
            "Win the project. Engineer it. Understand your business. "
            "One platform."
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
