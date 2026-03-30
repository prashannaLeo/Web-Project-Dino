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

// Contact Form Validation
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const emailError = document.getElementById('emailError');
    const messageError = document.getElementById('messageError');
    const successMsg = document.getElementById('successMsg');

    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // Function to sanitize message (remove HTML/script tags)
    function sanitizeMessage(message) {
        // Remove any HTML tags to prevent code injection
        const tempDiv = document.createElement('div');
        tempDiv.textContent = message;
        return tempDiv.textContent;
    }

    function clearErrors() {
        if (emailError) emailError.textContent = '';
        if (messageError) messageError.textContent = '';
    }

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        clearErrors();
        
        const email = emailInput.value.trim();
        let message = messageInput.value.trim();
        let isValid = true;
        
        // Email validation
        if (email === '') {
            emailError.textContent = 'Email is required';
            isValid = false;
        } else if (!isValidEmail(email)) {
            emailError.textContent = 'Enter a valid email address';
            isValid = false;
        }
        
        // Message validation - only check if empty, allow any text but sanitize
        if (message === '') {
            messageError.textContent = 'Message is required';
            isValid = false;
        } else {
            // Sanitize the message to remove any HTML/script code
            message = sanitizeMessage(message);
            messageInput.value = message;
        }
        
        if (isValid) {
            successMsg.textContent = '✓ Message sent successfully!';
            successMsg.classList.add('show');
            emailInput.value = '';
            messageInput.value = '';
            
            setTimeout(function() {
                successMsg.classList.remove('show');
            }, 3000);
        }
    });
}

let score = 0;
setInterval(() => {
    score++;
    const scoreElement = document.getElementById("score");
    if (scoreElement) {
        scoreElement.innerText = score.toString().padStart(6, '0');
    }
}, 100);