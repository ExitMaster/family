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
| Airplane | place it, right click to get in; `W` speeds up, `S` slows down, arrow keys steer (`←` `→` turn, `↑` climb, `↓` dive) or look where you want to fly, `V` autopilots to the nearest villager's house and lands by the door (touch: Land button), `Shift`, `Q` or `X` to get out (touch: stick up to speed up, Exit button) |
| Chat | `T`, `Enter` or `/` (touch: 💬 button). In a multiplayer room everyone sees it. Commands: `/help`, `/find`, `/tp NAME`, `/tp X Y Z`, `/spawn`, `/trade NAME`, `/pvp on|off`, `/kick NAME`, `/kill`, `/clone`, `/unclone`, `/summon NAME`, `/mobs`, `/day`, `/night`, `/weather rain|storm|clear`, `/seed`, `/spawn`, `/fly`, `/clear` |
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
- **Lots more animals and monsters**: horses, donkeys, wolves, foxes, cats, pandas, bees and parrots
  on the grass; frogs by water; goats up high; turtles on beaches; polar bears and foxes in the snow;
  squid, dolphins and axolotls in the water. At night: spiders (they climb walls), slimes (big ones
  split in two), witches that throw magic, bandits with crossbows and brutes with axes; husks in the
  desert. In caves: bats, silverfish and cave spiders.
- **67 more**: deer, bison, brown bears, elephants, giraffes, zebras, lions, tigers, hippos, rhinos,
  raccoons, skunks, hedgehogs, mice, squirrels, beavers, otters, boars, alpacas, capybaras, red pandas,
  koalas, sloths, snakes, dogs (a pet dog fights monsters too), peacocks, ducks, geese, turkeys,
  unicorns (rare), snails, ladybugs, owls, eagles, crows, butterflies, dragonflies, fairies and
  dragonlings (both rare, and both can be pets) on the grass; camels, cheetahs, kangaroos,
  tortoises, lizards, armadillos, ostriches and crabs on sand; moose, reindeer, arctic foxes and
  penguins in the snow; sharks (they chase swimmers) and whales in deep water, and octopuses,
  jellyfish, seals, pufferfish and clownfish. At night: goblins, orcs, trolls, imps and flying
  wraiths, with mummies and scorpions in the desert and yetis in the snow. And deep in caves,
  watch out for chests with teeth: mimics. Lions, tigers, bears, bison, boars, geese, hippos,
  rhinos, cheetahs and snakes only fight back if you hit them.
- **The Deep Watcher**: a blind stone giant with a glowing core that very rarely lives deep in the
  caves. It can't see you, but it hears you dig, build, run or jump (and always notices you right
  next to it). You can hear its heartbeat when it's close. It hits very hard; sneak away slowly!
