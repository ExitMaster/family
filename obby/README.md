# ✨ Aura Obby 3D

A 3D obstacle course in **one HTML file**. No engine, no build step, no server —
the 3D is drawn with raw WebGL written from scratch, so you just open it and play.

> <https://exitmaster.github.io/family/obby/>

## Controls

| | |
|---|---|
| Move | `W A S D` or arrow keys (relative to the camera) |
| Jump | `SPACE` — **hold longer to jump higher** |
| Double jump | `SPACE` again in mid-air — **buy it in the Aura Shop first**, then one per jump, refilled on landing |
| Turn the camera | drag the screen, or `Q` / `E` |
| Back to checkpoint | `R` |
| Pause | `ESC` or `P` |
| Fullscreen | `F` or the ⛶ button — real fullscreen, so the address bar goes too |
| Music / sound | 🎵 and 🔊 buttons, top right. They work **while you are playing** |
| Phone / tablet | joystick bottom-left, JUMP bottom-right, drag to look around |
| **Killer Snail only** | `Z` throw salt · `K` swing · `T` teleport to the safehouse |

The camera swings behind you on its own while you run, so most of the time you
never have to touch it.

## The four things you can play

### 🧗 Obby Mode

Six courses. Reach the glowing portal at the end. Checkpoints land every two
sections, so dying sends you back a little, not to the start.

| Level | What is in it |
|---|---|
| 😇 **Angel** | Clouds, easy gaps, bounce pads, moving platforms. The longest gentle course — 18 sections, about 350 units |
| 👦 **Normal** | Spinning bars, crumbling wood, ferries, spike patches |
| 😈 **Devil** | Lava pits, fireballs, twin spinners, thin pillars — and **a devil at the gate who says WELCOME TO HELL** |
| 🧊 **Ice** | Wide, gentle courses and effectively no grip — let go and you coast about two platform lengths before stopping |
| 🚀 **Space** | Gravity at 0.62, so you hang in the air. Same jump height, but a much longer float |
| 💀 **Nightmare** | Blinking platforms, crossfire, everything else at once — and a bone-white gatekeeper. **It cannot be finished, on purpose** |

**Nightmare is a troll level and that is deliberate, not a bug.** Get within 15 units
of the portal and it runs away at 1.06× your top speed, drifting up and out over the
void, then taunts you. `troll:true` on the level turns this on; the code is in
`updateObby`. If someone reports "the last level is broken", this is why.

**Inu is a name, not a dog.** He is the boy in the green cap you can buy in the shop.
His level id is still `inu` in the code so saved clear times survive the rename, but
the level is shown as **Normal Level**. If you ever see dog ears on him, that is a bug.

Each level unlocks the one after it, in the order above. Clearing one for the first
time pays a **+25 aura bonus**.

Ice and Space sit after Devil on purpose: they are the odd ones rather than the
hardest, and Nightmare has to stay last because it can never be cleared — anything
placed after it would be locked forever.

### 🐌 Killer Snail (not an obby)

An open garden, a safehouse, four soldiers — and a giant snail with a **knife**
that flies straight at you **through walls, platforms and everything else**. It
moves at the **same speed the whole game** (slower than you run), so you can always
get away. What kills you is standing still, getting cornered, or being greedy.

**You have 3 ❤️ hearts, and so does it — sort of: the snail has a health bar.**
When it gets close it raises the knife, waits half a second, then stabs. That
wind-up is your window to move.

| | |
|---|---|
| `Z` | Throw **salt** — 11 damage, aims itself at the snail. Costs ammo. |
| `K` | **Swing** — 24 damage and a big knock-back, but you have to be right next to the knife. |
| `T` | **Teleport** straight into the safehouse. 16 second cooldown. |
| 🧂 | Salt shakers around the garden give **+10 salt** and come back after 10s. |

**The safehouse** has a glowing shield the snail cannot pass. It only holds for
about **11 seconds** before the battery runs out, and it recharges while you are
outside — so it is somewhere to catch your breath, not somewhere to hide.

**The soldiers** patrol the yard and shoot the snail on sight, so leading it past
them does your damage for you. The snail keeps trying to knife them. **The soldiers
cannot be killed. The snail has not worked this out yet**, and says so.

Kill the snail and a **tougher one spawns** — wave 2, wave 3, and on. Each kill is
worth **+12 aura**. Survive **60 seconds** to unlock the **Snail King** skin.

### ♾️ Infinity Challenge

An endless tower going **down**. Every floor has one hole in it — find it and drop
through. A ceiling of spikes follows you down and gets faster the deeper you go,
so you can never stop and rest.

Your **depth in metres** is the score, and your best depth is saved.

### 🏆 Leaderboard

