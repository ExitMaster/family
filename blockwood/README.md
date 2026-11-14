# Blockwood

A Minecraft-style voxel sandbox in **one HTML file** (three.js from a CDN, no build step).
An endless generated world of hills, lakes, beaches, stone peaks and oak forests: dig it up,
build on it, fly over it. The world saves in the browser.

> <https://unimai.net/blockwood/>

## Controls

| | |
|---|---|
| Move | `W` `A` `S` `D` · `SHIFT` to sprint |
| Jump / swim | `SPACE` |
| Fly | `F` or double-tap `SPACE`; `SPACE` rises, `SHIFT` sinks |
| Break | left click (hold to keep digging); also hits animals and lights TNT |
| Kill | `K` instantly kills the animal or monster you look at (or the nearest one) |
| Place | right click |
| Copy block | middle click puts the targeted block in your hand |
| Backpack & crafting | `E` (touch: Bag button) |
| Eat | right click while holding food (Survival) |
| Trade | right click a villager (Survival) |
| Airplane | place it, right click to get in; `W` speeds up, `S` slows down, arrow keys steer (`←` `→` turn, `↑` climb, `↓` dive) or look where you want to fly, `V` autopilots to the nearest villager's house and lands by the door (touch: Land button), `Shift` to get out (touch: stick up to speed up, Exit button) |
| Bow | hold right click to pull back, let go to shoot (longer pull = faster, harder arrow) |
| Ender pearl | right click to teleport to where you look |
| Sleep | right click a bed at night to skip to morning (also sets your respawn point) |
| Pick block | `1`–`9` or mouse wheel |
| Mute | `M` (or the Sound button in the pause menu) |
| Pause | `ESC` |
| Phone / tablet | left stick moves, drag on the right to look, tap to break or place (switch with the Break / Place button), Jump and Fly buttons |

## Game modes

- **Creative**: fly, every block and item, break blocks instantly.
- **OneBlock** (press *Play OneBlock* in the pause menu): you stand on a single block floating in
  the sky with nothing else around. Break it and a new block appears in the same spot, so you
  slowly collect everything you need to build an island. The blocks go through phases: Plains
  (grass, dirt, logs), Underground (stone, coal, iron), Snowy mountains, Beach, Village (planks,
  bricks, wool), the Nether (netherrack, gold, glowstone, obsidian) and the End (end stone, dragon
  egg), then start over. Sometimes a treasure pops out, or an animal or monster from that phase.
  Fall off and you land back on the block. Press *Back to the big world* to go home; your
  OneBlock island is saved.
- **Survival** (pick it in the pause menu): 10 hearts and 10 food. Falling, drowning, zombies
  and TNT hurt you; food slowly drains and full food heals you. Blocks take time to dig and
  go into your backpack; stone needs a pickaxe, iron ore a stone pickaxe. Zombies come out at
  night and in dark caves and burn in daylight. If you die you respawn with your backpack.
  The backpack holds 54 stacks on top of the 9-slot hotbar.
  You always carry 100,000 cobblestone: it tops itself back up no matter how much you use.
- **Crafting** in the backpack: planks, sticks, torches, wooden/stone/iron pickaxes and swords,
  iron ingots (raw iron + coal), beds, cooked porkchops, steak, chicken and fish, glass, stone, stone bricks, bricks and TNT.
- **Torches** light up caves and the night with a warm glow.
- **Villages**: little towns of plank houses with red roofs, glass windows, a torch and a bed
  inside, a well in the middle and a runway with a dashed centre line and torch lights for your
  airplane. There is always one near the start. Villagers (farmers,
  fishers, blacksmiths, librarians and builders) wander around, look at you when you come close,
  and trade. Lots of trades are big bargains, like 5 dirt for 60 glass (every villager does that
  one), 8 dirt for 64 stone bricks, 5 dirt for 32 logs, 20 cobblestone for 8 iron ingots or
  5 dirt for 16 apples. They also buy food and supplies for emeralds and sell tools, food,
  torches, TNT and beds.
- **Airplanes**: in Creative take one from the `E` menu; in Survival you always have one. Place it,
  climb in, speed up and pull up to take off. Fly fast to stay up; crash into a hill too fast
  and it hurts. Jump out in the air and a parachute opens. Planes stay where you leave them.
- **Beds** (3 wool + 3 planks): sleep through the night if no monsters are close, and wake up
  there after dying.

## World

- 16×64×16 chunks generated from seeded value noise; view distance 3–8 chunks (pause menu).
- Blocks: grass, dirt, stone, sand, water, oak log, oak leaves, oak planks, cobblestone,
  glass, bricks, stone bricks, wool, snow, coal ore, iron ore, TNT and bedrock.
