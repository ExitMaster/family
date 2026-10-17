# Sky Coin Rush

A 3D flying game in **one HTML file** (three.js from a CDN, no build step), the plane
version of Coin Rush. Two modes:

- **Coin Rush**: fly a little red plane down an endless river canyon, grab coins, dodge
  rocks and balloons, and land on airstrips to refuel.
- **Free flight**: fly anywhere you like over an endless open world, as high as
  19,700 ft above the clouds.

> <https://exitmaster.github.io/family/sky-coin-rush/>

## Controls

| | |
|---|---|
| Steer (up / down / left / right) | `↑` `↓` `←` `→` or `W` `S` `A` `D` |
| Autopilot (Coin Rush) | `Q` or the **AP** button |
| Auto-land at home (Free flight) | `L` (or `Q`) or the **LAND** button |
| Boost (Free flight) | hold `SPACE`, `SHIFT` or the **BOOST** button |
| Pause | `ESC` or `P` |
| Phone / tablet | drag anywhere: a joystick appears where your finger lands |

**Pilot-style controls** (on the start and pause cards) flip up and down, like a real
control stick: push down to climb.

## Free flight

Pick **Free flight** on the start card. You start on the home airfield's runway: the
plane speeds up by itself, and you hold up to lift off once it says **Climb!**

- **Fly anywhere.** Left/right banks the plane into a turn; up/down pitches the nose to
  climb or dive (pilot-style controls flip this). Let go and the nose slowly levels out.
  Hold **SPACE**, **SHIFT** or the **BOOST** button to fly fast.
- **The world** never ends: rolling hills, lakes, forests and snowy mountain ranges in
  every direction, with clouds between about 1,200 and 4,300 ft. The sky darkens and the
  haze clears as you climb. The top is 19,700 ft (6,000 m); there's a call-out when you
  pass 10,000 ft.
- **HUD:** altitude (ft), airspeed (kt), compass heading (HDG, 000 = north) and **HOME**:
  the distance to the airfield with an arrow pointing to it.
- **Coins and orange rings** float in clusters all around you, some of them high in the
  sky. Coins chain like in Coin Rush; rings give a boost.
- **Land back home** any time (+100, once per 5 seconds). The whole flat meadow around
  the runway counts, not just the runway, and a tall yellow **beacon** beside the runway
  shows where it is from far away. Below 80 m over the airfield the screen says
  "Airfield below". After touching down the brakes stop the plane by themselves; hold up
  to roll again and take off.
- **Auto-land:** tap **LAND** (or press `L`) and the plane flies itself home (boosting
  when it's far away), lines up 1.6 km out, follows a 6% glide path down and lands.
  Steer yourself, or tap LAND again, to take back control.
- **Crashing** into a hill or the water doesn't end anything: after a moment the plane is
  put back in the air 220 m above the spot.
- No lives, fuel or obstacles in Free flight. Pause and press **End flight** to go back
  to the start card.

## Coin Rush: the flight cycle

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
   - **Landing helper:** in the last 300 m the plane eases itself onto the centreline and
     down the glide path when you're not pushing up or down (your own input always wins).
     Within 100 m of the runway, lined up and low, it lands by itself ("Auto-landing").
     Touching down anywhere within a few metres of the runway's sides counts.
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