Top 5 per board, kept **on this device** under `localStorage['obby3d-scores-v1']`.
Every entry carries a name, so a tablet the family shares becomes one shared
scoreboard — type your name into "Playing as" before you play.

Seven boards: fastest clear for each of the five finishable levels, plus longest
survival and most snails beaten in Killer Snail, and deepest in Infinity. Nightmare
has no board, because nobody can finish it.

Finish a run and the result screen tells you where you landed — "🥇 1st on this
device". Your own rows show in gold on the board.

**🌍 Online** shows everyone from every device; **📱 This device** shows only what was
set here. The device list keeps working with no internet, so the game never waits on
the network — if the cloud cannot be reached the screen says so and falls back.

Online scores keep **one row per player per board**: submitting only overwrites your
own row, and only when the new score is better. So the list is one line per person
with their best, and it cannot grow without limit.

#### Turning the online board on (a grown-up does this once)

It uses the same **Unimai Game Hub** Firebase project as `jump/` and `bunny/`, and
needs one rule added. Firebase console → Realtime Database → 규칙, keeping whatever
is already there:

```json
{
  "rules": {
    "rooms": {
      "$room": {
        ".read": "auth != null",
        ".write": "auth != null",
        ".validate": "$room.matches(/^[A-Z0-9]{3,6}$/)"
      }
    },
    "banks": {
      "$who": {
        ".read": "auth != null",
        ".write": "auth != null",
        ".validate": "$who.matches(/^[a-z0-9_-]{1,14}$/)"
      }
    },
    "obbyScores": {
      "$board": {
        ".read": "auth != null",
        ".write": "auth != null",
        "$who": {
          ".validate": "newData.hasChildren(['n','v']) && newData.child('v').isNumber() && newData.child('n').isString() && newData.child('n').val().length <= 12"
        }
      }
    }
  }
}
```

`exitmaster.github.io` must also be an authorised domain and anonymous sign-in must
be on — both already done for `jump/`. Until the rule is published, writes are
refused and the game quietly shows the device board instead.

### 🛍️ Aura Shop

💠 Aura orbs are saved forever, in every mode.

**Powers** are bought once and stay on for good — no equipping:

| | | |
|---|---|---|
| ⏫ **Double Jump** | 150 | A second jump in mid-air, back when you land |
| 👟 **Speed Boots** | 200 | Run 35% faster everywhere. Jumps carry further too |
| 🪽 **Aura Wings** | 5000 | Hold jump on the way down and you glide instead of falling |

Wings only ever slow a **fall** — they cannot push you upward, so it is a glide and
never flight. Falling drops you ~22 units a second; gliding is 2.6. The wings are
drawn on your character and spread wide while you are actually gliding, so you can
see the thing you paid for.

`runMax()` is the one place top speed is decided, so anything that has to stay ahead
of the player reads it too — the Nightmare portal retreats at `runMax() * 1.06`, and
still cannot be caught while wearing the boots.

**Skins** are cosmetic:
Angel (40), Inu (90), Ghost (120), Devil (160), Rainbow (320). Snail King is not
for sale — you have to earn it in Killer Snail.

### Don't start a camera drag on top of a control

Dragging anywhere on the stage turns the camera, and it calls `setPointerCapture` so
the drag survives leaving the element. That capture also eats the `click` on anything
underneath — which is why the ⛶ / 🔊 / 🎵 buttons were dead the entire time you were
playing. The `pointerdown` handler now bails out on `e.target.closest('button')` and
on the touch-control ids. Any new control needs to be a `<button>` or be added to
that list.

## Music

Every level has its own song, and there are no audio files — the notes are
oscillators driven by a small step sequencer (`SONGS` / `Music` in the source), so
the game is still one HTML file you can email to someone.

| Where | Sounds like |
|---|---|
| Menu | slow and quiet |
| 😇 Angel | dreamy, major, 92 bpm |
| 👦 Normal | bouncy hero music, 126 bpm |
| 🧊 Ice | glassy and bright, 104 bpm |
| 🚀 Space | slow and weightless, 78 bpm |
| 😈 Devil | dark minor sawtooth, 148 bpm |
| 🐌 Killer Snail | tense and stabby, 116 bpm |
| ♾️ Infinity | everything walking downwards, 88 bpm |

Songs are `lead1` / `bass` arrays of MIDI note numbers, 16 steps to the bar, `0` for
a rest. To write a new one, add an entry to `SONGS` and point a theme at it.

## How it works inside

Everything is in `index.html`.

* **Renderer** — hand-written WebGL. One shader, three meshes (cube, pyramid,
  sphere), directional light + fog. Static level geometry is baked into a single
  vertex buffer and drawn in one call; only moving things get their own draw call.
