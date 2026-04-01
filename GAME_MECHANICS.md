# Dino Run Game - Beginner's Guide to Game Mechanics

## Overview
The Dino Run game is a simple endless runner where a dinosaur jumps over cacti to avoid collisions. The game gets faster as you score more points. This guide explains every part of the code in simple terms so you can understand how it works and even modify it yourself!

---

## 1. Game Controls

### Desktop
- **SPACE BAR**: Make the dinosaur jump
- **Click/Tap on game area**: Also makes the dinosaur jump or restarts after game over

### Mobile
- **Tap anywhere on game area**: Jump or restart

---

## 2. How Jumping Works

### The Jump Animation
When you press SPACE or tap, the game triggers a jump. Here's the JavaScript code with detailed explanations:

```javascript
function jump() {
    // Line 26: Check if dinosaur is already jumping
    // dino.classList.contains("animate-jump") returns true if the "animate-jump" CSS class is present
    // This prevents the player from jumping twice while already in the air (no double jump!)
    if (dino.classList.contains("animate-jump")) return;
    
    // Lines 28-31: Calculate how far forward the dinosaur will land
    // getSpeedLevel(score) returns how many "speed levels" we've reached (score / 20)
    // Example: score = 45 → speedLevel = 2 (Math.floor(45/20) = 2)
    // jumpForwardPx = minimum 10px + (speedLevel × 2px), but never more than 34px
    // This means the dinosaur jumps slightly farther as the game speeds up!
    const speedLevel = getSpeedLevel(score);
    const jumpForwardPx = Math.min(34, 10 + speedLevel * 2);
    
    // Line 31: Store the jump distance in a CSS custom property
    // This allows the CSS animation to use this value if needed
    dino.style.setProperty("--jump-forward", `${jumpForwardPx}px`);
    
    // Line 33: Add the "animate-jump" class to start the CSS jump animation
    dino.classList.add("animate-jump");
    
    // Line 34: Play a jump sound effect using Web Audio API
    playJumpSound();
    
    // Lines 36-45: Set up a cleanup function that runs when the animation finishes
    const onAnimationEnd = (event) => {
        // Check which animation ended (in case multiple animations are playing)
        if (event.animationName === "dino-jump") {
            // Line 39: Remove the "animate-jump" class so the dinosaur can jump again
            dino.classList.remove("animate-jump");
            
            // Lines 41-42: Move the dinosaur forward permanently
            // dinoOffsetXPx tracks total forward distance from start
            // We add the jump distance to it
            dinoOffsetXPx += jumpForwardPx;
            // Update the dinosaur's left position (starting position + total offset)
            dino.style.left = `${dinoStartLeftPx + dinoOffsetXPx}px`;
            
            // Line 43: Clean up the event listener to prevent memory leaks
            // This is important! We only want this function to run once per jump
            dino.removeEventListener("animationend", onAnimationEnd);
        }
    };
    
    // Line 46: Attach the cleanup function to the animationend event
    // When the CSS animation finishes, onAnimationEnd will be called automatically
    dino.addEventListener("animationend", onAnimationEnd);
}
```

**Key Points:**
- **No double jump**: The `animate-jump` class prevents jumping while already in the air
- **Progressive difficulty**: Jump distance increases slightly (10-34px) as speed increases
- **CSS animation**: The actual visual jump is done by CSS (smoother and more efficient)
- **Forward movement**: After landing, the dinosaur moves forward permanently, making the game progressively harder
- **Event cleanup**: The `animationend` listener is removed after use to avoid memory issues

### CSS Jump Animation
The CSS handles the actual visual jumping:

```css
@keyframes dino-jump {
    /* At the start (0%) and end (100%), dinosaur is on the ground */
    0%, 100% { bottom: 0; }
    /* At the midpoint (50%), dinosaur is at peak height (100px above ground) */
    50% { bottom: 100px; }
}
```

**How it works:**
- The animation automatically interpolates between these keyframes
- 0% → 50%: dinosaur rises from ground to peak
- 50% → 100%: dinosaur falls from peak back to ground
- The animation duration is defined elsewhere (typically around 300-500ms)

