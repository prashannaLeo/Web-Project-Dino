document.addEventListener("DOMContentLoaded", () => {
    const dino = document.getElementById("dino");
    const gameContainer = document.querySelector(".game-container");
    const cactus = document.getElementById("cactus");
    const scoreEl = document.getElementById("score");
    const highScoreEl = document.getElementById("highScore");

    let score = 0;
    let isGameOver = false;
    let collisionInterval = null;
    let scoreInterval = null;
    const dinoStartLeftPx = 40;
    let dinoOffsetXPx = 0;

    // Simple sound effects using Web Audio API (no external files).
    let audioCtx = null;

    function ensureAudioContext() {
        if (!window.AudioContext && !window.webkitAudioContext) {
            return null; // Audio API not supported
        }
        if (!audioCtx) {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            audioCtx = new Ctx();
        }
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function playJumpSound() {
        const ctx = ensureAudioContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "square";
        osc.frequency.value = 750; // higher pitch

        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.01);
        gain.gain.linearRampToValueAtTime(0, now + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    function playCrashSound() {
        const ctx = ensureAudioContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.value = 200; // lower pitch

        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.35);
    }

    const HIGH_SCORE_KEY = "dino_high_score";
    const CURRENT_SCORE_KEY = "dino_current_score";

    let highScore = Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
    if (highScoreEl) {
        highScoreEl.textContent = String(highScore).padStart(6, "0");
    }

    const cactusBaseDurationMs = 2200;
    const cactusMinDurationMs = 600;
    const cactusDurationStepMs = 120;
    let pendingCactusDurationMs = cactusBaseDurationMs;

    function getSpeedLevel(currentScore) {
        return Math.floor(currentScore / 20); // every 20 points
    }

    function getCactusDurationForScore(currentScore) {
        // Increase speed as the score grows (faster = smaller duration).
        const speedLevel = getSpeedLevel(currentScore);
        return Math.max(
            cactusMinDurationMs,
            cactusBaseDurationMs - speedLevel * cactusDurationStepMs
        );
    }

    // Function to trigger the jump
    function jump() {
        if (!dino) return; // Only valid on the game page
        if (dino.classList.contains("animate-jump")) return;

        // Make forward jump distance scale with current game speed level.
        const speedLevel = getSpeedLevel(score);
        const jumpForwardPx = Math.min(34, 10 + speedLevel * 2);
        dino.style.setProperty("--jump-forward", `${jumpForwardPx}px`);

        dino.classList.add("animate-jump");
        playJumpSound();

        // Remove the class exactly when the animation ends (prevents timing drift / stutter).
        const onAnimationEnd = (event) => {
            if (event.animationName === "dino-jump") {
                dino.classList.remove("animate-jump");

                if (gameContainer) {
                    const maxOffsetPx = Math.max(
                        0,
                        gameContainer.clientWidth - dino.offsetWidth - dinoStartLeftPx - 8
                    );
                    dinoOffsetXPx = Math.min(maxOffsetPx, dinoOffsetXPx + jumpForwardPx);
                    dino.style.left = `${dinoStartLeftPx + dinoOffsetXPx}px`;
                }

                dino.removeEventListener("animationend", onAnimationEnd);
            }
        };
        dino.addEventListener("animationend", onAnimationEnd);
    }

    function updateScoreDisplay() {
        if (!scoreEl) return;
        scoreEl.textContent = String(score).padStart(6, "0");
    }

    function startGame() {
        if (!dino || !cactus || !gameContainer) return;

        // Reset state
        isGameOver = false;
        score = 0;
        updateScoreDisplay();
        localStorage.setItem(CURRENT_SCORE_KEY, "0");

        gameContainer.classList.remove("game-over");
        dino.classList.remove("animate-jump");
        cactus.classList.remove("cactus-paused");
        dinoOffsetXPx = 0;
        dino.style.left = `${dinoStartLeftPx}px`;

        // Apply initial slow speed and sync pending value.
        pendingCactusDurationMs = getCactusDurationForScore(0);
        cactus.style.animationDuration = `${pendingCactusDurationMs}ms`;

        // Restart the cactus animation by forcing reflow
        cactus.classList.remove("cactus-moving");
        // Trigger reflow so animation restarts cleanly
        void cactus.offsetWidth;
        cactus.classList.add("cactus-moving");

        // Clear any existing intervals
        if (collisionInterval) clearInterval(collisionInterval);
        if (scoreInterval) clearInterval(scoreInterval);

        // Collision check loop
        collisionInterval = setInterval(() => {
            const dinoRect = dino.getBoundingClientRect();
            const cactusRect = cactus.getBoundingClientRect();

            const horizontallyOverlapping =
                dinoRect.right - 10 > cactusRect.left &&
                dinoRect.left + 10 < cactusRect.right;
            const verticallyClose = Math.abs(dinoRect.bottom - cactusRect.bottom) < 40;

            if (horizontallyOverlapping && verticallyClose && !isGameOver) {
                gameOver();
            }
        }, 20);

        // Score loop
        scoreInterval = setInterval(() => {
            if (!isGameOver) {
                score += 1;
                updateScoreDisplay();

                // Save current score occasionally (avoid writing every tick).
                if (score % 10 === 0) {
                    localStorage.setItem(CURRENT_SCORE_KEY, String(score));
                }

                // Ramp speed with score; apply on next animation cycle.
                pendingCactusDurationMs = getCactusDurationForScore(score);
            }
        }, 200);
    }

    function gameOver() {
        if (!cactus || !gameContainer) return;
        isGameOver = true;
        gameContainer.classList.add("game-over");
        cactus.classList.add("cactus-paused");
        if (collisionInterval) clearInterval(collisionInterval);
        if (scoreInterval) clearInterval(scoreInterval);

        playCrashSound();

        // Persist scores
        localStorage.setItem(CURRENT_SCORE_KEY, String(score));
        if (score > highScore) {
            highScore = score;
            if (highScoreEl) {
                highScoreEl.textContent = String(highScore).padStart(6, "0");
            }
            localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
        }
    }

    // Set up click/tap on the game area
    if (gameContainer) {
        gameContainer.addEventListener("click", () => {
            if (isGameOver) {
                startGame();
            } else {
                jump();
            }
        });
    }

    // Keyboard support (Desktop)
    document.addEventListener("keydown", (event) => {
        if (event.code === "Space") {
            const target = event.target;
            const isTypingField =
                target instanceof HTMLElement &&
                (target.tagName === "INPUT" ||
                    target.tagName === "TEXTAREA" ||
                    target.isContentEditable);

            // Allow typing spaces in form/message fields.
            if (isTypingField) return;

            event.preventDefault(); // Stop page scroll outside text fields
            if (gameContainer && cactus && dino) {
                if (isGameOver) {
                    startGame();
                } else {
                    jump();
                }
            }
        }
    });

    // Touch support (Mobile)
    // Only intercept touches inside the game area; otherwise we break normal scrolling/tapping.
    if (gameContainer && cactus && dino) {
        gameContainer.addEventListener(
            "touchstart",
            (event) => {
                event.preventDefault(); // prevent page scroll while tapping the game
                if (isGameOver) {
                    startGame();
                } else {
                    jump();
                }
            },
            { passive: false }
        );
    }

    // Apply speed updates at loop boundaries to prevent cactus mid-lane popping.
    if (cactus) {
        cactus.addEventListener("animationiteration", () => {
            const targetDuration = `${pendingCactusDurationMs}ms`;
            if (cactus.style.animationDuration !== targetDuration) {
                cactus.style.animationDuration = targetDuration;
            }
        });
    }

    // Home page preview (only if the canvas exists)
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');

        // Drawing a simple placeholder dino and ground on the canvas
        function drawPreview() {
            // Ground
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 180);
            ctx.lineTo(600, 180);
            ctx.stroke();

            // Placeholder Text
            ctx.fillStyle = '#121212';
            ctx.font = '16px Arial';
            ctx.fillText('Game Engine Ready...', 220, 100);

            // Simple Dino Shape (placeholder)
            ctx.fillStyle = '#555';
            ctx.fillRect(50, 140, 40, 40);
        }
        drawPreview();
    }

    // Newsletter Submission Logic
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const emailEl = document.getElementById('userEmail');
            const email = emailEl ? emailEl.value : '';
            if (email.includes('@')) {
                alert(`Welcome to the journey, ${email.split('@')[0]}!`);
            } else {
                alert('Please enter a valid email address.');
            }
        });
    }

    // Make navbar active link state change on click (for multi-page feel)
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    // Logic to handle navbar active state if needed

    // Auto-start game when on the game page
    if (dino && cactus && gameContainer && scoreEl) {
        startGame();
    }

});
