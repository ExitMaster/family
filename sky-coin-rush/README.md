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
| Auto-land at home | `L` (or `Q`) or the **LAND** button |
| Pause | `ESC` or `P` |
| Phone / tablet | drag anywhere: a joystick appears where your finger lands |

**Pilot-style controls** (on the start and pause cards) flip up and down, like a real
control stick: push down to climb.

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
- **HUD:** altitude (ft), airspeed (kt), compass heading (HDG, 000 = north) and **HOME**:
  the distance to the airfield with an arrow pointing to it.
- **Coins and orange rings** float in clusters all around you, some of them high in the
  sky. Coins are 10 points each; grab them less than about a second apart to build a
  chain (every 5 in a row adds one to the multiplier, up to x5). Rings give a 3-second
  boost and +50.
- **Crashing** into a hill or the water doesn't end anything: after a moment the plane is
  put back in the air 220 m above the spot.
- Pause and press **End flight** to go back to the start card, where the plane keeps
  cruising over the hills.

## Landing

- **Land anywhere on the airfield** (+100, once per 5 seconds). The whole flat meadow
  around the runway counts, not just the runway. A tall yellow **beacon** beside the
  runway shows where it is from far away, and below 80 m over the airfield the screen
  says "Airfield below".
- After touching down the brakes stop the plane by themselves; hold up to roll again and
  take off.
- **Auto-land:** tap **LAND** (or press `L`) and the plane flies itself home (boosting
  when it's far away), lines up 1.6 km out, follows a 6% glide path down and lands.
  Steer yourself, or tap LAND again, to take back control.

## Saved in the browser

The pilot-style control setting and sound on/off are kept in `localStorage`.