---

## 3. How Collision Detection Works

Collision detection is the heart of the game - it's how the game knows when the dinosaur hits a cactus. The game checks for collisions **50 times per second** (every 20 milliseconds) using a `setInterval` loop.

### The Code Explained Line by Line

```javascript
// Line 207: Create a repeating timer that runs every 20 milliseconds
collisionInterval = setInterval(() => {
    // Lines 208-209: Get the current position and size of both elements
    // getBoundingClientRect() returns an object with properties:
    // - top, left, right, bottom: pixel positions relative to viewport
    // - width, height: dimensions in pixels
    // These values update automatically as elements move
    const dinoRect = dino.getBoundingClientRect();
    const cactusRect = cactus.getBoundingClientRect();
    
    // Lines 76-78: Check if the two rectangles overlap horizontally
    // This is the "X-axis" collision check
    const horizontallyOverlapping =
        // Condition 1: Dinosaur's right edge (minus 10px) is to the RIGHT of cactus's left edge
        // The "-10" creates a 10-pixel "forgiveness buffer" - you don't need to clear it completely
        dinoRect.right - 10 > cactusRect.left &&
        // Condition 2: Dinosaur's left edge (plus 10px) is to the LEFT of cactus's right edge
        // The "+10" adds buffer on the left side too
        dinoRect.left + 10 < cactusRect.right;
    
    // Lines 80-81: Check if they're at similar heights (Y-axis)
    // We compare the bottom positions of both elements
    // Math.abs() gives us the absolute difference (always positive)
    // If the difference is less than 40 pixels, they're close enough vertically to be a collision
    const verticallyClose = Math.abs(dinoRect.bottom - cactusRect.bottom) < 40;
    
    // Lines 83-85: If BOTH conditions are true AND the game isn't already over, trigger game over
    // The && operator means "AND" - both must be true
    if (horizontallyOverlapping && verticallyClose && !isGameOver) {
        gameOver();  // Call the gameOver function
    }
}, 20);  // Run this check every 20 milliseconds
```

### Visual Explanation of Collision Detection

```
Horizontal Check (X-axis):
┌─────────────────┐    ┌─────────────────┐
│     Dinosaur    │    │     Cactus      │
│  left    right  │    │  left    right  │
└─────────────────┘    └─────────────────┘

Collision happens when:
1. dino.right - 10 > cactus.left  (dino's right passes cactus's left)
2. dino.left + 10 < cactus.right  (dino's left is before cactus's right)

Vertical Check (Y-axis):
    Ground
──────┼─────────────────────
      │         ▲
      │         │ dino.bottom
      │    ▲    │
      │    │ cactus.bottom
      │    ▼    │
──────┼─────────────────────

Collision when: |dino.bottom - cactus.bottom| < 40px
```

### Why the 10-Pixel Buffer?

Game developers often add a "forgiveness buffer" to collision detection because:
- **Fairness**: Players feel frustrated if they barely miss but still die
- **Pixel perfection is hard**: It's difficult to judge exact boundaries in fast-paced games
- **Better UX**: A small buffer makes the game feel more generous and fun

In this game, the 10-pixel buffer on each side means the dinosaur can be up to 10 pixels inside the cactus before it counts as a hit.

### Performance Note

- `getBoundingClientRect()` forces the browser to recalculate element positions
- Running it 50 times per second (every 20ms) is acceptable for simple games
- For complex games with many objects, developers use more optimized methods like:
  - Spatial partitioning (dividing the game world into grids)
  - Circle-based collision (faster math)
  - Canvas-based games with manual position tracking

---

## 4. How Scoring and Levels Work

### Score Increment - The Game Loop

The game uses a separate timer to track score, independent of the cactus movement:

