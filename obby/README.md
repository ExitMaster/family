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

Every level is **twice as long as it used to be** — the chunk counts were doubled, so
Angel is 36 sections and Devil is 38. Saved best times from before that change are
not comparable with times set now; they were set on courses half the size.

| Level | Sections | Length | Orbs |
|---|---|---|---|
| Angel | 36 | 744 | 42 |
| Normal | 30 | 775 | 42 |
| Devil | 38 | 915 | 54 |
| Ice | 26 | 473 | 29 |
| Space | 28 | 680 | 37 |
| Nightmare | 54 | 1771 | 67 |

| Level | What is in it |
|---|---|
| 😇 **Angel** | Clouds, easy gaps, bounce pads, moving platforms. The gentle one — 36 sections, about 744 units |
| 👦 **Normal** | Spinning bars, crumbling wood, ferries, spike patches, fireball runs |
| 😈 **Devil** | Lava pits, fireballs, twin spinners, thin pillars, blinking platforms — and **a devil at the gate who says WELCOME TO HELL** |
| 🧊 **Ice** | Wide, gentle courses and effectively no grip — let go and you coast about two platform lengths before stopping |
| 🚀 **Space** | Gravity at 0.62, so you hang in the air. Same jump height, but a much longer float |
| 💀 **Nightmare** | **Every obstacle in the game, shuffled into one level**, with the floor going slippery or low-gravity under you as you cross — and a bone-white gatekeeper. **It cannot be finished, on purpose** |

#### Nightmare is everything, shuffled

It is not a course of its own. `LEVELS.nightmare` carries a `shuffle` spec instead of
a `chunks` count:

```js
shuffle: { from:['angel','inu','devil','ice','space','nightmare'], n:27, song:'nightmare' }
```

`buildCourse` rolls **54 sections of one chunk each**, and every one of them picks a
course at random. Not six blocks in order — properly mixed, so a run of the 1313 seed
goes ice, ice, devil, nightmare, space, nightmare, ice, devil, angel, devil… About
**1771 units**, more than twice any other level, and around five minutes of running.

A chunk brings **everything** from the course it came from: its obstacles, its
difficulty, its colours (the builder reads `W.pal` as it goes, so each chunk bakes
its own) and its physics. `W.zones` records the z range of each one and `updateZone`
hands the right `slip` and `gravity` to `stepPlayer` as you cross, so the floor
really does go slippery for four chunks of that run and the gravity really does drop
for five others.

Three rules keep it from turning into a mess:

**A chunk is always paired with its own level's floor.** That is what keeps it fair
rather than random — the ice pool has no beams, thin ledges or spinners in it, and
the space pool has no blinkers or crossfire, precisely because those combinations are
miserable. Rolling the course and then taking its chunk *and* its physics together
means those pairings can never come up by accident.

**A deck goes wherever the floor changes, and only there.** A wide flat platform with
a checkpoint on it: landing a jump into gravity you could not have planned for is not
a fair death. Where two chunks in a row share a floor there is no deck — only the
colours change and you run straight on. That run of 27 needs 12 decks.

**The banner fires on floor changes, not chunk changes** (`floorName` in
`updateZone`), and the song is fixed for the whole level by `shuffle.song`. Colours
change every few seconds in here; a sign and a new song every few seconds would be
noise, but walking onto ice without being told is a cheap death.

An ordinary level is simply a shuffle of one section that never rolls, so it runs the
same code and behaves exactly as it always did.

**Nightmare looks like a troll level, and that is deliberate.** Its portal hangs
**70 units up in the sky** and never moves. You reach the end, look up, and there it
is — visible, and apparently out of reach. `troll:true` puts the goal in the sky, in
`buildCourse`, and fires the taunts in `updateObby`.

#### The secret — do not sign-post this

