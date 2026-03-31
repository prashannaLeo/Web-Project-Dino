document.addEventListener("DOMContentLoaded", () => {
    const dino = document.getElementById("dino");
    const gameContainer = document.querySelector(".game-container");

    // Function to trigger the jump
    function jump() {
        if (!dino.classList.contains("animate-jump")) {
            dino.classList.add("animate-jump");
            setTimeout(() => {
                dino.classList.remove("animate-jump");
            }, 500);
        }
    }

    // Keyboard support (Desktop)
    document.addEventListener("keydown", (event) => {
        if (event.code === "Space") {
            event.preventDefault(); // Stop page scroll
            jump();
        }
    });

    // Touch support (Mobile)
    document.addEventListener("touchstart", (event) => {
        // Prevent zooming or scrolling when tapping to jump
        if (event.target.id !== "nav") { // Optional: ignore taps on navigation
            event.preventDefault(); 
            jump();
        }
    }, { passive: false }); 

// home page

    const canvas = document.getElementById('gameCanvas');
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

    // Newsletter Submission Logic
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.addEventListener('click', () => {
        const email = document.getElementById('userEmail').value;
        if (email.includes('@')) {
            alert(`Welcome to the journey, ${email.split('@')[0]}!`);
        } else {
            alert('Please enter a valid email address.');
        }
    });

    // Make navbar active link state change on click (for multi-page feel)
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    // Logic to handle navbar active state if needed
});