```javascript
// Line 222: Create a timer that runs every 200 milliseconds (5 times per second)
scoreInterval = setInterval(() => {
    // Line 224: Check if the game is still active (not game over)
    if (!isGameOver) {
        // Line 225: Increment score by 1 point
        // This happens automatically every 200ms, so:
        // - 5 points per second
        // - 300 points per minute
        score += 1;
        
        // Line 226: Update the visual score display on the page
        updateScoreDisplay();
        
        // Lines 228-229: Calculate the new cactus speed based on current score
        // This doesn't change the speed immediately - it sets a "pending" value
        // The actual speed change happens on the next cactus animation cycle
        pendingCactusDurationMs = getCactusDurationForScore(score);
    }
}, 200);  // 200ms = 0.2 seconds
```

**Important Note**: The score timer and collision detection timer run independently. This is a common game development pattern:
- **Collision loop** (20ms): Fast, responsive, checks for hits
- **Score loop** (200ms): Slower, tracks time-based scoring

### Understanding Speed Levels

```javascript
function getSpeedLevel(currentScore) {
    // Math.floor() rounds down to the nearest integer
    // Example: Math.floor(45 / 20) = Math.floor(2.25) = 2
    // Every 20 points = 1 speed level
    // Score 0-19 → level 0
    // Score 20-39 → level 1
    // Score 40-59 → level 2
    return Math.floor(currentScore / 20);
}
```

**What's a "speed level"?**
- It's a way to group scores into difficulty tiers
- Each level makes the cactus move faster
- Level 0 (score 0-19): Slowest speed
- Level 1 (score 20-39): Slightly faster
- And so on...

### The Speed Formula Explained

```javascript
function getCactusDurationForScore(currentScore) {
    // Step 1: Calculate current speed level
    const speedLevel = getSpeedLevel(currentScore);
    
    // Step 2: Calculate new animation duration
    // Formula: newDuration = baseDuration - (level × stepSize)
    // Example at score 45 (level 2):
    //   newDuration = 2200 - (2 × 120) = 2200 - 240 = 1960ms
    const calculatedDuration = cactusBaseDurationMs - speedLevel * cactusDurationStepMs;
    
    // Step 3: Ensure we don't go below minimum speed
    // Math.max() returns the larger of two values
    // This caps the speed - cactus can't move faster than 600ms per cycle
    return Math.max(
        cactusMinDurationMs,  // 600ms (minimum allowed)
        calculatedDuration    // Our calculated speed (could be lower than 600)
    );
}
```

**Speed Progression Table:**

| Score Range | Speed Level | Cactus Duration | Speed Change |
|-------------|-------------|-----------------|--------------|
| 0 - 19      | 0           | 2200ms          | Slowest      |
| 20 - 39     | 1           | 2080ms          | -120ms       |
| 40 - 59     | 2           | 1960ms          | -120ms       |
| 60 - 79     | 3           | 1840ms          | -120ms       |
| ...         | ...         | ...             | ...          |
| 100+        | 5+          | 1600ms+         | Continues    |
| **Max Speed** | -         | **600ms**       | Fastest      |

**How long to reach max speed?**
- To reach 600ms: `2200 - (level × 120) = 600`
- Solve: `level = (2200 - 600) / 120 = 1600 / 120 = 13.33`
- So at **level 14** (score 280+), cactus reaches minimum duration of 600ms

### Why Use Animation Duration?

The cactus moves using a CSS animation that slides it from right to left. By changing the `animation-duration` property:
- **Longer duration** (2200ms) = cactus moves slowly = easier game
- **Shorter duration** (600ms) = cactus moves quickly = harder game

This is an efficient way to control game speed without complex physics calculations!

---

## 5. How the Cactus Movement Works

The cactus moves using CSS animations that are dynamically adjusted as the game progresses. This is a clever approach that combines CSS performance with JavaScript control.

### Starting the Cactus

```javascript
// In the startGame() function:
cactus.classList.add("cactus-moving");
```

When the `cactus-moving` class is added, the CSS animation starts automatically:

```css
.cactus-moving {
    animation: cactus-move linear infinite;
}
```

### The CSS Animation

```css
@keyframes cactus-move {
    /* Start position: cactus is completely off-screen to the right */
    from { right: -50px; }
    /* End position: cactus is completely off-screen to the left (100% of container width) */
    to { right: 100%; }
}
```

