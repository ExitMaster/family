# Lantern Lake

A 3D fishing game in **one HTML file** (three.js from a CDN, no build step).
Drive your own boat around a forested lake, cast, fight the line tension and fill
your catch journal. Sell what you land for coins and spend them on better tackle.

> <https://exitmaster.github.io/family/lantern-lake/>

## Controls

| | |
|---|---|
| Drive the boat | `W` `S` or `↑` `↓` |
| Steer | `A` `D` or `←` `→` |
| Cast | hold `SPACE` (or click / tap and hold), let go when the needle is over the water you want |
| Strike | press when the bobber goes under |
| Reel | hold to reel in, let go when the fish runs or the line snaps |
| Phone / tablet | steering stick bottom-left, tap and hold the water to cast and reel |

## The lake

- **Eight spots:** Lantern Bay, Lily Cove, Rocky Point, Deep Channel, Beaver Creek,
  Flooded Timber, Island Narrows and Dam Spillway. Each has its own scenery, its own
  names for the three casting distances (near, middle, far) and one fish found only there.
- **Open water:** a channel through the southern hills leads out to endless open water
  and islands, generated as you go. Bigger predators and more treasure out there.
- **The map** shows your boat and lets you jump straight to any spot.

## Fish, junk and treasure

- 16 freshwater species, from bluegill to lake sturgeon, each with a real length and weight.
- 9 kinds of junk and treasure: an old boot, a tin can, a rubber duck, a beaver stick, a lost
  crankbait, a car tire, a message in a bottle (with a random note), a gold pocket watch and an anchor.
- Fish swim under the water, circle in to your bobber, leap on their runs and flop on the catch card.

## Weather and time

The day cycles dawn → day → dusk → night (45 s each). Weather changes on its own:
clear, overcast, rain, fog and thunderstorms. Each one changes which fish bite and how fast.

## Tackle shop

Rod (reels faster), line (snaps less), lure (rarer fish, less junk) and boat
(outboard motor, then a twin-engine speedboat over 100 km/h).

## Tournaments

Five timed events against three rival anglers: Panfish Sprint, Big Bass Classic,
Total Weight Open, Species Hunt and Monster Derby. The top three places win coins.

Progress saves in the browser (`localStorage`).
