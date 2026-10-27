# Sky Coin Rush

A 3D flying game in **one HTML file** (three.js from a CDN, no build step). Take off from
the home airfield and fly anywhere you like over an endless open world, as high as you
like (all the way up into space), grabbing coins that float in the sky.

> <https://exitmaster.github.io/family/sky-coin-rush/>

**It's a web app too:** on a phone, tablet or computer you can install it and open it from
your home screen like an app (on Android/Chrome tap **Install app** on the start card or
"Add to Home Screen"; on iPhone/iPad tap Share, then **Add to Home Screen**). After the
first visit it also opens without internet.

## Controls

| | |
|---|---|
| Fly (left/right turns, up climbs, down points the nose down; hold up to loop) | `↑` `↓` `←` `→` (also `W` climbs, `A` turns left) |
| Dive mode: fly into a lake and under the water | `D` or the **DIVE** button |
| Dolphin mode: jump in and out of the water | `J` or the **DOLPHIN** button |
| Fire a missile | `S` or the **FIRE** button (hold to keep firing) |
| Boost | hold `SPACE`, `SHIFT` or the **BOOST** button |
| Map: choose an airport to fly to | `M` or the **MAP** button |
| Auto-land at your chosen airport (or the nearest one) | `L` (or `Q`) or the **LAND** button |
| Landing gear up / down | `G` or the **GEAR** button |
| Flip and fly upside down | `F` or the **FLIP** button |
| Front view (see the front of the plane) / back to chase view | `C` (or `V`) or the **VIEW** button |
| Pause | `ESC` or `P` |
| Phone / tablet | drag anywhere: a joystick appears where your finger lands |

**Pilot-style controls** (on the start and pause cards) flip up and down, like a real
control stick: push down to climb.

## Planes

Pick one of the **145 planes** on the start card (your choice is remembered). The plane flying behind the menu
changes straight away so you can see it. Each one has its own speed (normal and boost)
and handling (how fast it pitches, which also sets how quick a loop is, and how fast it
turns):

