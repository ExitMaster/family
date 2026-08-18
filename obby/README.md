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
| Save yourself | `G` while falling — **one per life**, and you have to be quick |
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
| 👦 **Normal** | Spinning bars, crumbling wood, ferries, spike patches, fireball runs |
| 😈 **Devil** | Lava pits, fireballs, twin spinners, thin pillars, blinking platforms — and **a devil at the gate who says WELCOME TO HELL** |
| 🧊 **Ice** | Wide, gentle courses and effectively no grip — let go and you coast about two platform lengths before stopping |
| 🚀 **Space** | Gravity at 0.62, so you hang in the air. Same jump height, but a much longer float |
| 💀 **Nightmare** | Blinking platforms, crossfire, everything else at once — and a bone-white gatekeeper. **It cannot be finished, on purpose** |

**Nightmare looks like a troll level, and that is deliberate.** Its portal hangs
**70 units up in the sky** and never moves. You reach the end, look up, and there it
is — visible, and apparently out of reach. `troll:true` puts the goal in the sky, in
`buildCourse`, and fires the taunts in `updateObby`.

#### The secret — do not sign-post this

**Standing on the last deck, the jetpack stops burning fuel.** That is the only way
anyone reaches the portal: buy the Aura Wings, walk to the end, and hold jump. See
`endlessFuel` in `stepPlayer` — it is on when `troll` is set and you are within 12 of
the goal's z.

Once you are climbing there, **steering is switched off** — you only go up. The climb
also eases you onto the portal's x/z. That is not decoration: without it you could
lift off from the back of the deck and rise straight past the portal forever with no
way to correct. Verified from all four corners of the deck, and while actively
holding a direction to fight it: every one of them reaches the portal.

Nothing in the game hints at it. The blurb still says nobody has finished it, the
gatekeeper still says nobody gets past him, and there is no marker in the sky. Keep
it that way.

Everywhere else the tank is the normal 2.8 seconds, so the level stays impossible for
anyone who has not bought the wings and thought to fly:

| | Highest reached | Wins |
|---|---|---|
| Wings, on the last deck | **66** | **yes** |
| Wings, at the start of Nightmare | 28.1 | no |
| Wings, any normal level | 28.1 | no |
| No wings, on the last deck | 2.9 | no |

If someone reports "the last level is broken" and has not bought the wings, this is
why.

**Inu is a name, not a dog.** He is the boy in the green cap you can buy in the shop.
His level id is still `inu` in the code so saved clear times survive the rename, but
the level is shown as **Normal Level**. If you ever see dog ears on him, that is a bug.

Each level unlocks the one after it, in the order above. Clearing one for the first
time pays a **+25 aura bonus**.

Ice and Space sit after Devil on purpose: they are the odd ones rather than the
hardest, and Nightmare has to stay last because it can never be cleared — anything
placed after it would be locked forever.

### 🆘 The one save

Slip off an edge and you have **one** emergency recovery: press `G` while falling and
you get a hard boost upward, plus your double jump back. It is spent until you die or
touch a new checkpoint, and the 🆘 indicator under the orb counter dims once it is
gone. There is a touch button for it too.

The catch is the timing. The boost buys back a fixed amount of height, so it only
rescues you if you hit it almost immediately:

| Press `G` after | Fell from | Peaked at | Rescued |
|---|---|---|---|
| 0.05s | 8 | **14.1** | yes, back above the ledge |
| 0.5s | 8 | **10.9** | yes |
| 1.5s | 8 | 1.2 | no — spent for nothing |

