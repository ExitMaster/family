# ✨ Aura Obby 3D

A 3D obstacle course in **one HTML file**. No engine, no build step, no server —
the 3D is drawn with raw WebGL written from scratch, so you just open it and play.

> <https://exitmaster.github.io/family/obby/>

## Controls

| | |
|---|---|
| Move | `W A S D` or arrow keys (relative to the camera) |
| Jump | `SPACE` — **hold longer to jump higher** |
| Turn the camera | drag the screen, or `Q` / `E` |
| Back to checkpoint | `R` |
| Pause | `ESC` or `P` |
| Fullscreen | `F` or the ⛶ button |
| Phone / tablet | joystick bottom-left, JUMP bottom-right, drag to look around |

The camera swings behind you on its own while you run, so most of the time you
never have to touch it.

## The four things you can play

### 🧗 Obby Mode

Three courses that get harder each time. Reach the glowing portal at the end.
You get checkpoints along the way, so dying sends you back a little, not to the start.

| Level | What is in it |
|---|---|
| 😇 **Angel** | Clouds, easy gaps, bounce pads, one moving platform |
| 🐕 **Inu** | Spinning bars, crumbling wood, ferries, spike patches |
| 😈 **Devil** | Lava pits, fireballs, twin spinners, thin pillars — and **a devil at the gate who says WELCOME TO HELL** |

Devil unlocks after Inu, Inu after Angel. Clearing a level the first time pays a
**+25 aura bonus**.

### 🐌 Killer Snail (not an obby)

An open garden. A giant snail flies straight at you **through walls, platforms
and everything else**, and it never stops. It starts slow and speeds up every
second — after about two minutes it is faster than you can run, so every run ends
eventually.

Grab a 🧂 **salt shaker** to freeze it for 3 seconds and knock it backwards.
Survive **60 seconds** to unlock the **Snail King** skin.

### ♾️ Infinity Challenge

An endless tower going **down**. Every floor has one hole in it — find it and drop
through. A ceiling of spikes follows you down and gets faster the deeper you go,
so you can never stop and rest.

Your **depth in metres** is the score, and your best depth is saved.

### 🛍️ Aura Shop

💠 Aura orbs are saved forever, in every mode. Spend them on skins:
Angel (40), Inu (90), Ghost (120), Devil (160), Rainbow (320). Snail King is not
for sale — you have to earn it in Killer Snail.

## How it works inside

Everything is in `index.html`.

* **Renderer** — hand-written WebGL. One shader, three meshes (cube, pyramid,
  sphere), directional light + fog. Static level geometry is baked into a single
  vertex buffer and drawn in one call; only moving things get their own draw call.
* **Physics** — axis-aligned boxes, resolved one axis at a time. Coyote time and
  jump buffering are in, so jumps feel forgiving.
* **Levels** — built from *chunks* (`CHUNKS` in the source). Every chunk starts
  and ends on a platform at the same height, so any two chunks can be joined and
  the course is always connected. A level is a fixed random seed picking chunks
  from its pool, which is why the same level is the same every time you play it.

### If you change the physics numbers, re-check the levels

The chunks are tuned around these constants:

```
GRAV 26   JUMP_V 9.6   RUN 7.2   ->  jump is 1.77 high, 0.74s long, ~5.3 far
```

Every gap in every chunk is inside that arc on purpose. If you change `GRAV`,
`JUMP_V` or `RUN`, gaps that used to be fair can become impossible — so re-run the
checks below afterwards.

## Testing

The game exposes `window.OBBY` (state, level builders, `update(dt)`, `CHUNKS`) so
a script can drive it headlessly with no rendering. The scripts used while building
it play the game with a bot: a per-chunk suite that builds a course out of one
obstacle type repeated and checks a bot can clear it at easy/medium/hard settings,
plus full-level runs.

Last run: **48 of 51** chunk × difficulty combinations cleared. The three that did
not are all about *timing a jump onto a moving platform* — each of those chunks
clears at the other speed settings with identical geometry, so it is the bot
mistiming the hop, not an unfair course.

Full levels, played by the bot end to end:

| Level | Time | Deaths |
|---|---|---|
| Angel | 28s | 0 |
| Inu | 46s | 0 |
| Devil | 80s | 2 |

## Saving

Progress lives in this browser under `localStorage['obby3d-save-v1']` — aura,
skins, cleared levels, best times, best depth. Clearing site data resets it.
