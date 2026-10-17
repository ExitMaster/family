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
  five red start lights) against 5 rival formula cars — Blaze, Comet, Dash, Nova and Rocket.
  Rivals only appear here. They're tuned to be beatable: a clean run at bronze-medal pace
  wins, and they ease off if they get far ahead. Your position shows next to the lap counter.

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

## Tracks (7)

Every race is 3 laps.

| Track | Laps | Notes |
|---|---|---|
| Pine Loop | 3 | forest, the easy one |
| Red Canyon | 3 | desert rocks and mesas |
| Harbor Night | 3 | night — headlights on |
| Sunset Coast | 3 | beach, palms, ocean |
| Speed Bowl | 3 | oval with grandstands, flat-out |
| Frost Pass | 3 | falling snow, slippery road |
| Neon City | 3 | night city — headlights on |