* **Physics** — axis-aligned boxes, resolved one axis at a time. Coyote time and
  jump buffering are in, so jumps feel forgiving. Landing with no direction held
  zeroes your horizontal speed on the spot: friction alone takes about 0.15s to
  stop you, which is a whole platform-width of slide and walks you off narrow
  ledges. The camera walks the same boxes and pulls in when a wall would otherwise
  end up between it and you.
* **Spikes** are the one hazard whose hit box is *not* what you see. They are drawn
  as pyramids that taper to a point, so a box the size of the patch kills you while
  you are still clearly above the tips. `spikeBox()` keeps the drawn size but carries
  a smaller `chx/chy/chz` box — inset at the sides, and only as tall as the fat lower
  half of each spike — and `hitHazards()` tests that one instead.
* **Levels** — built from *chunks* (`CHUNKS` in the source). Every chunk starts
  and ends on a platform at the same height, so any two chunks can be joined and
  the course is always connected. A level is a fixed random seed picking chunks
  from its pool, which is why the same level is the same every time you play it.

### If you change the physics numbers, re-check the levels

The chunks are tuned around these constants:

```
GRAV 26   JUMP_V 9.6   RUN 7.2   ->  jump is 1.77 high, 0.74s long, ~5.3 far
AIR_JUMPS 1   DBL_JUMP 0.85      ->  with the second jump, roughly 3.0 high and 9 far
```

The chunks were all tuned around the **single** jump, so the double jump is pure
slack: every gap becomes clearable with room to spare. That is why it costs 150 aura
in the shop instead of being free — the levels play at their designed difficulty
until you choose to buy your way out of it.

Two levels bend these numbers per level, set on the level and read in `stepPlayer`:

| Field | Level | What it does |
|---|---|---|
| `slip: 1` | Ice | Ground friction × `ICE_FRIC` (0.038) and acceleration × `ICE_ACC` (0.55), and landing no longer stops you. From a full run that is about **11 units of coasting**, or two platform lengths. Steering still works — braking does not |
| `gravity: 0.62` | Space | Jumps reach ~2.9 up and ~8.6 along instead of 1.77 and 5.3 |

Ice deliberately has no beams, thin pillars or spinners in its pool — being knocked
about when you cannot brake is annoying, not fun. Space drops the pillars, blinkers
and crossfire for the same reason: they punish exactly the floaty landing the level
is built around.

Checkpoints land every **2 chunks** in every level (`checkEvery` overrides per level).

Every gap in every chunk is inside that arc on purpose. If you change `GRAV`,
`JUMP_V` or `RUN`, gaps that used to be fair can become impossible — so re-run the
checks below afterwards.

Watch the **diagonal** ones especially. A zigzag hop costs
`sqrt(gap² + (2 × sideways offset)²)`, not just the gap — that is how the hardest
zigzag once ended up needing 5.4 units of a 5.3 unit jump.

## When something breaks

Same idea as `jump/`: you cannot open a browser console on a tablet, so the game
shows you instead.

**The red bar.** Any uncaught error or failed promise puts a red bar across the top
of the page with the message and line number. Tap it to hide it. The same fault
repeating every frame is only shown three times, so it cannot bury the game.

**The game loop cannot be killed.** `frame()` wraps its work in a try/catch. Without
that, one throw ends `requestAnimationFrame` and the game just freezes with no
explanation. Now it reports and keeps running.

**Debug overlay.** `F3` or backtick, or the **🐞 Debug info** button on the pause
screen (that one matters on a tablet, where there is no F3). Bottom-left corner:

```
fps 60   step 8.3ms
mode obby / ice   screen play
world course  solids 41  hazards 0  parts 0
slip 1   gravity 1
pos  0.00 0.80 3.00
vel  0.00 0.00 0.00   speed 0.00
ground yes   airJumps 0/0   coyote 0.11
stand plat   yaw  0.00
cam yaw  3.14  pitch  0.38  dist 9.5
z 3.0 / 281.2   orbs 0/15   deaths 0
aura 0   skin kid   powers -
```

It grows per mode: snail shows the snail's hp, distance, wave, your hearts, ammo and
shield; infinity shows depth, crusher gap and layer count. If any error has happened
this session, the last one is pinned to the bottom of the panel in red.

So a bug report can be "it says `ERRORS 1: ...`" or a photo of the overlay, instead
of "it broke".

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
| Angel | 50s | 0 |
| Normal | 70s | 5 |
| Devil | 54s | 0 |
| Ice | 56s | 6 |

Killer Snail is checked the same way — a bot that only runs away survives ~93s
before it gets cornered, a bot that stands still is stabbed to death in ~25s, and
a bot that fights back clears 4 waves in a minute without losing a heart. Sitting
in the safehouse for 10 seconds costs 0 hearts and drains the shield to 9%.

## Saving

Progress lives in this browser under `localStorage['obby3d-save-v1']` — aura,
skins, cleared levels, best times, best depth. Clearing site data resets it.