**Visual representation:**
```
Game Container (width: 100%)
┌─────────────────────────────────────────┐
│                                         │
│                    🌵                    │
│  (starts here at -50px)                 │
│                                         │
│                              🌵         │
│                    (ends at 100%)       │
│                                         │
└─────────────────────────────────────────┘
```

### Dynamic Speed Adjustment

The clever part: changing the animation duration on the fly:

```javascript
// This code runs once when the page loads (in DOMContentLoaded)
cactus.addEventListener("animationiteration", () => {
    // "animationiteration" fires every time the animation completes one cycle
    // (i.e., when cactus moves from right to left)
    
    // Convert the pending duration to a CSS string (e.g., "1960ms")
    const targetDuration = `${pendingCactusDurationMs}ms`;
    
    // Only update if the duration has changed (avoid unnecessary work)
    if (cactus.style.animationDuration !== targetDuration) {
        // This changes the speed for the NEXT cycle
        cactus.style.animationDuration = targetDuration;
    }
});
```

**How the speed update cycle works:**

1. **Game starts**: `pendingCactusDurationMs` = 2200ms (slow)
2. **Cactus animation begins** with 2200ms duration
3. **Cactus completes one cycle** (takes 2200ms) → `animationiteration` event fires
4. **Event handler checks**: Has `pendingCactusDurationMs` changed?
   - If score increased, yes! Update animation duration
   - If not, keep current speed
5. **Next cycle** uses new duration
6. **Repeat** until game over

**Example timeline:**
```
Time 0s:   Start game, score = 0, pendingDuration = 2200ms
Time 2s:   Cactus finishes first cycle, check pendingDuration (still 2200ms)
Time 4s:   Score = 10, pendingDuration still 2200ms (not yet level 1)
Time 6s:   Score = 20, pendingDuration = 2080ms (level 1 reached!)
Time 8s:   Cactus finishes cycle, sees pendingDuration changed → speed up!
Time 8.08s: Next cycle starts with 2080ms duration (faster!)
```

### Why This Approach?

**Using CSS animations instead of JavaScript for movement:**
- ✅ **Smoother**: CSS animations are hardware-accelerated and run on the GPU
- ✅ **More efficient**: Browser optimizes CSS animations better than JS loops
- ✅ **Less code**: No need to manually calculate positions every frame
- ✅ **Battery friendly**: CSS animations use less power on mobile devices

**Using JavaScript to control speed:**
- ✅ **Dynamic**: Can change speed based on game state
- ✅ **Precise**: Easy to implement formulas for difficulty progression
- ✅ **Simple**: Just change one CSS property

This is a great example of **hybrid game development** - using the right tool for each job!

---

## 6. Game Over and Roast Messages

### When Game Over Happens - Step by Step

```javascript
function gameOver() {
    // Line 233: Set the game state flag to true
    // This prevents further jumps and collision checks
    isGameOver = true;
    
    // Line 234: Add "game-over" class to the container
    // This can trigger CSS effects (like dimming the game)
    gameContainer.classList.add("game-over");
    
    // Line 235: Pause the cactus animation
    // The CSS likely has: .cactus-paused { animation-play-state: paused; }
    cactus.classList.add("cactus-paused");
    
    // Lines 238-239: Stop the game loops completely
    // clearInterval() stops the timers from running
    // This is crucial to prevent:
    // - Score from increasing after death
    // - Multiple collision detections triggering multiple game overs
    clearInterval(collisionInterval);
    clearInterval(scoreInterval);
    
    // Line 241: Play a crash sound effect
    playCrashSound();
    
    // Line 242: Show the roast modal with a funny message
    triggerRoast(score);
    
    // Lines 245-251: Save high score if beaten
    if (score > highScore) {
        highScore = score;
        if (highScoreEl) {
            highScoreEl.textContent = String(highScore).padStart(6, "0");
        }
        // localStorage persists data even after browser closes
        localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
    }
}
```