- `/summon NAME` makes any mob in front of you (like `/summon horse` or `/summon deep watcher`), and
  `/summon 100 zombie` makes up to 1000 at once, lined up in rows; `/summon 1000 every monster`
  mixes every kind of monster (`every animal` and `everything` work too), but that many can be slow (summoned zombies and skeletons
  don't burn in daylight);
  `/unsummon` makes everything you summoned disappear, `/unsummon zombie` clears every zombie near
  you, and `/unsummon all` clears every mob near you (pets, clones and your horse stay);
  `/no more silverfish` makes a mob vanish and never appear again (remembered in this browser, in every
  world); `/yes more silverfish` brings it back, and `/no more` lists them;
  `/mobs` lists every name. Summoned monsters stay even in Creative, where they can't hurt you.
- A pet **wolf** fights monsters for you. Any animal can be a pet, even bees and parrots.
- **The secret life of animals**: type `/kill` (or die any other way) and the camera floats up over
  the spot where you fell. Thinking you're gone, the animals stop pretending: pigs, horses, wolves
  and cats walk around on two legs like people, cows dance, sheep jump, chickens fly loops, rabbits
  bounce sky-high, monsters wiggle, and they chat about it. Press Respawn and they all freeze back
  to normal.
  Press **Live secret life 👻** to become a ghost and fly around among them (WASD, Space up,
  Shift down); they can't see you. Esc brings the death screen back.
  In a multiplayer room your friends see you lying where you fell, and as a see-through floating
  ghost while you fly around.
- **88 more blocks**: birch, spruce, jungle, acacia, dark oak and cherry logs, planks and leaves;
  granite, diorite, andesite, slate, basalt, marble, sandstone, red sand and red sandstone, gravel,
  clay, mud, mossy cobblestone, mossy and cracked stone bricks, smooth stone, terracotta, nether
  bricks; gold, diamond, emerald, ruby, lapis and copper ores with matching blocks (plus blocks of
  iron and coal); 15 colours of wool and 6 of stained glass; bookshelf, crafting table, furnace,
  pumpkin, jack o'lantern (glows), melon, hay bale, cactus, ice, packed ice, sponge, glowing lamp,
  quartz, mushroom blocks, moss and snow block. Spruce grows on hills, and there are birch, dark oak
  and cherry groves; pumpkins and melons grow on the grass and cactus on beaches; the new ores and
  stones are underground (diamonds and rubies deepest). New recipes: planks from every log, crafting
  table, furnace, bookshelf, sandstone, smooth stone, jack o'lantern, lamp, and iron/gold/coal blocks.
- **The knife** (craft: 1 iron ingot + 1 stick, or pick it in Creative): hold it and right-click a block to
  cut it open and see what's inside. Wool hides a sheep, logs hide sticks (or a squirrel), leaves hide
  apples or birds, grass and dirt hide little critters, sand hides crabs, stone hides treasure, ores
  hide ingots or a whole gem block, a dragon egg hatches a pet baby dragon, a pumpkin becomes a jack
  o'lantern, ice has a frozen fish, bookshelves hold secret notes, TNT… goes boom. And **obsidian hides
  a dream portal**: hold any block and right-click the portal to put it inside, then right-click it
  with an empty hand to visit **a whole world made of that block** (gold, wool, glass, TNT…). A
  portal next to where you arrive takes you home (so does `/spawn`). Pets and clones come along.
  In a multiplayer room, friends can come too: through your portal, or with `/tp NAME`. Everyone
  in a dream world sees each other and what they build, and `/find` says which world you're in.
- **`/summon house`** builds a stone lookout tower in front of you: a door facing you, windows,
  a spiral stair inside (jump up each step) and a lookout platform with battlements and torches.
- **Chests**: craft one from 8 oak planks (or pick it in Creative). Right-click a chest to open it:
  click things in your backpack to put them in (54 slots), click things in the chest to take them out.
  In Creative, clicking any block puts 64 of it in. Breaking a chest gives you everything inside.
  Chests are saved with your world, and in a multiplayer room everyone shares them.
- **Clone yourself**: type `/clone` (or `/clone 5`, up to 10). Clones look like you, follow you
  everywhere, jump when you jump and punch monsters that come near you. `/unclone` sends them home.
  They're saved with your world.
- **Ride horses**: right-click a horse to get on. WASD rides (much faster than walking), Space jumps
  high, Shift gets off (touch: Exit button). Donkeys, zebras, camels, unicorns (fastest, highest
  jumps) and elephants can be ridden too. Hold an apple when you right-click to make one a pet
  instead. Friends in a room see you sitting up on it.
- **Pets**: right-click a pig, sheep, cow, chicken or rabbit to make it your pet. A heart floats over
  it and it follows you everywhere: it catches up if you run off, and comes with you through portals,
  into multiplayer rooms and after a reload (pets are saved with your world). Right-click it again to
  let it go. Holding an **apple** makes any animal nearby follow you.
- 10-minute day/night cycle with sun, moon and sunset sky.
- **Weather**: clear spells and rain take turns. On snowy ground and high mountains it snows instead,
  and roofs keep you dry. **Thunderstorms** darken the sky with lightning and thunder, and are dark
  enough for monsters to come out in the daytime (sleeping through one clears it). Change it with
  `/weather clear`, `/weather rain` or `/weather storm` (or `/rain`, `/storm`, `/sun`).
- **Travel**: the pause menu shows where you are and where your spawn point is. **Go to spawn point**
  takes you back to your bed (or where the world started), and **Go to** takes you to any X Y Z you
  type (leave Y empty to land on the ground there). In chat: `/spawn` (or `/home`), `/tp X Z` or
  `/tp X Y Z`.
- **New world** in the pause menu deletes the current world and makes a new one. Type a **seed** in the
  box next to it first to get that exact world again (numbers or any word, like `castle`); leave it
  empty for a random one. Your current seed is shown just above, so you can share it with friends.

- **Play-time limit**: when the name in the Multiplayer "Your name" box is **Aiden**, the game can be
  played for 13 minutes a day (counted only while playing, kept in this browser). The info line shows
  the minutes left, a warning comes 1 minute before, and then the game stops until the next day.

- **Flowing water**: water flows like in Minecraft too. It pours down off edges as a waterfall, and on flat
  ground spreads up to 7 blocks from its source, getting shallower each block. Dig next to the sea or a lake and
  it runs into the hole; take the source away and the flow dries up. Two water blocks with a one-block gap
  between them fill it with a new water block, so you can make endless water. Craft a **Bucket** from 3 iron
  ingots (or buy one from a smith) and right-click water to scoop it up, then right-click again to pour it.

- **ASMR mode**: press **ASMR mode** in the pause menu (or type `/asmr`) to go to a calm pastel world with a giant
  spiral tower made of **butter squishies**, **ASMR keyboards** and **왁뿌볼s** (squishy balls). Run up the stairs
  (you step up them by yourself) to the top. Every block has its own sound: keyboards clack, butter squishies
  squish and 왁뿌볼s bloop. Falls don't hurt there, and landing on a 왁뿌볼 bounces you. The new blocks are in
  the Creative inventory too (`/give 왁뿌볼` works). Press the button again to go back to the big world.

- **Tesla Model Y L**: a car you can drive, built to the real car's size (about 5 m long) with a smooth body, an
  all-glass roof, spinning wheels with front wheels that steer, light bars front and back (the brake lights glow
  when you brake), and six seats, a dashboard, a big screen and a steering wheel inside. It's in the Creative
  inventory; in Survival craft it from 8 iron ingots, 4 glass and 4 coal. Right-click the ground to park it (it
  comes in Pearl White, Stealth Grey, Quicksilver, Ultra Red, Diamond Black or Glacier Blue), right-click it to
  get in, left-click to pick it up. **W** drives, **S** brakes and reverses, **A/D** steer, **C** switches
  between the chase camera and the driver's seat, **H** honks, **Shift** gets out. It hums like an electric car,
  climbs one-block bumps, stops at walls and knocks mobs aside. On a phone the stick drives it.
  In multiplayer, friends see your car: the one you're driving moves, steers, spins its wheels and lights its
  brake lights with you in the driver's seat, and your parked cars show up for them too. Friends can **ride with
  you**: they right-click your car (parked or while you drive) to sit in the front passenger seat, or a back
  seat if that's taken (3 passengers at most), and Shift gets them out. Friends can also **drive your car**: right-clicking it
  while it's parked puts them in the driver's seat (your copy disappears until they're done), and when they get
  out it stays parked where they stopped, still yours. In the driver's seat, **1** to **9** paint the
  car (Stealth Grey, Glacier Blue, Pearl White, Ultra Red, Diamond Black, Quicksilver, Marine Blue, Midnight
  Cherry Red, Ultra Violet) and **P** goes through all 14 colours (also Sunset Orange, Bubblegum Pink, Lime
  Green, Gold and Mint). **G** is **autopark**: the car finds the nearest free garage or gas-station pump within
  70 blocks and drives itself there and parks (W, S, A or D takes back control).

- **Roads and garages**: roads cross the whole Overworld in a big grid (one every 128 blocks, the first about
  30 blocks from where the world starts). They're asphalt with a dashed yellow middle line and white edges,
  smoothed over hills, cut through mountains as tunnels and carried over water on bridges. Every crossing
  has **traffic lights** that go green, yellow and red (one road at a time). White **garages** with a driveway,
  windows, a light and an **EV charger** (park inside and your battery fills up) stand along the roads; about one in 30 has a Tesla parked inside for you to drive. Each
  garage has a **roll-up door** that opens when you come within 26 blocks, closes behind you once you're inside,
  and opens again when you head out. **Traffic** drives on the roads near you: cars keep to the right, stop at
  red lights, keep a gap behind each other and stop and honk if you (or a friend) are in their way (you can
  bump into them, but not get in). In multiplayer everyone sees the same traffic: one player near each group
  drives it and shares it.
  **Gas stations** have a red canopy over two fuel pumps, two electric chargers, a little shop and a GAS sign.
  The Tesla's battery runs down as you drive (about 4½ minutes flat out; the info line shows it), and when it's
  empty the car only crawls: stop next to a pump or charger to fill it back up (about 30 seconds from empty). Asphalt, the road lines, pumps,
  chargers and the GAS sign are in the Creative inventory.

- **Houses and cave houses**: the roads are lined with buildings now. **Mansions** are two storeys tall, with a columned
  porch and a balcony, tall windows, a sloping roof, a grand staircase, an **elevator**, a living room with a sofa,
  a kitchen, three bedrooms, hedges and a pool out the back. **Elevators**: stand still on an Elevator panel and a
  glass elevator takes you to the next panel straight above (or below); build your own with the Elevator block. **Cave houses** are a little stone hut by the road with a spiral staircase that
  goes all the way down (lamps light the way) to a room near the bedrock with a bed, chest, crafting table,
  furnace, bookshelves and a red rug.
- **Signs you can write on**: take a Sign from the Creative inventory (or craft 3 from 6 planks and a stick).
  Right-click the top of a block to stand it up, or the side of a block to hang it on the wall, then type up
  to 4 lines (Enter is done, Shift+Enter starts a new line). Right-click a sign to change what it says,
  left-click to take it down. Signs are saved with your world, and in a room everyone sees them.

- **Every Tesla, plus Hyundai (현대), Kia (기아), BMW, Mercedes-Benz, Audi, Porsche, Ferrari and Lamborghini**: besides the Model Y L there's the **Model S**, **Model 3**, **Model X**,
  **Model Y**, **Cybertruck** (stainless steel), **Roadster** (a low convertible), **Semi** (a big truck cab on
  three axles) and **Cybercab** (two seats, no steering wheel), plus the **Hyundai Ioniq 5**, **Ioniq 6**,
  **Sonata**, **Avante**, **Tucson**, **Kona**, **Santa Fe**, **Palisade**, **Casper**, **Staria** and **Porter**
  truck, and the **Kia Morning**, **Ray**, **K5**, **K8**, **EV3**, **EV6**, **EV9**, **Sportage**, **Sorento**,
  **Carnival** and **Bongo** truck, and **BMW** (3 Series, 5 Series, 7 Series, X3, X5, X7, i4, iX, M4, Z4) and
  **Mercedes-Benz** (C-Class, E-Class, S-Class, CLA, EQS, GLC, GLE, G-Class, AMG GT, Sprinter van), **Audi** (A3, A4, A6, A8, Q3, Q5,
  Q7, Q8, e-tron GT, R8) and **Porsche** (911, Taycan, Panamera, Cayenne, Macan, 718 Boxster, 918 Spyder), **Ferrari** (SF90 Stradale, 296 GTB, F8 Tributo,
  LaFerrari, Roma, 812 Superfast, Purosangue with back-hinged rear doors, Testarossa) and **Lamborghini** (Revuelto,
  Aventador and Countach with scissor doors, Huracán, Temerario, Urus). You can also **ride in traffic**: right-click
  a car on the road to hop in; it keeps driving its route and Shift gets you out. Each is its real size and shape, with its own number of seats; they're all in the Creative inventory
  (or `/give cybertruck`, `/give hyundai porter`…) and drive, autopark, get borrowed and share like the Model Y L.
  Traffic and garages have all kinds now. **Doors open**: the driver's door opens when you get in or out (and a
  friend's door when they hop in), and **O** in the driver's seat opens or closes them all; the Model X's back
  doors lift up like wings, the Cybercab's open upwards and the Staria's slide.

- **A whole town**: the roads are lined with mansions, cave houses, garages and gas stations, and now also
  **schools** (two storeys of red brick with a SCHOOL sign, a flagpole, classrooms with desks and chalkboards,
  stairs, an elevator, a playground with a slide and a swing, and a yellow **School Bus** you can drive),
  **convenience stores** (a MART sign, a green awning, shelves of snacks, a counter and a car park) and **parks**
  (a fountain, paths, trees, benches and lamp posts). **Pedestrians** walk along the edges of the roads, some kids,
  some with a dog: they wait at crossings for a green light, jump out of the way of cars, and say hello when you
  right-click them. In multiplayer everyone sees the same people (one player near each group walks them). `/summon garage` builds a garage (with a roll-up door) next to the nearest mansion, and
  `/tp car` takes you to your car (the one you drove last), and `/tp tesla model s` (any car name) takes you to your
  car of that model, or the nearest one around if you don't have one.

## Multiplayer

Play in the same world with your family, like Jetpack Jump. In the pause menu, type **your name**
and a **room code** (3 to 6 letters or numbers, like `FAM1`) and press **Join**. Everyone who
joins with the same code is in the same world:

- **Room spawn point**: anyone in the room can type `/set room spawn point` to make where they're
  standing the room's spawn point. Friends start there when they join, come back there when
  they respawn, and `/spawn` takes them there.
- **Share my world** (pause menu) shows friends what you built: it makes a new room with a copy of
  your own world (every block you changed, your chests and dream portals) and tells you its code.
  Any brand-new room you make starts as a copy of your world the same way. It's a copy, so what
  happens in the room doesn't change the world saved in your browser.
- The room uses the world seed of whoever made it first. That player is the **host** (shown as
  "(host)" in the player list). The host gets a **Kick** button next to each player in the pause
  menu, or types `/kick NAME`. A kicked player goes back to their own world and can't rejoin for
  10 minutes, unless the host types `/unkick NAME`. (Rooms made before hosts existed get the first
  person to join them as host.)
- Every block anyone breaks or places (TNT, portals, the OneBlock block…) shows up for everyone,
  and stays in the room for next time.
- You see each other walking around with name tags (in the same dimension).
- Press `T` to chat.
- **Fight other players**: left-click a friend to hit them (your sword's damage), or shoot them with
  arrows. Only players in Survival get hurt. When a friend gets you, the death screen says
  "Slain by Alice" and the chat tells the room. Type `/pvp off` to stop hurting and being hurt
  (remembered in this browser), `/pvp on` to fight again.
- **Admin commands** (they work in Survival too; `/admin` lists them): `/give NAME 64` (any block or
  item, like `/give diamond block 64` or `/give iron sword`), `/gamemode creative|survival` (or `/gm c`,
  `/gm s`), `/god` (nothing can hurt you, and you never get hungry), `/feed`, `/time day|noon|sunset|night|midnight`,
  `/setspawn`, `/speed 1-5`, `/jump 1-5` (high jumps don't hurt when you land), `/top` (up onto the
  highest block above you) and `/clearbag`.
- **`/fly` in Survival** lets you fly for 30 seconds (Space up, Shift down; the info line counts down,
  you get a warning at 5 seconds, and you float down safely when time's up). Type it again for more.
- **Give lives**: type `/life NAME` (or right-click a friend who got knocked out) to give a friend a
  life. If they're down, lying on the ground or flying around as a ghost, they get up right where they
  are; if they're fine, they get full hearts and food. `/life` on its own gives you one. It's free.
- **Trade with friends**: right-click a friend (or type `/trade NAME`) to ask them to trade. They press `Y`
  (or the Trade button) to say yes, `N` for no. You each click things in your backpack to put them
  on the trade table (in Creative, a stack of 64 of any block), and when you both press **Trade**
  the two piles swap. Click your side of the table to take something back; **Done** calls the trade
  off and gives everything back. If either of you changes the table, you both press Trade again.
- Everyone has the **same time of day and the same weather**. When someone sleeps, uses `/day`
  or `/night`, or changes the weather, it changes for the whole room.
- **Find your friends**: everyone in the room has a marker with their name and distance; when
  they're off-screen, a yellow arrow at the edge of the screen points the way. Type `/find` to
  hear where everyone is ("Alice: 61 blocks east", or which world they're in), and `/tp Alice`
  (or just `/tp` for the closest) to jump right next to them, even into the Nether or the End.
  The pause menu also has a **Go to …** button for each friend.
- Everyone sees the same animals and monsters, including the ones that pop out of a OneBlock.
  Each mob lives in the game of the player who made it; when you're near each other only one
  of you makes new ones, so you don't get double. You can hit anyone's mobs (sword, arrows or `K`)
  and you get the loot.
- **Monsters chase whoever is closest**, you or a friend (in Survival). Zombies, skeleton arrows and
  creeper blasts hurt your friends too, and a piglin or iron golem goes after the friend who hit it.
- The Ender Dragon is your own, and your backpack stays yours.

Press **Leave** to go back to your own world, exactly as you left it. Nothing from the room is
saved into your own world. Multiplayer needs the internet and works on the website
(<https://unimai.net/blockwood/>), not inside the Claude preview. It uses the
family Firebase database under `rooms/{CODE}/blockwood`, so no rule changes are needed.

## Saving

Everything is kept in `localStorage` under `blockwood.save.v1`: the seed, every block you
changed, your position, fly mode, time of day, game mode, both inventories, health, food, spawn point, view distance and sound setting. It saves every few
seconds while you build and whenever you pause or leave the page.