**On the last deck, under the portal, the tank stops draining.** That is the only way
anyone reaches the portal: buy the Aura Wings, walk all 54 chunks, and hold jump at
the end. See `atEnd` in `stepPlayer` — it is on when `troll` is set and you are within
12 of the goal's z.

Everywhere else in the level one tankful tops out at **27.8** against a portal at
**70**, so that deck is the only place it can be done.

On that climb **you still fly it — you are not carried.** Your steering works the
whole way up; the portal simply reels your x/z in harder than you can push away from
it, so you always arrive. That pull is not decoration: without it you could lift off
from the back of the deck and rise straight past the portal forever with no way to
correct. Verified from five spots across the deck while actively holding a direction
to fight it — all five reach the portal, all five win.

Nothing in the game hints at it. The blurb still says nobody has finished it, the
gatekeeper still says nobody gets past him, and there is no marker in the sky. Keep
it that way.

Outside Nightmare holding jump does nothing at all, so the level stays impossible for
anyone who has not bought the wings, walked all 54 chunks, and thought to fly:

| | Rise above the deck | Wins |
|---|---|---|
| Wings, on the last deck | **64.8** | **yes** |
| Wings, anywhere else in Nightmare | 27.8 at most, swept across the whole course | no |
| Wings, in Angel / Devil / Ice / Space | 1.8 — just a jump, and no glide either | no |
| No wings, on the last deck | 1.7 | no |

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

### 🔀 Dying shuffles the course

`shuffleObstacles`, called from `afterDeath`, re-rolls the moving parts every time you
die, in every level. The run you just failed is not the run you are about to try.

**The floor never changes.** Platforms, gaps, spikes and lava stay exactly where they
were — your checkpoint has to keep meaning what it meant, and geometry that rearranged
itself would be unlearnable rather than exciting. What changes is everything that
moves: where each ferry sits on its path and which way it travels, which way the
spinners turn, which way the fireballs fly, and the beat the blinkers are on.

Only **ahead of your respawn** (changing what is behind you is work nobody sees) and
only **some** of it — a 45% roll per obstacle, because a course where everything
changed every time would be noise rather than a shuffle.

**The one rule that must not be broken:** every blinking platform shifts by the *same*
amount. Their phases relative to each other are the whole reason a `blinkRun` is
crossable (see the timing table further down); re-rolling them one at a time would
quietly rebuild the impossible version of that chunk. The test asserts this directly —
`blinkRelativeSame` compares every consecutive phase gap before and after a shuffle.

Verified: geometry and static hazards byte-identical after a shuffle, movers, blinkers,
spinners and fireballs all moved, relative blink phases unchanged, and the bot still
runs a course to 99% after eight shuffles in a row.

### x_x The wrong key kills you

While you are **playing**, every key that is not a control kills you on the spot.
No warning shot, no grace period. `GAME_KEYS` in the input section is the whole
allow-list, and `wrongKey` does the rest — banner naming the key you pressed, then
straight into `killPlayer`. In an obby that costs you the run back to the checkpoint;
in Killer Snail and Infinity it ends the run.

**If you bind a new control, add its code to `GAME_KEYS` in the same edit.** Miss it
and the key you just added will kill whoever presses it.

Three deliberate exemptions:

| | Why |
|---|---|
| Anything with **Ctrl / Cmd / Alt held** | Refreshing the page should refresh the page, not kill you halfway through the combination. Devtools still open |
| Any screen that is **not `play`** | Menus, the pause screen and the nickname box. Typing your name must not be fatal |
| Key **repeats** | Holding a key down is one press, not fifty deaths |

Everything else is fair game, including **Shift** and **Tab** — those two are the
most likely accidental deaths, and that is the joke. Tab is also `preventDefault`ed
so focus cannot escape the game on the way out.

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

**The wings only work inside the Nightmare Level.** `canFly` in `stepPlayer` requires
`W.troll`; in every other level holding jump in mid-air does nothing at all, and there
is no glide there either. The fuel gauge is hidden outside that level too — a gauge
sitting in a level where the wings are inert is a puzzle with no answer.

