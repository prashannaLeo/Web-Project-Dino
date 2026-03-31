# RunWithDino - Web Dev Project

RunWithDino is a multi-page web project built with HTML, CSS, and JavaScript.  
It combines a learning-focused website (Home, About, Contact) with a playable Dino runner game.

## Project Goals

- Practice semantic HTML page structure.
- Build responsive layouts with reusable CSS.
- Add interactive behavior using vanilla JavaScript.
- Implement a simple browser game loop (jump, obstacle movement, collision, score).

## Pages

- `index.html` - Home page with hero section and project highlights.
- `pages/about.html` - Team and project story page.
- `pages/contact.html` - Contact form and validation UI.
- `pages/game.html` - Dino game page with live score and controls.

## Tech Stack

- HTML5
- CSS3 (custom properties, animations, responsive media queries)
- Vanilla JavaScript (DOM APIs, localStorage, Web Audio API)

## Folder Structure

```text
web-dev-project/
  index.html
  README.md
  css/
    style.css
  js/
    script.js
  pages/
    about.html
    contact.html
    game.html
  images/
    (project assets)
```

## Game Features

- Dino jump using keyboard (`SPACE`), click, or tap.
- Obstacle (cactus) continuous movement from right to left.
- Progressive difficulty: cactus speed increases as score grows.
- Collision detection between dino and cactus.
- Game over + instant restart support.
- Score and high score display.
- High score persistence with `localStorage`.
- Lightweight jump/crash sound effects generated with Web Audio API.

## Recent Game Improvements

The game experience was updated with the following:

- Increased desktop game container size for better visibility.
- Added a stronger, visible ground/path line under the dino and cactus.
- Repositioned dino and cactus to sit clearly on the path.
- Fixed cactus spawn behavior so it starts from the origin side (off-screen right) and enters smoothly.
- Prevented sudden mid-lane cactus jumps by applying speed changes only at animation loop boundaries.

## How the Game Works

### 1) Initialization

When `pages/game.html` loads, `js/script.js`:

- Finds key elements (`#dino`, `#cactus`, score fields, game container).
- Loads high score from `localStorage`.
- Starts the game loop automatically on the game page.

### 2) Jump Logic

- Jump triggers on:
  - `SPACE` key
  - Click in game area
  - Touch in game area
- Dino receives the `animate-jump` class.
- At animation end, jump class is removed and dino horizontal offset is updated.

### 3) Obstacle Movement

- Cactus movement is handled via CSS keyframe animation (`cactus-move`).
- Base animation duration becomes shorter as score increases.
- Duration updates are staged and applied on `animationiteration` events, preventing sudden in-track repositioning.

### 4) Collision Detection

- A fast interval checks overlap of dino and cactus bounding rectangles.
- If both horizontal and vertical overlap conditions are met, game over triggers.

### 5) Score System

- Score increments every 200ms while the game is running.
- Current score and high score are zero-padded in UI.
- High score persists between sessions.

## Running the Project

This is a static web project, so no build tools are required.

### Option A: Open directly

1. Open the project folder.
2. Double-click `index.html` in your browser.

### Option B: Use a local server (recommended)

Using a local server is better for consistent browser behavior.

Example with VS Code Live Server:

1. Open project in editor.
2. Start Live Server.
3. Navigate to `index.html`.

## Controls (Game)

- `SPACE` - Jump / Restart after game over.
- Click inside game area - Jump / Restart.
- Tap inside game area (mobile) - Jump / Restart.

## Styling Notes

Game styling lives in `css/style.css` under the **Game Page** section:

- `.game-page-container`
- `.game-container`
- `#dino`
- `#cactus`
- `.ground`
- `@keyframes cactus-move`
- `@keyframes dino-jump`

Responsive game adjustments are defined in media queries for smaller screens.

## JavaScript Notes

Primary game logic is inside `js/script.js`:

- State: score, high score, game-over flag.
- Loops: collision interval + score interval.
- Input handlers: keyboard, click, touch.
- Utility: duration scaling based on score.
- Persistence: `dino_high_score`, `dino_current_score`.

## Customization Ideas

- Replace emoji characters with sprite images.
- Add multiple obstacle types and random spawn gaps.
- Add pause/resume control and game states.
- Add cloud/background parallax animation.
- Add start countdown and sound toggle.
- Add unit-style tests for helper functions.

## Team

- Kabit Khadka
- Sarjyant Maharjan
- Prashanna Dhami

## License

This project appears to be educational/coursework focused.  
Add a formal open-source license file if you plan to distribute publicly.