**Why stop the intervals?**
- Prevents the score from continuing to increase after death
- Stops collision detection (saves CPU)
- Prevents multiple `gameOver()` calls (which would show multiple modals)
- Clean game state reset for next round

### Roast Message Selection - The Humor System

```javascript
// Lines 81-96: The roast library contains funny messages
const roastLibrary = {
    // "Pathetic" category for very low scores (0-14)
    pathetic: [
        "A literal rock has better reflexes than you.",
        "You are the reason the dinosaurs went extinct.",
        "That jump timing was a public service announcement for failure.",
        "Even the cactus looked embarrassed for you.",
        "You play like your keyboard is powered by potato."
    ],
    // "Mediocre" category for slightly better scores (15+)
    mediocre: [
        "Getting better, but you're still a disappointment to the T-Rex family.",
        "Wow, you almost reached double digits. Want a gold star?",
        "You jumped over three whole cacti. Absolute legend. (Not.)",
        "Your score is higher than your GPA, at least.",
        "Quit while you're... well, you're not ahead, but just quit."
    ]
};

function triggerRoast(currentScore) {
    // Line 217: Choose category based on score
    // Ternary operator: condition ? valueIfTrue : valueIfFalse
    // If score < 15 → pathetic, else → mediocre
    const category = currentScore < 15 ? roastLibrary.pathetic : roastLibrary.mediocre;
    
    // Line 218: Pick a random message from the category
    // Math.random() returns a number between 0 (inclusive) and 1 (exclusive)
    // Multiply by category.length to get a number between 0 and array length
    // Math.floor() rounds down to nearest integer (array index)
    // Example: category has 5 items → random index 0-4
    const randomRoast = category[Math.floor(Math.random() * category.length)];
    
    // Line 219: Display the message in the paragraph element
    roastMessageEl.innerText = randomRoast;
    
    // Line 220: Show the modal by adding the "show" class
    // CSS likely has: .roast-modal.show { opacity: 1; visibility: visible; }
    roastModalEl.classList.add("show");
}
```

**Random Message Logic Deep Dive:**

```javascript
// Let's trace through with an example:
const category = roastLibrary.pathetic;  // 5 messages
// Math.random() → 0.7342 (random number)
// 0.7342 * 5 = 3.671
// Math.floor(3.671) = 3
// category[3] = "Even the cactus looked embarrassed for you."
```

**Why two categories?**
- **Psychological effect**: Players who score very low get harsher roasts (motivates them to try again)
- **Players who improve**: Even mediocre scores get "nicer" roasts (acknowledges progress)
- **Replay value**: Different messages each time keeps the game fresh

### The Modal Display

The modal is a simple HTML structure:

```html
<div id="roast-modal" class="roast-modal" aria-hidden="true">
    <div class="roast-card">
        <h3 class="roast-title">GAME OVER</h3>
        <p id="roast-message" class="roast-text"></p>
        <div class="roast-buttons">
            <button id="roast-restart-btn">PLAY AGAIN</button>
            <button id="roast-close-btn">CLOSE</button>
        </div>
    </div>
</div>
```

**CSS Show/Hide Mechanism:**
```css
.roast-modal {
    /* Hidden by default */
    opacity: 0;           /* Transparent */
    visibility: hidden;   /* Not clickable */
    transition: opacity 0.3s ease;
}

.roast-modal.show {
    /* Visible state */
    opacity: 1;           /* Fully opaque */
    visibility: visible;  /* Clickable */
}
```

The `visibility` property is important - it prevents users from clicking the hidden modal even though it's transparent.

---

## 7. Game Flow Summary - Complete Execution Trace

Let's walk through what happens from the moment you open the game page:

### Phase 1: Page Load (0-100ms)

```
1. Browser loads HTML, CSS, and JavaScript files
2. DOM is built (all elements created)
3. CSS is applied (styles, animations defined)
4. JavaScript loads but doesn't run yet
```

### Phase 2: DOMContentLoaded Event (≈100ms)