| Plane | | Cruise / boost | Handling |
|---|---|---|---|
| **Red Cub** | the all-rounder | 126 / 292 kt | medium |
| **Barnstormer** | yellow biplane | 107 / 233 kt | very loopy, turns fast |
| **Puffin** | seaplane on floats: **lands on lakes** | 117 / 253 kt | gentle |
| **Zippy** | stunt plane | 136 / 311 kt | fastest loops and turns |
| **Feather** | glider with very long wings, almost silent | 87 / 185 kt | gentle |
| **Hauler** | big cargo plane with two propellers | 117 / 243 kt | slow to turn |
| **Swift** | jet, afterburner flame when boosting | 185 / 428 kt | medium |
| **Thunder** | twin-tail fighter, two flames, **breaks Mach 1** | 214 / 739 kt | quick |
| **Shadow** | black stealth flying wing, **breaks Mach 1** | 194 / 729 kt | medium |
| **Jumbo** | four-engine airliner | 175 / 389 kt | slowest to turn |
| **Rocket** | space plane, three engines always glowing, **breaks Mach 1** | 233 / 836 kt | gentle |
| **Saucer** | a UFO with a little green alien inside | 156 / 389 kt | very quick |
| **Pelican** | flying boat with two engines: **lands on lakes** | 117 / 253 kt | slow to turn |
| **Otter** | green bush plane on floats: **lands on lakes** | 121 / 272 kt | medium |
| **Firebird** | red and yellow water bomber: **lands on lakes** | 126 / 262 kt | gentle |
| **Ducky** | a rubber duck with a propeller beanie: **lands on lakes** | 107 / 243 kt | quick |
| **Whirly** | helicopter with a spinning rotor and tail rotor | 107 / 233 kt | quick |
| **Bubbles** | slow, floaty pink blimp | 68 / 136 kt | slowest |
| **Origami** | a paper plane, silent | 97 / 194 kt | quick |
| **Kite** | tiny hang-glider with a motor | 78 / 165 kt | quick |
| **Ace** | old-time fighter with a big four-blade propeller | 175 / 408 kt | quick |
| **Zoom** | flying car with jets | 146 / 350 kt | quick |
| **Arrow** | needle-nosed supersonic jet, **breaks Mach 1** | 272 / 758 kt | slow to turn |
| **Comet** | starfighter with X-shaped wings, **breaks Mach 1** | 253 / 797 kt | very quick |
| **Dragon** | green dragon with red wings, **breathes fire when boosting** | 136 / 330 kt | quick |
| **Bee** | buzzy bumblebee with see-through wings | 97 / 233 kt | very quick |
| **Shark** | shark-shaped jet with teeth: **lands on lakes** | 194 / 505 kt | quick |
| **Retro** | old-style rocket ship, **breaks Mach 1** | 253 / 836 kt | medium |
| **Penguin** | penguin with a jetpack: **lands on lakes** | 117 / 292 kt | very quick |
| **Mega** | giant six-engine cargo jet | 156 / 350 kt | slowest to turn |
| **Triple** | red triplane with three wings | 107 / 233 kt | very loopy |
| **Swan** | graceful white swan: **lands on lakes** | 107 / 233 kt | medium |
| **Unicorn** | flying unicorn with a golden horn and a rainbow tail | 126 / 311 kt | quick |
| **Balloon** | hot-air balloon; the burner flame roars when boosting | 58 / 126 kt | slowest |
| **Owl** | big-eyed owl, almost silent | 87 / 214 kt | very quick |
| **Butterfly** | blue and orange butterfly | 68 / 165 kt | very quick |
| **Coast Guard** | red rescue helicopter on floats: **lands on lakes** | 107 / 233 kt | quick |
| **Racer** | gold air racer | 233 / 544 kt | very quick |
| **Ptero** | pterodactyl with a head crest and huge wings | 117 / 292 kt | quick |
| **Bus** | yellow school bus with wings and two propellers | 117 / 272 kt | slow to turn |
| **Hog** | tough green jet with two engines on its back | 165 / 389 kt | medium |
| **Eagle** | bald eagle, almost silent | 136 / 350 kt | quick |
| **Pizza** | a flying slice of pepperoni pizza with a propeller | 107 / 253 kt | quick |
| **Tiger** | orange striped jet with eyes, ears and teeth | 204 / 505 kt | quick |
| **Sleigh** | a sleigh full of presents pulled by four flying reindeer (one with a red nose) | 107 / 272 kt | medium |
| **Gyro** | autogyro with a big spinning rotor and a propeller behind | 97 / 224 kt | medium |
| **Bat** | night bat with pointy ears and fangs | 97 / 243 kt | very quick |
| **Whale** | big blue flying whale with a water spout: **lands on lakes** | 87 / 214 kt | slow to turn |
| **Octo** | big airliner, 8 engines in four pairs, 300 passengers, **breaks Mach 1** | 214 / 768 kt | slow to turn |
| **Starliner** | delta-wing airliner, 8 engines, 250 passengers, **breaks Mach 1** | 233 / 797 kt | slowest to turn |
| **Hydra** | purple jet with a block of 8 engines at the back, 40 passengers, **breaks Mach 1** | 253 / 836 kt | quick |
| **Spider** | black spider with a jet on each of its 8 legs and passengers in its glass head, **breaks Mach 1** | 194 / 768 kt | very quick |
| **Halo** | flat ring with 8 engines round it and a glass cabin, **breaks Mach 1** | 224 / 797 kt | quick |
| **Manta** | manta ray flying wing with 8 engines on its back, **breaks Mach 1** | 233 / 807 kt | medium |
| **Blaster** | rocket ship with 8 booster rockets, **breaks Mach 1** | 253 / 865 kt | medium |
| **Skyhawk** | white and blue high-wing trainer | 121 / 272 kt | medium |
| **Commuter** | twin-propeller airliner, 50 passengers | 146 / 321 kt | slow to turn |
| **Lear** | little business jet with a T-tail | 224 / 505 kt | medium |
| **Concorde** | needle-nosed airliner, 100 passengers, **breaks Mach 1** | 292 / 875 kt | slow to turn |
| **Blackbird** | long black spy jet, **breaks Mach 1** | 311 / 894 kt | slow to turn |
| **Osprey** | tilt-rotor with huge propellers on its wingtips | 136 / 311 kt | medium |
| **Twin Rotor** | helicopter with two big rotors | 107 / 233 kt | medium |
| **Jump Jet** | jet with swivelling nozzles | 194 / 486 kt | quick |
| **Spitfire** | old fighter with oval wings | 185 / 428 kt | quick |
| **Zeppelin** | long silver airship, 40 passengers | 58 / 126 kt | slowest |
| **Catalina** | flying boat with floats on its wingtips: **lands on lakes** | 113 / 243 kt | slow to turn |
| **Jetpack** | fly like a superhero | 87 / 233 kt | very quick |
| **Broomstick** | a witch and her black cat | 97 / 233 kt | very quick |
| **Magic Carpet** | flying carpet with three passengers | 78 / 194 kt | quick |
| **Fluffy** | a smiling cloud | 68 / 165 kt | medium |
| **Balsa** | toy plane with a rubber band | 78 / 185 kt | quick |
| **Pumpkin** | flying jack-o-lantern | 87 / 204 kt | quick |
| **Teacup** | a flying cup of tea on its saucer | 68 / 175 kt | quick |
| **Banana** | rocket banana in sunglasses | 136 / 330 kt | quick |
| **Shuttle** | space shuttle, **breaks Mach 1** | 253 / 855 kt | slow to turn |
| **Hexa** | ball cockpit between two hexagon wings | 175 / 428 kt | very quick |
| **Dove** | white dove with an olive branch | 97 / 233 kt | very quick |
| **Parrot** | rainbow parrot | 107 / 253 kt | very quick |
| **Flamingo** | pink flamingo with long legs: **lands on lakes** | 97 / 233 kt | quick |
| **Goose** | honk! **lands on lakes** | 107 / 253 kt | quick |
| **Dolphin** | flying dolphin: **lands on lakes** | 136 / 330 kt | quick |
| **Fire Truck** | fire engine with wings and a ladder | 107 / 253 kt | slow to turn |
| **Tractor** | farm tractor with a propeller | 87 / 204 kt | medium |
| **Lightning** | stealth fighter with a gold canopy, **breaks Mach 1** | 233 / 778 kt | quick |
| **Delta Dart** | delta-wing jet with a red fin, **breaks Mach 1** | 243 / 816 kt | quick |
| **Superjumbo** | double-decker airliner, 550 passengers | 175 / 389 kt | slowest to turn |
| **Crop Duster** | yellow farm plane with a big round engine | 117 / 272 kt | quick |
| **Hot Dog** | a hot dog with mustard | 87 / 214 kt | quick |
| **Donut** | pink icing, sprinkles and a passenger in the hole | 78 / 194 kt | quick |
| **Pencil** | rocket pencil with an eraser | 146 / 369 kt | quick |
| **Submarine** | yellow submarine with wings: **lands on lakes** | 87 / 214 kt | slow to turn |
| **Ladybug** | red with black spots | 87 / 214 kt | very quick |
| **Dragonfly** | four see-through wings | 126 / 311 kt | very quick |
| **Seagull** | grey gull wings: **lands on lakes** | 107 / 253 kt | quick |
| **Phoenix** | fire bird, flames when boosting, **breaks Mach 1** | 214 / 768 kt | quick |
| **Taxi** | flying yellow cab | 107 / 253 kt | medium |
| **Ice Cream** | three scoops and a cherry | 78 / 194 kt | quick |
| **Snowman** | with a carrot nose and a propeller hat | 78 / 194 kt | quick |
| **Twin Mustang** | two fighters joined by one wing | 194 / 447 kt | medium |
| **Trimotor** | old three-engine airliner | 107 / 233 kt | slow to turn |
| **Turtle** | slow and steady: **lands on lakes** | 68 / 156 kt | medium |
| **Octopus** | eight arms streaming behind: **lands on lakes** | 87 / 214 kt | quick |
| **Hummingbird** | tiny, turns super fast | 117 / 292 kt | very quick |
| **X-Plane** | black rocket plane, **breaks Mach 1** | 330 / 933 kt | slow to turn |
| **Flying Train** | steam engine with wings, 30 passengers | 97 / 233 kt | slow to turn |
| **Beluga** | smiling whale-shaped cargo jet | 165 / 369 kt | slow to turn |
| **Viper** | fighter jet with a bubble canopy, **breaks Mach 1** | 243 / 797 kt | quick |
| **Raptor** | stealth fighter with a gold canopy, **breaks Mach 1** | 253 / 826 kt | quick |
| **Flying Pig** | when pigs fly! | 87 / 214 kt | quick |
| **Cow** | a spotty cow with a jetpack | 87 / 224 kt | medium |
| **Puppy** | dog in flying goggles | 97 / 233 kt | quick |
| **Super Kitty** | cat in a red cape | 107 / 262 kt | very quick |
| **Robot** | robot on rocket boots | 136 / 350 kt | quick |
| **Burger** | cheeseburger with everything | 78 / 194 kt | quick |
| **Cupcake** | pink frosting and a cherry | 68 / 175 kt | quick |
| **Star** | a smiling star | 117 / 311 kt | quick |
| **Planet** | tiny ringed planet with an astronaut | 97 / 253 kt | medium |
| **Satellite** | solar panels and a dish | 117 / 292 kt | medium |
| **Lunar Lander** | moon lander on four legs | 78 / 194 kt | medium |
| **Bathtub** | with bubbles and a rubber duck: **lands on lakes** | 68 / 165 kt | medium |
| **Jellyfish** | glowing jellyfish: **lands on lakes** | 68 / 165 kt | quick |
| **Flying Fish** | really flies: **lands on lakes** | 126 / 311 kt | quick |
| **Sofa** | flying couch for three | 68 / 165 kt | medium |
| **Sneaker** | giant shoe with wings | 97 / 233 kt | quick |
| **Skateboard** | a kid on a rocket skateboard | 117 / 292 kt | very quick |
| **Tri-Jet** | airliner with an engine in its tail, 250 passengers | 185 / 418 kt | slow to turn |
| **Swing Wing** | twin-tail fighter, **breaks Mach 1** | 253 / 816 kt | quick |
| **Solar Plane** | very long wings full of solar panels | 68 / 156 kt | slow to turn |
| **Police Copter** | helicopter with flashing lights | 107 / 243 kt | quick |
| **Pirate Ship** | flying ship with sails and a black flag: **lands on lakes** | 78 / 185 kt | slow to turn |
| **Rowboat** | two people, oars and a little motor: **lands on lakes** | 68 / 165 kt | medium |
| **Flying House** | a little house lifted by balloons | 58 / 136 kt | slow to turn |
| **Umbrella** | float away under an umbrella | 58 / 146 kt | medium |
| **Bubble** | a passenger inside a giant soap bubble | 58 / 146 kt | medium |
| **Present** | a gift box with a big bow | 87 / 214 kt | quick |
| **Taco** | crunchy flying taco | 87 / 214 kt | quick |
| **Pineapple** | spiky pineapple | 87 / 214 kt | quick |
| **Watermelon** | a slice of watermelon | 87 / 214 kt | quick |
| **Carrot Rocket** | crunchy and fast | 156 / 389 kt | quick |
| **Dino** | T-rex with a jetpack | 107 / 272 kt | quick |
| **Turbo Snail** | a snail with a rocket | 175 / 486 kt | quick |
| **Toucan** | big orange beak | 107 / 253 kt | very quick |
| **Firefly** | glowing tail | 87 / 214 kt | very quick |
| **Mothership** | giant UFO full of aliens, 50 passengers, **breaks Mach 1** | 194 / 778 kt | medium |
| **Hoverboard** | a kid on a floating board | 117 / 292 kt | very quick |

