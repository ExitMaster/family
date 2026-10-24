# Coin Rush Racing

A 3D time-trial racing game in **one HTML file** (three.js from a CDN, no build step).
Finish a race to earn coins — the faster your time, the more you get — then spend
them on new cars and upgrades.

> <https://exitmaster.github.io/family/coin-rush/>

## Install it as an app

Coin Rush is a web app. Open <https://exitmaster.github.io/family/coin-rush/> on your phone and:

- **iPhone / iPad (Safari):** Share → **Add to Home Screen**
- **Android (Chrome):** menu ⋮ → **Install app** (or **Add to Home screen**)
- **Computer (Chrome / Edge):** the install icon at the right of the address bar

It then opens full-screen from its own icon and keeps working without internet after the first
visit (`manifest.webmanifest`, `service-worker.js` and `icons/` in this folder).

## Controls

| | |
|---|---|
| Accelerate / brake & reverse | `W` `S` or `↑` `↓` |
| Steer | `A` `D` or `←` `→` |
| Handbrake drift | `SPACE` |
| Boost | `SHIFT` |
| Back on track | `R` |
| Pause | `ESC` |
| Phone / tablet | one thumb: hold anywhere to drive, slide left/right to steer, pull down to brake or reverse (no nitro on phones) |

## Modes

- **Time Trial** — solo, pick any of the 11 tracks below and chase medal times.
- **Race** — the Grand Prix: 3 big laps of an F1-style oval (grandstands, pit garages,
  five red start lights) against 5 rival formula cars — Blaze, Comet, Dash, Nova and Rocket — from a
  6-car grid — you start 3rd.
  Rivals only appear here. The quickest laps around silver-medal pace, the slowest near
  bronze, and none go faster than 90% of your car's top speed, and they ease off when far ahead, so they stay beatable. Your position
  shows next to the lap counter.
- **Off Road** — dirt tracks: **Mud Valley** (green hills, logs) and **Dust Bowl** (desert,
  cacti, mesas). Dirt roads with ruts, dirt berms and hay-bale walls, three **ramps** per lap
  that launch you into the air (no steering mid-air, a bump on landing, "BIG AIR!" for the big
  ones) and **mud puddles** that drag you down. Off-road cars (Dune Buggy, Monster Truck, Dune
  Pickup) keep nearly all their pace on dirt; road cars lose up to about 20%.
- **Champagne party:** win the Grand Prix and you get a 50-second celebration — two bottles
  spraying from your car, confetti over the screen, a cork pop and fizz. Tap (or press a key)
  to bring up the results while the party keeps going.
- **Pit stops (Grand Prix):** tires wear as you drive (worn out around the end of lap 2) (faster when you slide), costing grip
  and a little top speed — watch the TIRES bar. The pit lane is on the right of the main
  straight: the inner wall swings out to let you in, there's a 72 km/h limiter, and you stop
  in the yellow PIT box in front of your garage for a 2.5 s stop that fits fresh tires and
  refills boost and charges the battery. The race clock and the rivals freeze while your crew works. Each rival makes one stop too.

## Coins

- Every finish pays coins: beating the bronze time pays the track's full rate, slower times pay less.
- In Race mode, finishing 1st / 2nd / 3rd adds a place bonus.
- Gold / silver / bronze medals add a bonus, and a new personal best adds +30.
- Progress is saved in the browser (`localStorage`).

## Electric cars and charging

Every car is electric: a smooth motor whine instead of gear changes (the HUD shows D / N / R),
blue sparks instead of exhaust smoke when boosting, and a **battery** (⚡ BATT bar) that drains
as you drive — three times faster while boosting. Below 20% the car loses power.

- **Time Trial tracks** each have a **charging station** just after the start line: a glowing
  green pad on the right of the road with chargers and a ⚡ CHARGE sign. Drive over it to top
  up, or stop on it to charge fast.
- **Grand Prix:** your pit box has a charger — a pit stop fits fresh tires *and* fully charges.

Upgrades are Motor (top speed), Power (acceleration), Tires and Boost cell.

## Cars (15)

Pocket Hatch (free), Mini Kei, Dune Buggy (open roll cage, great off-road), Street Coupe,
Dune Pickup (barely slows off-road), City Taxi (roof sign and checker stripes), Gravel Rally,
Iron Muscle, Monster Truck (giant wheels — in a Race it crushes any rival it hits, +15 coins
each; crushed cars pop back up after 5 s), Apex GT, Drift King (low grip, loves to slide),
Jet Streak (375 coins, 720 km/h, **Race mode only** — its jet flame grows when you floor it), Interceptor (flashing lightbar), Volt Hyper and Formula Zero.

Every car except the Jet Streak got a +50% and a +90% boost to top speed and acceleration, then
was made 50% slower again (the Grand Prix rivals follow the same changes), and car prices were cut by 90% and then raised 25% (an eighth of the original price).

Each owned car has four upgrades, 5 levels each: **Motor** (top speed), **Power**
(acceleration), **Tires** (grip and steering), **Boost cell** (boost length).

## Paint (free)

Every car you own can wear any of eleven paint jobs, picked in the Workshop — no coins needed:
**Factory**, **Neon** (glowing green with a pink underglow), **Camo**, **Nighthawk** (matte
black with red stealth lines), **Cat** (orange tabby stripes, cat ears and a tail), **Gold**,
**Chrome**, **Lava** (black rock with glowing cracks), **Galaxy** (purple space with stars),
**Rainbow** and **Zebra**.

## Tracks (11)

Time Trial races are 2 laps; the Race-mode Grand Prix is 3 laps.

| Track | Laps | Notes |
|---|---|---|
| Pine Loop | 2 | forest, the easy one |
| Red Canyon | 2 | desert rocks and mesas |
| Harbor Night | 2 | night — headlights on |
| Sunset Coast | 2 | beach, palms, ocean |
| Speed Bowl | 2 | oval with grandstands, flat-out |
| Frost Pass | 2 | falling snow, slippery road |
| Neon City | 2 | night city — headlights on |
| Volcano Ridge | 2 | black rock, glowing lava pools, a smoking volcano |
| Jungle Run | 2 | tall jungle trees, bushes and flowers |
| Moon Base | 2 | craters, domes, the Earth in a black sky — less grip |
| Candy Land | 2 | lollipops, candy canes and gumdrops on a chocolate road |
