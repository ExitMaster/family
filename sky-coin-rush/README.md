# Sky Coin Rush

A 3D flying game in **one HTML file** (three.js from a CDN, no build step), the plane
version of Coin Rush. Fly a little red plane down an endless river canyon, grab coins,
dodge rocks and balloons, and land on airstrips to refuel.

> <https://exitmaster.github.io/family/sky-coin-rush/>

## Controls

| | |
|---|---|
| Steer (up / down / left / right) | `↑` `↓` `←` `→` or `W` `S` `A` `D` |
| Autopilot | `Q` or the **AP** button |
| Pause | `ESC` or `P` |
| Phone / tablet | drag anywhere: a joystick appears where your finger lands |

**Pilot-style controls** (on the start and pause cards) flip up and down, like a real
control stick: push down to climb.

## The flight cycle

1. **Takeoff.** Every flight starts on the river airstrip. The plane speeds down the
   runway on its own; when the speed reaches 58 kt the screen says **Climb!** Hold up
   (or drag up) to lift off. If you wait too long it lifts off by itself at the end of
   the runway.
2. **Cruise.** Fly the canyon. The **STRIP** readout counts down to the next airstrip
   (one every 2 km).
3. **Landing.** When an airstrip comes up, obstacles stop and a line of coins leads down
   the glide path to the runway. The approach panel shows the distance and four
   **PAPI lights** like a real airport: two white and two red means you're on the glide
   path, more white means too high, more red means too low. Line up with the runway and
   touch down on it.
   - Landing gives a full tank, +1 life (up to 3), +1 autopilot charge (up to 5) and a
     bonus: 200 points, up to +150 for landing near the centreline, +150 more for a soft
     "butter" landing.
   - Miss the strip and you keep flying. A fuel can comes up soon after, and the next
     strip is 1.6 km away.
4. After the plane stops and refuels, it takes off again from the same runway.

## Autopilot

You start with 3 charges. One charge flies the plane for 8 seconds: it heads for coins,
steers around obstacles, and a shield (a teal cage around the plane) blocks any hit. If
an airstrip is ahead it flies the glide path and **lands for you**. The timer pauses while
you're on the ground.

## Collect and avoid

- **Coins:** 10 points each. Grab them less than about a second apart to build a chain:
  every 5 coins in a row adds one to the multiplier, up to x5.
- **Orange rings:** fly through for a 3-second speed boost and +50.
- **Red fuel cans:** +40% fuel.
- **Teal magnet:** pulls nearby coins in for 8 seconds.
- **Pink hearts:** +1 life (only when you've lost one).
- **Avoid:** rock spires (fly over the short ones), hot-air balloons (sometimes a whole
  wall of them with one gap) and floating rock islands. A hit costs a life; lose all 3
  and the flight is over. Running out of fuel in the air ends the flight too.

The canyon gets faster the further you fly, and the sky moves from morning to noon to
golden hour to dusk every 2.4 km.

## Saved in the browser

Best score, the pilot-style control setting and sound on/off are kept in `localStorage`.