**Lake planes** (Puffin, Pelican, Otter, Firebird, Ducky, Shark, Penguin, Swan, Coast Guard, Whale, Catalina, Flamingo, Goose, Dolphin, Submarine, Seagull, Turtle, Octopus, Bathtub, Jellyfish, Flying Fish, Pirate Ship, Rowboat) can land on and take off from any
lake as well as runways. **Supersonic planes** (Thunder, Shadow, Rocket, Arrow, Comet, Retro, the seven 8-engine planes, Concorde, Blackbird, Shuttle, Lightning, Delta Dart, Phoenix, X-Plane, Viper, Raptor, Swing Wing and Mothership) go
faster than the speed of sound when boosted: a MACH readout appears above Mach 0.7, and
crossing Mach 1 (about 667 kt) sets off a **SONIC BOOM** (+100) with a boom, a shake and a
white vapour cone round the plane. Bubbles, Origami, Retro, Balloon, Pizza, Sleigh, Blaster and the floats/hulls of the lake planes don't fold up.

## Flying

- **Takeoff.** You start on the home airfield's runway. The plane speeds up by itself;
  when it says **Climb!** hold up to lift off.
- **Fly anywhere.** Left/right banks the plane into a turn; up/down pitches the nose to
  climb or dive. Let go and the nose slowly levels out.