That restriction is the design, not a limitation. Flight skips straight over any
course, so letting it work everywhere would quietly delete every level in the game.
Confined to one level it stops being a cheat and becomes a key.

Inside Nightmare it is a real jetpack: **9 a second upward**, **1.5× running speed
forward** (measured: 10.8 against a 7.2 run), sharper air steering, on a **2.8 second
tank** that refills when you land. Run the tank dry and holding jump becomes a
**glide** — you sink at 2.6 a second instead of 34, so a 38-unit drop takes 12 seconds
instead of under 2. The wings flare white under thrust.

The shop description is deliberately vague — *"They only stir in one place, and it is
not down here."* It explains why nothing happens in a normal level without giving
away where it does.

| | Rise above the deck | Wins |
|---|---|---|
| Wings, on Nightmare's last deck | **64.8** | **yes** |
| Wings, elsewhere in Nightmare | 27.8 | no |
| Wings, in Angel / Devil / Ice / Space | **1.8** — just a jump, no glide | no |
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

Watch the **timed** ones too, in the same way. `ch_blinkRun` is four blinking slabs
4.5 apart over lava, and at full speed you cross one every **0.64s**. Its phase step
decides everything:

| Phase step | Effect | Crossings out of 36 start times |
|---|---|---|
| `+0.9` per slab | the lit window travels backwards past you | **0** — impossible from every phase, walking or waiting |
| `-0.3` per slab | the window drifts with you, 0.34s of slack lost per slab | **9** — a real 0.9s window to enter on |

It shipped at `+0.9` for a long time and nobody noticed, because the jetpack used to
fly over it and the bot was assumed to be at fault. Once the jetpack was locked to
the very end of Nightmare, that chunk became something you had to actually cross, and
it turned out not to be crossable. **A timing chunk needs its window measured, not eyeballed.**

## The game stays in English

A browser set to translate everything — which is the normal setting on a Korean
phone — will happily rewrite the page. That is worse than it sounds: **SPACE** turns
into **우주** (outer space), **Aura** into **아우라** or **기운** depending on the
sentence, and the controls table stops matching the keyboard. The canvas HUD is
drawn, not text, so half the game would translate and half would not.

Four markers, and browsers want different ones:

| | Where | Read by |
|---|---|---|
| `lang="en"` | `<html>` | everyone — says what language this actually is |
| `translate="no"` | `<html>`, `<body>`, `<title>` | Chrome, Edge, Safari |
| `class="notranslate"` | `<body>` | the older Google Translate widget |
| `<meta name="google" content="notranslate">` | `<head>` | stops the "translate this page?" bar being offered |

Verified in a `ko-KR` browser: `document.documentElement.translate` is `false` and the
help table still reads **Move**. What that does *not* prove is Chrome's own translate
button — that cannot be driven headlessly, so it is the markers that are checked here,
not the outcome. If someone forces a translation by hand it may still go through.

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

| Level | Time | Deaths | Finished |
|---|---|---|---|
| Angel | 102s | 0 | yes, 99% |
| Normal | 129s | 3 | yes, 99% |
| Devil | 169s | 7 | yes, 99% |
| Ice | — | 7 | no — stalls around z 180 |
| Space | — | 5 | no — stalls around z 170 |
| Nightmare, all 54 chunks, no powers | 289s | 2 | walked 100% of 1771 |

Ice and Space are the two the bot has never finished, and both stall at the same
**absolute** distance they always did — doubling the length did not move the wall, it
only made the percentage look worse. Both stalls are the bot mistiming a hop onto a
moving platform.

That last row is the one to re-run after touching the shuffle, the chunk pools or the
physics. It walks the whole 1771 units on foot — through every floor change — and
reaching 100% of `endZ` is the proof that the level can still be crossed at all. It
does not *win*: the portal is 70 up, which is the point.

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