- **Obsidian**: dark purple blocks deep underground, near the bedrock. Mine it with an iron
  pickaxe, or trade for it (the Builder swaps 10 cobblestone for 10 obsidian).
- **The Nether**: build an obsidian frame 4 wide and 5 tall (the corners can be left out), light
  the inside with **flint and steel** (1 iron ingot + 1 cobblestone, or from the Blacksmith) and
  walk into the purple portal. The Nether is a huge red cavern of netherrack with glowstone hanging
  from the ceiling and gold ore in the walls. One step there is 8 steps in the Overworld, and a
  portal home appears where you arrive; walk back in to return. Beds explode down there!
- **The End and the Ender Dragon**: craft an **eye of ender** (1 ender pearl + 1 glowstone, or
  buy one from the Librarian) and right click the ground with it. An End portal opens right
  there: jump in. You arrive on a little obsidian platform next to a floating island of end
  stone in the void, so build a bridge across. Eight obsidian towers have healing crystals on
  top; hit a crystal (even from far away) to blow it up. The Ender Dragon circles the island,
  dives at you, and sometimes lands on the bedrock fountain in the middle, which is the best time
  to hit it. Its health bar is at the top of the screen. Beat it and the exit portal opens in the
  fountain (with a dragon egg on top) to take you home. Don't fall off: in Survival the void kills you.
- **Caves**: winding tunnels and big dark caverns underground (overhangs and caves are shaded dark).
- **Dig to the other side**: break through the bedrock at the very bottom and you fall out of the
  sky on the other side of the world. Do it again to come home.
- **TNT**: hit it to light the fuse; it blows a hole, sets off nearby TNT and knocks you back.
- **Animals**: pigs, sheep, cows, chickens and hopping rabbits wander the land, and fish swim in
  lakes and the sea. They run when you hit them. In Survival they drop porkchops, wool, beef,
  chicken and fish, which you can cook with coal.
- **Bows and arrows**: craft a bow (3 sticks + 3 wool) and arrows (1 stick + 1 cobblestone makes 4),
  or buy them from the Blacksmith and Fisher. Hold right click to pull the bow back and let go to
  shoot; a full pull does 9 damage. Arrows fly in an arc, stick in blocks, and can hit the Ender
  Dragon and blow up its crystals from far away. In Creative the bow needs no arrows.
- **Skeletons** come out at night with zombies. They keep their distance and shoot arrows at you,
  burn in daylight, and drop arrows (and sometimes a bow).
- **Iron golems** guard every village: big iron giants with vines growing on them that wander
  around the houses. When a zombie, skeleton, creeper or magma cube comes close, the golem stomps
  over and throws it into the air with a huge punch. They leave you alone, unless you hit one;
  then it punches you too. A creeper blast only dents them. They drop iron ingots.
- **Creepers** are green and silent. They sneak up at night, then hiss, swell up and flash white
  for a second and a half before they explode, blowing a hole in the ground. Run more than 6 blocks
  away while one is hissing and it calms down. They drop gunpowder (3 gunpowder + 2 sand makes TNT).
- **Piglins** live in the Nether. They're friendly unless you hit one (then the whole group gets
  angry). Right click one while holding a gold ingot to barter: they give back obsidian,
  glowstone, ender pearls, iron and more. **Magma cubes** hop around the Nether and attack.
- **Sound effects** for digging, building, footsteps, splashes, animals and explosions (all synthesized).
- 10-minute day/night cycle with sun, moon and sunset sky.
- **New world** in the pause menu deletes the current world and makes a new one. Type a **seed** in the
  box next to it first to get that exact world again (numbers or any word, like `castle`); leave it
  empty for a random one. Your current seed is shown just above, so you can share it with friends.

## Multiplayer

Play in the same world with your family, like Jetpack Jump. In the pause menu, type **your name**
and a **room code** (3 to 6 letters or numbers, like `FAM1`) and press **Join**. Everyone who
joins with the same code is in the same world:

- The room uses the world seed of whoever made it first.
- Every block anyone breaks or places (TNT, portals, the OneBlock block…) shows up for everyone,
  and stays in the room for next time.
- You see each other walking around with name tags (in the same dimension).
- Press `T` to chat.
- Animals, monsters and the Ender Dragon are your own, and your backpack stays yours.

Press **Leave** to go back to your own world, exactly as you left it. Nothing from the room is
saved into your own world. Multiplayer needs the internet and works on the website
(<https://unimai.net/blockwood/>), not inside the Claude preview. It uses the
family Firebase database under `rooms/{CODE}/blockwood`, so no rule changes are needed.

## Saving

Everything is kept in `localStorage` under `blockwood.save.v1`: the seed, every block you
changed, your position, fly mode, time of day, game mode, both inventories, health, food, spawn point, view distance and sound setting. It saves every few
seconds while you build and whenever you pause or leave the page.
