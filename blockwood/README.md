# Blockwood

A Minecraft-style voxel sandbox in **one HTML file** (three.js from a CDN, no build step).
An endless generated world of hills, lakes, beaches, stone peaks and oak forests: dig it up,
build on it, fly over it. The world saves in the browser.

> <https://exitmaster.github.io/family/blockwood/>

## Controls

| | |
|---|---|
| Move | `W` `A` `S` `D` · `SHIFT` to sprint |
| Jump / swim | `SPACE` |
| Fly | `F` or double-tap `SPACE`; `SPACE` rises, `SHIFT` sinks |
| Break | left click (hold to keep digging) |
| Place | right click |
| Copy block | middle click puts the targeted block in your hand |
| Pick block | `1`–`9` or mouse wheel |
| Pause | `ESC` |
| Phone / tablet | left stick moves, drag on the right to look, tap to break or place (switch with the Break / Place button), Jump and Fly buttons |

## World

- 16×64×16 chunks generated from seeded value noise; view distance 3–8 chunks (pause menu).
- Blocks: grass, dirt, stone, sand, water, oak log, oak leaves, oak planks, cobblestone,
  glass, bricks, coal ore, bedrock (unbreakable).
- 10-minute day/night cycle with sun, moon and sunset sky.
- **New world** in the pause menu deletes the current world and makes a new seed.

## Saving

Everything is kept in `localStorage` under `blockwood.save.v1`: the seed, every block you
changed, your position, fly mode, time of day, hotbar and view distance. It saves every few
seconds while you build and whenever you pause or leave the page.
