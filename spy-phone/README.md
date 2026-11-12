# 🕵️📱 Spy Phone Breaker

A pretend locked phone to break into before the timer runs out. It is **one HTML file**:
no build step, no server, no internet needed once the page is open.

> <https://exitmaster.github.io/family/spy-phone/>

## The mission

The sneaky spy **Agent Sprinkles** 🧁 left their phone behind. You have **5:00** to:

| Step | What to do |
|---|---|
| 1 🔢 PIN | The lock screen wallpaper is full of little pictures. Turn on the 🔦 **UV light** and slide it over the wallpaper to find a note in invisible ink. It tells you which 4 pictures to count, in order. Each count is one digit of the PIN. |
| 2 💬 Password | The 📁 Files app is password locked. Read the chat with **Boss 🕶️** in Messages, then read the **first letter** of every text Bunny 🐰 sent. They spell the password. (Don't trust the alien 👽.) |
| 3 📁 Secret file | `TOP_SECRET.spy` has a **color lock**. 📝 Notes says the colors are the spy's lucky balloons, and 🖼️ Photos has the picture. Tap each balloon until the colors match, left to right. |

Open the file and you get the victory screen: stars, a rank (Rookie Agent → Super Sleuth →
Master Spy), your time, hints used and "oopsies".

## Timer, hints and mistakes

- A wrong PIN, password or color guess costs **5 seconds**.
- 💡 **Hint** gives up to 3 hints per step, each costing **15 seconds**. The third hint gives the answer.
  Hints you already paid for can be re-read for free.
- A penalty never takes the last second away; only the clock running out ends the game.
- The timer pauses while the tab is hidden.
- **Stars:** 3 with no hints. One hint drops it to 2. Three or more hints, or taking over 4 minutes, drops it to 1.
- The best time is saved in the browser (`localStorage`).

Every game makes **new puzzles**: a new PIN and wallpaper, a new password word with new messages,
and new balloon colors.

## Controls

- Tap/click everything. The bar at the bottom of the phone goes back to the home screen.
- Keyboard: number keys and Backspace on the lock screen, `U` toggles the UV light, `Esc` goes back.
- 🔊 turns the sound effects on and off (remembered).

Works on a phone held upright, a phone held sideways (the phone turns sideways too) and on a computer.
