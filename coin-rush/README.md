# Coin Rush Racing

A 3D time-trial racing game in **one HTML file** (three.js from a CDN, no build step).
Finish a race to earn coins — the faster your time, the more you get — then spend
them on new cars and upgrades.

> <https://exitmaster.github.io/family/coin-rush/>

## Controls

| | |
|---|---|
| Gas / brake & reverse | `W` `S` or `↑` `↓` |
| Steer | `A` `D` or `←` `→` |
| Handbrake drift | `SPACE` |
| Nitro | `SHIFT` |
| Back on track | `R` |
| Pause | `ESC` |
| Phone / tablet | one thumb: hold anywhere to drive, slide left/right to steer, pull down to brake or reverse (no nitro on phones) |

## Modes

- **Time Trial** — solo, pick any of the 7 tracks below and chase medal times.
- **Race** — the Grand Prix: 3 big laps of an F1-style oval (grandstands, pit garages,
  five red start lights) against 5 rival formula cars — Blaze, Comet, Dash, Nova and Rocket — from a
  6-car grid — you start 3rd.
  Rivals only appear here. The quickest laps around silver-medal pace, the slowest near
  bronze, and none go faster than 90% of your car's top speed, and they ease off when far ahead, so they stay beatable. Your position
  shows next to the lap counter.
- **Champagne party:** win the Grand Prix and you get a 50-second celebration — two bottles
  spraying from your car, confetti over the screen, a cork pop and fizz. Tap (or press a key)
  to bring up the results while the party keeps going.
- **Pit stops (Grand Prix):** tires wear fast as you drive (worn out early in lap 2) (faster when you slide), costing grip
  and a little top speed — watch the TIRES bar. The pit lane is on the right of the main
  straight: the inner wall swings out to let you in, there's a 72 km/h limiter, and you stop
  in the yellow PIT box in front of your garage for a 2.5 s stop that fits fresh tires and
  refills nitro. The race clock and the rivals freeze while your crew works. Each rival makes one stop too.

## Coins

- Every finish pays coins: beating the bronze time pays the track's full rate, slower times pay less.
- In Race mode, finishing 1st / 2nd / 3rd adds a place bonus.
- Gold / silver / bronze medals add a bonus, and a new personal best adds +30.
- Progress is saved in the browser (`localStorage`).

## Cars (10)

Pocket Hatch (free), Mini Kei, Street Coupe, Dune Pickup (barely slows off-road),
Gravel Rally, Iron Muscle, Apex GT, Interceptor (flashing lightbar), Volt Hyper,
Formula Zero.

Each owned car has four upgrades, 5 levels each: **Engine** (top speed), **Turbo**
(acceleration), **Tires** (grip and steering), **Nitro** (boost length).

## Paint (free)

Every car you own can wear any of eleven paint jobs, picked in the Workshop — no coins needed:
**Factory**, **Neon** (glowing green with a pink underglow), **Camo**, **Nighthawk** (matte
black with red stealth lines), **Cat** (orange tabby stripes, cat ears and a tail), **Gold**,
**Chrome**, **Lava** (black rock with glowing cracks), **Galaxy** (purple space with stars),
**Rainbow** and **Zebra**.

## Tracks (7)

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
