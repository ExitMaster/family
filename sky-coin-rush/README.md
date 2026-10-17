# Sky Coin Rush

A 3D flying game in **one HTML file** (three.js from a CDN, no build step). Take off from
the home airfield and fly anywhere you like over an endless open world, as high as
19,700 ft above the clouds, grabbing coins that float in the sky.

> <https://exitmaster.github.io/family/sky-coin-rush/>

## Controls

| | |
|---|---|
| Fly (left/right turns, up climbs, down dives; hold up to loop) | `↑` `↓` `←` `→` or `W` `S` `A` `D` |
| Boost | hold `SPACE`, `SHIFT` or the **BOOST** button |
| Auto-land at the nearest airport | `L` (or `Q`) or the **LAND** button |
| Pause | `ESC` or `P` |
| Phone / tablet | drag anywhere: a joystick appears where your finger lands |

**Pilot-style controls** (on the start and pause cards) flip up and down, like a real
control stick: push down to climb.

## Planes

Pick one on the start card (your choice is remembered). The plane flying behind the menu
changes straight away so you can see it. Each one has its own speed (normal and boost)
and handling (how fast it pitches, which also sets how quick a loop is, and how fast it
turns):

| Plane | | Cruise / boost | Handling |
|---|---|---|---|
| **Red Cub** | the all-rounder | 126 / 292 kt | medium |
| **Barnstormer** | yellow biplane | 107 / 233 kt | very loopy, turns fast |
| **Puffin** | seaplane on floats: **can land on and take off from any lake** | 117 / 253 kt | gentle |
| **Zippy** | stunt plane | 136 / 311 kt | fastest loops and turns |
| **Feather** | glider with very long wings, almost silent | 87 / 185 kt | gentle |
| **Hauler** | big cargo plane with two propellers | 117 / 243 kt | slow to turn |
| **Swift** | jet, afterburner flame when boosting | 185 / 428 kt | medium |
| **Thunder** | twin-tail fighter, two flames | 214 / 505 kt | quick |
| **Shadow** | black stealth flying wing | 194 / 467 kt | medium |
| **Jumbo** | four-engine airliner | 175 / 389 kt | slowest to turn |
| **Rocket** | space plane, three engines always glowing | 233 / 622 kt | gentle |
| **Saucer** | a UFO with a little green alien inside | 156 / 389 kt | very quick |

## Flying

- **Takeoff.** You start on the home airfield's runway. The plane speeds up by itself;
  when it says **Climb!** hold up to lift off.
- **Fly anywhere.** Left/right banks the plane into a turn; up/down pitches the nose to
  climb or dive. Let go and the nose slowly levels out.
- **Loops.** There's no limit on how far the nose can go: keep holding up and the plane
  flies right over the top, upside down, and round to level again (+200 for each full
  loop). The camera follows you round. Let go while upside down and the plane rolls back
  right way up by itself.
- **The world** never ends: rolling hills, lakes, forests and snowy mountain ranges in
  every direction, with clouds between about 1,200 and 4,300 ft. The sky darkens and the
  haze clears as you climb. The top is 19,700 ft (6,000 m); there's a call-out when you
  pass 10,000 ft. The sky also moves from morning to noon to golden hour to dusk as you
  fly.
- **HUD:** altitude (ft), airspeed (kt), compass heading (HDG, 000 = north) and the
  **nearest airport**: its name, distance and an arrow pointing to it.
- **Coins and orange rings** float in clusters all around you, some of them high in the
  sky. Coins are 10 points each; grab them less than about a second apart to build a
  chain (every 5 in a row adds one to the multiplier, up to x5). Rings give a 3-second
  boost and +50.
- **Crashing** into a hill or the water doesn't end anything: after a moment the plane is
  put back in the air 220 m above the spot.
- Pause and press **End flight** to go back to the start card, where the plane keeps
  cruising over the hills.

## Airports

The world has airports everywhere: one in most 5 km squares of an endless grid, each with
its own name (Pine Valley, Otter Bay, Snowcap…) and its runway pointing its own way. You
start at **Home Field**. The ground around each one is flattened into a meadow: an airport
on a lake becomes an island strip, and one on a mountain sits on a high plateau (up to
about 3,000 ft). Every airport has a tall light **beacon** beside its runway that the haze
doesn't hide: yellow at Home Field, teal everywhere else.

## Landing

- **Land anywhere on an airport's meadow**, not just the runway. Below 80 m over it the
  screen says "*Airport name* below". The first landing at a new airport gives
  "Welcome to *name*! +400"; landing again gives +100 (once per 5 seconds). With the
  **Puffin** seaplane you can also land on any lake ("Splashdown!") and take off from it
  again; any other plane that hits the water splashes.
- After touching down the brakes stop the plane by themselves; hold up to roll again and
  take off.
- **Auto-land:** tap **LAND** (or press `L`) and the plane picks the **nearest airport**,
  flies there (boosting when it's far away), lines up 1.6 km out with that airport's
  runway, follows a 6% glide path down and lands. The HUD shows where it's going.
  Steer yourself, or tap LAND again, to take back control.

## Saved in the browser

Your plane, the pilot-style control setting and sound on/off are kept in `localStorage`.