```javascript
document.addEventListener("DOMContentLoaded", () => {
    // This function runs once the page is fully loaded
    // All the code inside here executes in order:
    
    // Step 1: Get references to HTML elements
    const dino = document.getElementById("dino");
    const cactus = document.getElementById("cactus");
    const scoreEl = document.getElementById("score");
    // ... more element references
    
    // Step 2: Set up event listeners (but they're not active yet)
    // - Click on game container
    // - Keyboard (SPACE)
    // - Touch (mobile tap)
    // - Animation events
    
    // Step 3: Load high score from localStorage
    let highScore = Number(localStorage.getItem("dino_high_score")) || 0;
    
    // Step 4: Auto-start the game!
    if (dino && cactus && gameContainer && scoreEl) {
        startGame();  // Game begins immediately
    }
});
```

### Phase 3: startGame() - Initialization (≈100-200ms)

```javascript
function startGame() {
    // Reset game state
    isGameOver = false;      // Game is now active
    score = 0;               // Score back to zero
    updateScoreDisplay();    // Show "000000" on screen
    
    // Reset visual elements
    gameContainer.classList.remove("game-over");
    dino.classList.remove("animate-jump");
    cactus.classList.remove("cactus-paused");
    hideRoastModal();        // Ensure modal is hidden
    
    // Reset dinosaur position
    dinoOffsetXPx = 0;
    dino.style.left = `${dinoStartLeftPx}px`;
    
    // Set initial cactus speed (slowest)
    pendingCactusDurationMs = getCactusDurationForScore(0); // 2200ms
    cactus.style.animationDuration = `${pendingCactusDurationMs}ms`;
    
    // Start cactus moving
    cactus.classList.remove("cactus-moving");  // Remove if exists
    void cactus.offsetWidth;                   // Force browser reflow
    cactus.classList.add("cactus-moving");     // Start animation
    
    // Start the game loops (timers)
    collisionInterval = setInterval(() => {
        // Check for collisions every 20ms
        // (Code from Section 3)
    }, 20);
    
    scoreInterval = setInterval(() => {
        // Increase score every 200ms
        // (Code from Section 4)
    }, 200);
}
```

**What's happening here?**
1. **State reset**: All variables back to starting values
2. **Visual reset**: Remove classes that might be left over from previous game
3. **Position reset**: Dinosaur back to starting position (40px from left)
4. **Speed reset**: Cactus back to slowest speed (2200ms)
5. **Animation restart**: The `void cactus.offsetWidth` trick forces the browser to recognize the class removal, so adding it again restarts the animation cleanly
6. **Timers start**: Two `setInterval` loops begin running simultaneously

### Phase 4: Gameplay Loop (Ongoing)

Now the game runs automatically. Here's what happens in parallel:

**Thread 1: Collision Detection (every 20ms)**
```
Check 1:  No collision
Check 2:  No collision
Check 3:  No collision
...
Check 50: No collision
(Repeats forever until game over)
```

**Thread 2: Score Increment (every 200ms)**
```
T+0ms:   score = 0
T+200ms: score = 1
T+400ms: score = 2
T+600ms: score = 3
...
T+4000ms: score = 20 → speed level increases to 1
         pendingCactusDurationMs = 2080ms
         (Speed change happens on next cactus cycle)
```

**Thread 3: Cactus Animation (continuous)**
```
T+0ms:     Cactus starts moving (2200ms duration)
T+2200ms:  Cactus reaches left edge
           animationiteration event fires
           Check pendingCactusDurationMs
           Still 2200ms? Keep speed.
T+4400ms:  Cactus reaches left edge again
           animationiteration event fires
           Check pendingCactusDurationMs
           Score is now 20? Change to 2080ms!
T+6480ms:  Cactus reaches left edge (2080ms duration this time)
           Continue...
```

**Thread 4: Player Input (on demand)**
```
User presses SPACE → jump() function runs
- Check if already jumping? No.
- Calculate jump distance (based on current speed level)
- Add animate-jump class (CSS animation starts)
- Play jump sound
- Set up animationend listener

[300ms later - animation ends]
- Remove animate-jump class (can jump again)
- Move dinosaur forward permanently
- Clean up event listener
```

