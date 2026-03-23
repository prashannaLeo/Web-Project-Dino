// Dino game
const dino = document.getElementById("dino");

document.addEventListener("keydown", function(event) {
    if (event.code === "Space") {
        jump();
    }
});

function jump() {
    if (dino.classList != "animate-jump") {
        dino.classList.add("animate-jump");
    }
    setTimeout(function() {
        dino.classList.remove("animate-jump");
    }, 500);
}