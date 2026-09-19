"""Build Thai narration assets for the opening and all 100 stages.

Install with: python -m pip install --target .tools edge-tts
Then run with the bundled Python. The game itself needs no TTS dependency.
"""
import asyncio
import json
import os
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / ".tools"))
import edge_tts

NODE = os.environ.get("WORD_QUEST_NODE", "node")
STORIES_JS = """import {OPENING_STORY,missionStory} from './dist/stories.js';
import {PETS} from './dist/pets.js';
console.log(JSON.stringify([{id:'opening',text:OPENING_STORY.th},
...Array.from({length:100},(_,i)=>({id:String(i+1).padStart(3,'0'),
text:missionStory(i+1,PETS[Math.min(99,i+1)].name).th}))]));"""
stories = json.loads(subprocess.check_output(
    [NODE, "--input-type=module", "-e", STORIES_JS], cwd=ROOT, text=True, encoding="utf-8"
))
if only := os.environ.get("WORD_QUEST_ONLY"):
    stories = [story for story in stories if story["id"] == only]
out_dir = ROOT / "dist" / "assets" / "story-th"
out_dir.mkdir(parents=True, exist_ok=True)

async def make_one(story, semaphore):
    path = out_dir / f"{story['id']}.mp3"
    if path.exists() and path.stat().st_size > 2000:
        return
    async with semaphore:
        for attempt in range(12):
            try:
                await edge_tts.Communicate(
                    story["text"], "th-TH-PremwadeeNeural", rate="-8%"
                ).save(str(path))
                if path.stat().st_size <= 2000:
                    raise RuntimeError(f"Audio too small: {path}")
                print(f"Generated {path.name}: {path.stat().st_size} bytes", flush=True)
                await asyncio.sleep(1)
                return
            except Exception as error:
                print(f"Retry {story['id']} ({attempt + 1}/12): {error}", flush=True)
                path.unlink(missing_ok=True)
                if attempt == 11:
                    raise
                await asyncio.sleep(min(30, 2 ** attempt))

async def main():
    semaphore = asyncio.Semaphore(1)
    await asyncio.gather(*(make_one(story, semaphore) for story in stories))
    print(f"Ready: {len(stories)} Thai narration files", flush=True)

asyncio.run(main())