### Phase 5: Collision! (Game Over)

Let's say at T+10 seconds, score = 50, and the dinosaur hits a cactus:

```
1. Collision check (every 20ms) detects overlap
   - horizontallyOverlapping = true
   - verticallyClose = true
   - isGameOver = false
2. gameOver() function is called:

   isGameOver = true                    // Stop accepting input
   clearInterval(collisionInterval)     // Stop collision checks
   clearInterval(scoreInterval)         // Stop score increases
   cactus.classList.add("cactus-paused") // Freeze cactus
   playCrashSound()                     // Play crash noise
   triggerRoast(50)                     // Show modal with mediocre roast
   
   if (50 > highScore) {                // Check high score
       highScore = 50
       localStorage.setItem(...)        // Save to browser storage
   }

3. Modal appears with:
   - "GAME OVER" title
   - Random roast message
   - "PLAY AGAIN" button
   - "CLOSE" button

4. Game is now paused. Player can:
   a) Click "PLAY AGAIN" → calls startGame() → back to Phase 3
   b) Click "CLOSE" → hides modal, game area click restarts
   c) Click anywhere on game area → restarts
```

### Phase 6: Restart

When player chooses to play again:

```
1. startGame() is called again
2. All state is reset (see Phase 3)
3. Score starts from 0
4. Cactus speed resets to 2200ms (slowest)
5. Dinosaur back to starting position
6. Game loops start again
7. Back to Phase 4 (Gameplay Loop)
```

### Complete Timeline Example

```
0ms:   Page loads, game auto-starts
0ms:   score = 0, cactus speed = 2200ms
200ms: score = 1
400ms: score = 2
600ms: score = 3
...
4000ms: score = 20 → speed level 1, pending speed = 2080ms
4400ms: Cactus cycle completes, speed changes to 2080ms
...
10000ms: score = 50, player hits cactus → GAME OVER
10000ms: Modal shows roast, game paused
10050ms: Player clicks "PLAY AGAIN"
10050ms: Game restarts, score = 0, speed = 2200ms
10250ms: score = 1
... and the cycle continues
```

---

## 8. Key Code Files

- **HTML**: `pages/game.html` - Game structure and elements
- **CSS**: `css/style.css` - Styling, animations, responsive design
- **JavaScript**: `js/script.js` - All game logic

---

## 9. Important Concepts for Beginners

---

## 8. Key Code Files

- **HTML**: `pages/game.html` - Game structure and elements
- **CSS**: `css/style.css` - Styling, animations, responsive design
- **JavaScript**: `js/script.js` - All game logic

---

## 9. Important Concepts for Beginners

### CSS Animations vs JavaScript
- **CSS**: Handles smooth visual animations (jump, movement, button pulses)
- **JavaScript**: Handles game logic, collision detection, scoring, and state management

### Event Listeners
The game uses multiple event listeners:
- `click` on game container for jumping/restarting
- `keydown` for SPACE key
- `touchstart` for mobile tapping
- `animationend` to detect when jump finishes
- `animationiteration` to update cactus speed

### LocalStorage
High scores are saved to the browser's localStorage so they persist between sessions:
```javascript
localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
```

### CSS Variables
The game uses CSS custom properties (variables) for consistent theming:
```css
--neon-green: #39FF14;
--bg-dark: #121212;
```

---

## 10. Performance Considerations

- Collision detection runs at 50fps (every 20ms) - efficient for simple games
- CSS animations are hardware-accelerated and smoother than JavaScript animations
- `getBoundingClientRect()` is called frequently but is acceptable for this simple game
- Audio context is created lazily (only when first needed) to comply with browser autoplay policies

---

## Conclusion

This game demonstrates fundamental game development concepts:
- **Game loop**: Using `setInterval` for updates
- **Collision detection**: Rectangle intersection math
- **State management**: Tracking score, game over state, high scores
- **Event handling**: Keyboard, mouse, and touch input
- **CSS animations**: Smooth visual effects
- **Responsive design**: Works on both desktop and mobile

Feel free to experiment with the code to create your own variations!