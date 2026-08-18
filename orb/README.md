# 🔮 Sound Orb (3D)

Make a sound and the 3D orb swells, wobbles and shifts colour. It is **one HTML file** —
no engine, no build step, no server; the rendering is raw WebGL.

> <https://exitmaster.github.io/family/orb/>

## How to play

| Control | What it does |
|---|---|
| 🎤 Mic | Reacts to whatever is around you — voice, clapping, instruments (default) |
| 🎵 Music | Plays a music file from your device and moves with it |
| 🎹 Demo | No mic, or a quiet room? The app makes its own sound to watch |
| Slider | Sensitivity — drag right to make quiet sounds count for more |
| Colour dots | Five themes (Aurora, Lava, Candy, Deep, Gold) |
| 🕸️ | Toggle the glowing net around the orb |
| ⛶ | Fullscreen |
| ✅ Done! | Hides every control so only the orb is left. Tap ⚙️ at the top right to bring them back |

The toolbar fades out after a few seconds; touch the screen and it returns.
Theme, sensitivity and net settings are saved in the browser, so they stick between visits.

## How sound becomes shape

The signal is split with an FFT into **bass / mid / treble** energy, and those three
numbers push the sphere's vertices outward through layers of simplex noise.

| Sound | Orb |
|---|---|
| Bass (20–180 Hz) — drums, low voices | Big, slow swells |
| Mid (180–2000 Hz) — most voices, melody | Medium ridges over the surface |
| Treble (2000–9000 Hz) — cymbals, "s" sounds | Fine, fast spikes |
| Overall loudness | Inflates the orb, brightens the rim, speeds up the spin |
| A beat (bass transient above its recent average) | The orb punches outward and the orbiting motes are shoved away |

## Under the hood

- **Geometry** — an icosphere (subdivided icosahedron), so triangles stay evenly sized
  instead of bunching at the poles like a UV sphere.
- **Displacement** — done in the vertex shader with 3D simplex noise (Ashima Arts, MIT).
  Normals are rebuilt per vertex from two real neighbour samples, so the lighting follows
  the deformation instead of lagging behind it.
- **Look** — Fresnel rim light, Lambert + specular body, an additive halo behind the orb,
  a starfield background drawn on a fullscreen triangle, and 900 additive point sprites.
- **Speed** — two bodies are built up front (20,480 and 5,120 triangles). If frames start
  dropping the app switches to the coarse one automatically. The camera distance is fitted
  to the viewport aspect, so the orb never clips on a portrait phone.
- **Response** — short analyser smoothing plus asymmetric attack/release envelopes: values
  rise fast and fall slower, which keeps the punch without the flicker.

## Notes

- **The mic needs an https origin.** Opening the file directly (`file://`) blocks
  `getUserMedia`, so use the GitHub Pages link above. Music and demo modes work anywhere.
- **Privacy** — audio never leaves the browser; nothing is recorded or uploaded. The mic is
  connected only to the analyser, never to the speakers, so it cannot cause feedback.
- Deployed by GitHub Pages from the repository root on `main`.

## Verifying it

Serve the folder over http (not `file://`) and drive it headlessly with a software GL stack:

```
--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader
--use-fake-device-for-media-stream          # lets the mic path be tested
```

`window.ORB` exposes the live frame state (`mode`, `bass`, `mid`, `tre`, `level`, `beat`,
`fps`, `tris`, `clean`, …) and `window.ORB_API` exposes the mode switches, so a test can
assert the orb is really reacting rather than just that a canvas exists.