- **Loops.** There's no limit on how far the nose can go: keep holding up and the plane
  flies right over the top, upside down, and round to level again (+200 for each full
  loop). The camera follows you round. Let go while upside down and the plane rolls back
  right way up by itself.
- **Upside down.** Press **F** (or FLIP) and the plane rolls over and stays on its back,
  with the world still the right way up on screen. Up still climbs and left/right still
  turn the way you'd expect. Flying upside down earns +5 points a second. Press F again
  to roll back. You have to be right way up to land.
- **Front view.** Press **C** (or VIEW) and the camera jumps out in front of the plane,
  looking back at its nose, so you can see the front of your plane (and its face, if it
  has one) as it flies towards you. Press C again for the normal view from behind.
- **Landing gear.** Press **G** (or GEAR) in the air to fold the wheels (or skids, or the
  saucer's legs) away: the plane flies about 8% faster. Land with the gear up and it's a
  belly-landing crash; low over an airport the screen warns "Gear is up! Press G".
  Auto-land puts the gear down for you. The Puffin's floats don't fold up.
- **The world** never ends: rolling hills, lakes, forests and snowy mountain ranges in
  every direction, criss-crossed by a grid of roads every 420 m (bridges over the lakes) with **traffic** (cars that
  keep to their lane and turn at the crossroads; bump one in the rental car and it's a bonk)
  and filled with a **city**: thousands of buildings with windows between the roads, from low
  houses to skyscrapers downtown (none on water, steep slopes or near airports, and only low
  ones under the approach paths). Fly into one and it's a crash, with clouds between about 1,200 and 4,300 ft. The sky darkens and the
  haze clears as you climb. **There's no altitude limit**: above about 20,000 ft the sky
  keeps darkening to black and the stars come out, and there are call-outs at 10,000 ft,
  30,000 ft (as high as a jumbo jet), 100,000 ft and 328,000 ft (space!). The sky also moves from morning to noon to golden hour to dusk as you
  fly.
- **HUD:** altitude (ft), airspeed (kt), a MACH readout near the speed of sound, compass heading (HDG, 000 =
  north) and an airport chip: its name, distance and an arrow pointing to it (your chosen
  destination, or else the nearest airport).
- **Coins and orange rings** float in clusters all around you, some of them high in the
  sky. Coins are 10 points each; grab them less than about a second apart to build a
  chain (every 5 in a row adds one to the multiplier, up to x5). Rings give a 3-second
  boost and +50.
- **Other planes:** 59 computer-flown planes from the plane list cruise around you, flying
  between airports and over the hills at a safe height. Fly within about 45 m of one for a
  **close fly-by** (+25). They can't crash into you.
- **Passengers and announcements.** Every plane is a passenger plane: from 1 passenger
  (Origami, Kite, Bee, Owl…) up to 400 in the Jumbo, and a PAX chip shows how many. The captain makes announcements with a ding-dong,
  a caption above the buttons and (with sound on) a clear British voice (or another English
  voice if the device has no British one; with no English voice at all, just the caption): welcome aboard at takeoff,
  reaching cruising height, breaking the sound barrier, loops, flying upside down, missile
  warnings and the descent into an airport. Land at an airport and the passengers clap,
  with a bonus of one point for every 5 passengers.
- **Diving under the water.** Press **D** (or DIVE) for dive mode, then fly into any lake:
  instead of splashing, the plane plunges in (+50) and flies under the water. Everything
  turns blue, bubbles stream out behind you, little fish swim in circles, the engine sounds
  muffled and a chip shows how deep you are. The water slows you down and you can't go
  through the lake bed. Pull up to burst back out into the air. Hitting the shore under
  the water is a crash. In dive mode you can't land on lakes, so press D again to turn it
  off.
- **Dolphin mode.** Press **J** (or DOLPHIN) and fly low over a lake: the plane leaps in
  and out of the water all by itself, like a dolphin, a few metres under and a few metres
  over (+10 for every jump). You still steer left and right. Near the shore it stays on
  top of the water so you don't hit it. Press J again to stop.
- **Missiles:** press **S** (or tap FIRE) to fire a missile from under a wing. A red
  ring marks its target: the other plane nearest the middle of your view, or if none is
  in front of you, the closest one (even behind you: the missile turns round). The
  missile chases that plane and blows it up (+150). Don't worry, the pilot floats down on
  a parachute, and a new plane turns up somewhere else. If its plane is shot down first,
  the missile goes after another one. Missiles leave a smoke trail and explode if they
  hit the ground.
- **They fire back** (only once you've shot at them): the plane you fire at shoots a
  missile straight back, and its two nearest wingmen chase you and fire every few seconds
  for 30 seconds. Their dark missiles with yellow tips chase you less nimbly than yours:
  a MISSILE! warning flashes and beeps, so turn hard or boost to get away. Getting hit
  counts as a crash (you're put back in the air) and everyone calms down again.
- **Crashing** into a hill or the water doesn't end anything: after a moment the plane is
  put back in the air 220 m above the spot.
- Pause and press **End flight** to go back to the start card, where the plane keeps
  cruising over the hills.
- **No fuel limit:** fly and boost as long as you like.
- **Nothing resets:** your coins, score and the airports you've visited carry over
  from flight to flight and stay saved in the browser.

## Ride as a passenger

Press **Ride as a passenger** on the start card and be a passenger instead of the pilot.
Walk with the arrows (or drag on a touch screen); press **SPACE** (or the big button) when
there's something to do. A checklist in the corner shows what's next:

1. **Book a flight at TICKETS.** You arrive by taxi outside the terminal, with a suitcase
   and a purple carry-on backpack. At the ticket counter choose where to go (every
   airport for about 25 km around, with its distance and direction) and which plane (any
   of them!), and get a **boarding pass** with your flight number, gate and window seat.
2. **Drop off your suitcase at BAG DROP.** It gets a tag and rides away on a belt.
3. **Go through SECURITY.** Walk through the metal detector (beep beep, all clear) while
   your carry-on rides through the X-ray machine, then you pick it up again. It won't let
   you through without a pass and with your suitcase still in your hand.
4. **Show your pass to the crew.** Go out through GATE 1 to your plane, parked on the apron
   with stairs up to its door. Other planes are parked at the other gates, and one taxis
   back and forth behind yours.
5. **Stow your carry-on.** Walk down the aisle to your row (your seat is gold, with a red
   arrow over it) and put your backpack in the overhead bin. The cabin is as big as the
   plane: 6 seats a row, as many rows as it needs, full of as many other passengers as it
   carries (in a one-seat plane you're on your own).
6. **Sit down** in your seat.
7. **Fasten your seatbelt.** The captain welcomes you aboard, then the plane rolls down the
   runway, takes off and the autopilot flies you to the airport you booked and lands.
   You watch from your **window seat**, with a seatbelt sign that lights up for takeoff and
   landing. Look all the way round (360°) with the arrows (or W, A, D) or by dragging: your
   own plane is hidden in this view so nothing is in the way. VIEW (or C) swaps to the view
   from outside. Press **B** (or BATHROOM) to go to the plane's bathroom while
   the seatbelt sign is off: flush the toilet (whoosh!), wash your hands, then go back to
   your seat. The flight carries on meanwhile, and if the seatbelt sign comes on you're
   asked to go back. Now and then at cruise height the
   plane hits **turbulence**: everything shakes and bumps, the seatbelt sign dings on and
   the captain asks everyone to sit down and buckle up, until the air is smooth again.

After landing you walk into the **arrivals hall**: wait at the **baggage claim** belt for
your blue suitcase to come round, grab it, and walk out through the **EXIT** to the curb.
There, press **R** to **rent a car** (up to 210 km/h, in any of 9 colours: press **C** or COLOR to switch, at the curb or while driving; crash it into a car or a building and you pay a **1,000-coin repair fee**) and drive it yourself (arrows / WASD or drag) along
the road to a **hotel** about a kilometre away (the road grid and its bridges are all
drivable too), with its distance and direction shown (you can't drive
into lakes; PARK stops any time), or **T** to call a **taxi**, which drives you there by
itself. At the hotel you walk around your **room**: lie down on the bed and **sleep**
(the lights go out and the window turns to night with stars and a moon, then it's
morning), go to the **bathroom** through its door (or press **B**) to flush the toilet,
wash your hands and take a shower, and **check out** through the room door. After checking
out you can **drive around the city** in your rental car as long as you like (PARK when
you're done). To fly again you have to **drive to an airport**: the panel shows the
nearest one, and once you're on its field tap **GO INTO THE AIRPORT** (or SPACE) to walk
into its terminal and book your next flight. Then book
another flight from there, or go back to the menu. The terminal, gate and arrivals hall
are busy with other travellers walking about, queueing and sitting at the gate.

## Airports

The world has airports everywhere: one in most 3 km squares of an endless grid (so there's nearly always one within a couple of km), each with
its own name (Pine Valley, Otter Bay, Snowcap…) and its runway pointing its own way. You
start at **Home Field**. The ground around each one is flattened into a meadow: an airport
on a lake becomes an island strip, and one on a mountain sits on a high plateau (up to
about 3,000 ft or more). An airport is only placed where its approach and climb-out are
clear of hills (it tries up to six runway directions). Every airport has a tall light **beacon** beside its runway that the haze
doesn't hide: yellow at Home Field, teal everywhere else.

## Landing

- **Land anywhere on an airport's meadow**, not just the runway. Below 80 m over it the
  screen says "*Airport name* below". The first landing at a new airport gives
  "Welcome to *name*! +400"; landing again gives +100 (once per 5 seconds). With the
  lake planes you can also land on any lake ("Splashdown!") and take off from it again;
  any other plane that hits the water splashes.
- After touching down the brakes stop the plane by themselves; hold up to roll again and
  take off.
- **Choose where to go:** tap **MAP** (or press `M`). The game pauses and lists the
  airports around you, closest first, with distance, direction, height and a ✓ for ones
  you've landed at. Tap one to make it your destination: its beacon turns red, the
  airport chip turns red, and a big arrow above the buttons points the way with the
  distance, so you can fly there yourself. Landing there gives "You made it to *name*!"
  and +200 extra. "Nearest airport" clears it.
- **Auto-land:** tap **LAND** (or press `L`) and the plane flies to **your destination**
  (or, with none chosen, the nearest airport), boosting when it's far away unless high
  ground is ahead. It lines up 1.6 km out with that airport's runway, puts the gear down,
  follows a 6% glide path and lands. The HUD shows where it's going.
  Steer yourself, or tap LAND again, to take back control.

## Saved in the browser

Your coins, score, visited airports, plane, the pilot-style control setting and sound on/off are kept in `localStorage`.