That window is the point. A save you can use at any moment is a safety net that makes
falling meaningless; a save you have to react to is a skill.

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
    },
    "obbySaves": {
      "$who": {
        ".read": "auth != null",
        ".write": "auth != null",
        ".validate": "$who.matches(/^[a-z0-9_-]{1,12}$/) && newData.hasChildren(['orbs'])"
      }
    }
  }
}
```

`exitmaster.github.io` must also be an authorised domain and anonymous sign-in must
be on — both already done for `jump/`. Until the rule is published, writes are
refused and the game quietly shows the device board instead.

### 🛍️ Aura Shop

💠 Aura orbs are saved forever, in every mode. **One orb is worth 30 aura**
(`ORB_VALUE`). The counter on the HUD still shows orbs *found* — "9 / 21" — while the
shop counts aura.

**Powers** are bought once and stay on for good — no equipping:

| | | |
|---|---|---|
| ⏫ **Double Jump** | 150 | A second jump in mid-air, back when you land |
| 👟 **Speed Boots** | 200 | Run 35% faster everywhere. Jumps carry further too |
| 🪽 **Aura Wings** | 500 | A jetpack — **but only inside Nightmare**. Dead weight in every other level |

**The wings only work in the Nightmare Level.** `canFly` in `stepPlayer` requires
`W.troll`; anywhere else, holding jump in mid-air does nothing at all. The fuel gauge
is hidden outside that level too — a gauge where the wings are inert would be a
puzzle with no answer.

That restriction is the design, not a limitation. Flight skips straight over any
course, so letting it work everywhere would quietly delete every level in the game.
Confined to one level it stops being a cheat and becomes a key.

Inside Nightmare it is a real jetpack: **9 a second upward**, **1.5× running speed
forward**, sharper air steering, on a **2.8 second tank** that refills when you land.
The wings flare white under thrust.

The shop description is deliberately vague — *"They only stir in one place, and it is
not down here."* It explains why nothing happens in a normal level without giving
away where it does.

| | Rise above the deck | Wins |
|---|---|---|
| Wings, on Nightmare's last deck | **64.8** | **yes** |
| Wings, elsewhere in Nightmare | 26.9 | no |
| Wings, in Angel / Devil / Space | **1.7** — just a jump | no |
| No wings, on the last deck | 1.7 | no |

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
| Normal | 70s | 3 |
| Devil | 80s | 2 |
| Ice | 56s | 6 |

Difficulty is set per level by `d` (0 to 1) plus the chunk pool and the chunk count.
**`d` must not go above 1** — the chunk geometry is only verified to there, and past it
the zigzag's diagonal hop stops fitting inside the jump arc. To make a level harder
beyond that, lengthen it or put nastier chunks in its pool instead.

Killer Snail is checked the same way — a bot that only runs away survives ~93s
before it gets cornered, a bot that stands still is stabbed to death in ~25s, and
a bot that fights back clears 4 waves in a minute without losing a heart. Sitting
in the safehouse for 10 seconds costs 0 hearts and drains the shield to 9%.

## Saving

Progress lives in this browser under `localStorage['obby3d-save-v1']` — aura,
skins, cleared levels, best times, best depth. Clearing site data resets it.

### Nicknames

Put a nickname in from the menu (👤 NICKNAME) and the same progress is also kept
under that name, in two places:

| where | key | what it is for |
|---|---|---|
| this browser | `localStorage['obby3d-profiles-v1']` | more than one person on one tablet |
| Firebase | `obbySaves/<nickname>` | picking your game up on another computer |

Three decisions hold this together, and none of them should be undone casually:

**Merging never subtracts.** `mergeSave(a, b)` takes the better of every field —
max aura, union of skins and powers, union of cleared levels, *fastest* level times
but *biggest* depth and survival (`bestIsTime`). So a stale copy can only ever hand
you more than you walked in with, and two computers playing the same nickname
converge instead of clobbering each other. Do not "simplify" this to last-write-wins.

**A nickname is only claimed when you commit it** — the button, Enter, or leaving
the box. `profileKey` holds the committed one and is deliberately *not* recomputed
from the input box on every keystroke; otherwise typing `inu` would leave saves
called `i` and `in` behind.

**A new nickname claims what you are playing.** Type a name that has no save
anywhere and it adopts your current progress — which is what you want the first
time. A name that *does* have a save loads it instead, replacing what is on screen.

Sound and music settings stay on the device — they are settings for the machine
you are sitting at, not things you earned, so `snapshot()` leaves them out.

A nickname is a name, not a password: anyone who types yours gets that progress.
Fine for a family. If that ever stops being fine, the fix is a short code appended
to the key, not encryption.

Until a grown-up publishes the `obbySaves` rule above, the cloud half quietly fails
and nicknames still work on the device they were made on.
