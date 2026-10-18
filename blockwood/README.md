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
| Break | left click (hold to keep digging); also hits animals and lights TNT |
| Place | right click |
| Copy block | middle click puts the targeted block in your hand |
| Backpack & crafting | `E` (touch: Bag button) |
| Eat | right click while holding food (Survival) |
| Pick block | `1`–`9` or mouse wheel |
| Mute | `M` (or the Sound button in the pause menu) |
| Pause | `ESC` |
| Phone / tablet | left stick moves, drag on the right to look, tap to break or place (switch with the Break / Place button), Jump and Fly buttons |

## Game modes

- **Creative**: fly, every block and item, break blocks instantly.
- **Survival** (pick it in the pause menu): 10 hearts and 10 food. Falling, drowning, zombies
  and TNT hurt you; food slowly drains and full food heals you. Blocks take time to dig and
  go into your backpack; stone needs a pickaxe, iron ore a stone pickaxe. Zombies come out at
  night and in dark caves and burn in daylight. If you die you respawn with your backpack.
- **Crafting** in the backpack: planks, sticks, torches, wooden/stone/iron pickaxes and swords,
  iron ingots (raw iron + coal), cooked porkchops, glass, stone, stone bricks, bricks and TNT.
- **Torches** light up caves and the night with a warm glow.

## World

- 16×64×16 chunks generated from seeded value noise; view distance 3–8 chunks (pause menu).
- Blocks: grass, dirt, stone, sand, water, oak log, oak leaves, oak planks, cobblestone,
  glass, bricks, stone bricks, wool, snow, coal ore, iron ore, TNT and bedrock.
- **Caves**: winding tunnels and big dark caverns underground (overhangs and caves are shaded dark).
- **Dig to the other side**: break through the bedrock at the very bottom and you fall out of the
  sky on the other side of the world. Do it again to come home.
- **TNT**: hit it to light the fuse; it blows a hole, sets off nearby TNT and knocks you back.
- **Animals**: pigs and sheep wander the grass, run when you hit them.
- **Sound effects** for digging, building, footsteps, splashes, animals and explosions (all synthesized).
- 10-minute day/night cycle with sun, moon and sunset sky.
- **New world** in the pause menu deletes the current world and makes a new seed.

## Saving

Everything is kept in `localStorage` under `blockwood.save.v1`: the seed, every block you
changed, your position, fly mode, time of day, game mode, both inventories, health, food, spawn point, view distance and sound setting. It saves every few
seconds while you build and whenever you pause or leave the page.
