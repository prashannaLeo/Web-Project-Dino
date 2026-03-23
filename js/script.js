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
});