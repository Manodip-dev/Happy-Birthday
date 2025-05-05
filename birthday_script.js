const backgroundContainer = document.querySelector('.background-container');
const foregroundTrees = document.querySelectorAll('.foreground-tree');
const cloud = document.querySelector('.cloud'); // Get the single cloud element
const envelopeContainer = document.getElementById('envelopeContainer');
const birthdayLetter = document.getElementById('birthdayLetter');
const effectsContainer = document.getElementById('effectsContainer'); // Get the effects container
const birthdaySong = document.getElementById('birthdaySong'); // Get the audio element

// Animation duration for the letter slide (should match CSS transition)
const slideDuration = 600; // milliseconds
let songLoopCount = 0; // Variable to track song loops

// Function to create a blinking star
function createStar() {
    const star = document.createElement('div');
    star.classList.add('star');
    star.style.top = `${Math.random() * 90}%`; /* Random vertical position */
    star.style.left = `${Math.random() * 100}%`; /* Random horizontal position */
    star.style.animationDelay = `${Math.random() * 2}s`; /* Random animation delay for variety */
    backgroundContainer.appendChild(star);
}

// Create a number of blinking stars
const numberOfStars = 150; // Increased number of stars
for (let i = 0; i < numberOfStars; i++) {
    createStar();
}

// Function to create a falling star
function createFallingStar() {
    const fallingStar = document.createElement('div');
    fallingStar.classList.add('falling-star');

    // Random starting position (mostly from the top half)
    const startX = Math.random() * 100;
    const startY = Math.random() * 40; // Start higher up
    fallingStar.style.top = `${startY}%`;
    fallingStar.style.left = `${startX}%`;

    // Random duration and delay
    const duration = Math.random() * 2 + 1.5; // 1.5 to 3.5 seconds
    const delay = Math.random() * 5; // 0 to 5 seconds delay before starting

    // Randomly decide if this star has a more prominent tail
    const hasProminentTail = Math.random() > 0.5; // 50% chance

    let animationProperties = [
        { top: `${startY}%`, left: `${startX}%`, opacity: 1, transform: 'rotate(0deg)' }
    ];

    if (hasProminentTail) {
         // Longer fall and fade for a more prominent tail
         animationProperties.push({ top: `${startY + 80}%`, left: `${startX + 60}%`, opacity: 0, transform: 'rotate(20deg)' });
         fallingStar.style.width = '4px'; // Make the star slightly larger for a better tail
         fallingStar.style.height = '4px';
    } else {
        // Shorter fall and fade for a less prominent tail
        animationProperties.push({ top: `${startY + 40}%`, left: `${startX + 30}%`, opacity: 0, transform: 'rotate(10deg)' });
    }


    // Animation for falling star
    fallingStar.animate(animationProperties, {
        duration: duration * 1000,
        easing: 'linear',
        delay: delay * 1000,
        iterations: 1,
        fill: 'both'
    });

    backgroundContainer.appendChild(fallingStar);

    // Remove the falling star after animation
    fallingStar.addEventListener('animationend', () => {
        fallingStar.remove();
    });
}

// Create falling stars at intervals
setInterval(createFallingStar, 1500); // Create a falling star more frequently

// Apply random animation delay and duration to each tree for varied movement
foregroundTrees.forEach(tree => {
    tree.style.animation = `tree-sway ${Math.random() * 3 + 4}s infinite ease-in-out alternate`; // Random duration between 4 and 7 seconds
    tree.style.animationDelay = `${Math.random() * 2}s`; // Random delay up to 2 seconds
});

// Apply animation delay and duration to the single cloud
if (cloud) { // Check if the cloud element exists
     cloud.style.animation = `cloud-intermittent-move ${Math.random() * 60 + 120}s linear infinite`; // Random duration between 120 and 180 seconds
     cloud.style.animationDelay = `${Math.random() * 60}s`; // Random delay up to 60 seconds
}

// --- Envelope and Letter JavaScript ---

// Show envelope after 2 seconds
setTimeout(() => {
    envelopeContainer.classList.add('visible');
}, 2000); // 2000 milliseconds = 2 seconds

 // Function to create fireworks particles
function createFireworks(x, y) {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff'];
    const numberOfParticles = 20; // Number of particles per firework

    for (let i = 0; i < numberOfParticles; i++) {
        const particle = document.createElement('div');
        particle.classList.add('firework-particle');
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        // Start position near the click point (center of envelope)
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;

        // Random trajectory
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 50 + 20; // Random speed
        const duration = Math.random() * 1 + 0.5; // Random duration

        const endX = x + Math.cos(angle) * velocity;
        const endY = y + Math.sin(angle) * velocity;

        particle.animate([
            { transform: 'translate(0, 0)', opacity: 1 },
            { transform: `translate(${endX - x}px, ${endY - y}px)`, opacity: 0 }
        ], {
            duration: duration * 1000,
            easing: 'ease-out',
            iterations: 1,
            fill: 'both'
        });

        effectsContainer.appendChild(particle);

        // Remove particle after animation
        particle.addEventListener('animationend', () => {
            particle.remove();
        });
    }
}

// Function to create balloons
function createBalloons() {
    const colors = ['#ff6347', '#ffd700', '#98fb98', '#add8e6', '#ee82ee']; // Balloon colors
    const numberOfBalloons = Math.floor(Math.random() * 4) + 5; // 5 to 8 balloons

    for (let i = 0; i < numberOfBalloons; i++) {
        const balloon = document.createElement('div');
        balloon.classList.add('balloon');
        balloon.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        // Random horizontal start position near the bottom
        const startX = Math.random() * window.innerWidth;
        balloon.style.left = `${startX}px`;

        // Random animation duration and horizontal float
        const duration = Math.random() * 5 + 5; // Adjusted: 5 to 10 seconds (slightly faster)
        const floatX = (Math.random() - 0.5) * 200; // Float left or right
        const rotate = (Math.random() - 0.5) * 30; // Slight rotation

        balloon.style.animation = `float-up ${duration}s ease-in forwards`;
        balloon.style.setProperty('--float-x', `${floatX}px`);
        balloon.style.setProperty('--float-rotate', `${rotate}deg`);

        effectsContainer.appendChild(balloon);

         // Remove balloon after animation
        balloon.addEventListener('animationend', () => {
            balloon.remove();
        });
    }
}

// Event listener for when the song ends
birthdaySong.addEventListener('ended', () => {
    songLoopCount++;
    if (songLoopCount < 2) { // Loop 2 times
        birthdaySong.currentTime = 0; // Restart song
        birthdaySong.play();
    } else {
        birthdaySong.pause(); // Stop after 2 loops
         songLoopCount = 0; // Reset loop count
    }
});


// Toggle letter visibility on click
envelopeContainer.addEventListener('click', (event) => {
    const isOpen = envelopeContainer.classList.contains('open');

    // Stop the subtle vibration on the envelope immediately on click
    envelopeContainer.style.animation = 'none';


    if (!isOpen) {
        // Opening the envelope - Stage 1: Slide out from top
        envelopeContainer.classList.add('open');

        // Trigger fireworks and balloons when opening
        const rect = envelopeContainer.getBoundingClientRect();
        const envelopeCenterX = rect.left + rect.width / 2;
        const envelopeCenterY = rect.top + rect.height / 2;

        // Create 7-9 fireworks blasts (Adjusted)
        const numberOfFireworks = Math.floor(Math.random() * 3) + 7; // 7 to 9 fireworks
        for (let i = 0; i < numberOfFireworks; i++) {
             // Stagger the fireworks slightly
            setTimeout(() => {
                 createFireworks(envelopeCenterX, envelopeCenterY);
            }, i * 80); // Slightly reduced delay for more simultaneous feel
        }


        // Create 5-8 balloons
        createBalloons();

        // Play the song from the beginning
        birthdaySong.currentTime = 0;
        birthdaySong.volume = 0.9; // Set volume to 90%
        songLoopCount = 0; // Reset loop count on opening
        birthdaySong.play();


        birthdayLetter.style.transform = 'translateY(-100%) scale(1)';
        birthdayLetter.style.opacity = 1;

        // Stage 2: Move to front position after sliding out
        setTimeout(() => {
            birthdayLetter.style.transform = 'translateY(0) translateX(0) scale(1)';
            // Z-index is already handled by .envelope-container.open .letter CSS rule
            // Remove vibration animation after it finishes (if it was applied)
             birthdayLetter.style.animation = '';
        }, slideDuration);

    } else {
        // Closing the envelope - Stage 1: Slide up
         // Removed vibration animation when closing the letter
        // birthdayLetter.style.animation = 'subtle-letter-vibrate 0.2s ease-in-out 2';

        // Pause the song when closing
        birthdaySong.pause();
        birthdaySong.currentTime = 0; // Reset song to beginning on close
         songLoopCount = 0; // Reset loop count on closing


        birthdayLetter.style.transform = 'translateY(-100%) scale(1)';
        // Opacity remains 1 during this stage

        // Stage 2: Move back inside and hide after sliding up
        setTimeout(() => {
            birthdayLetter.style.transform = 'translateY(0) translateX(0) scale(0.95)';
            birthdayLetter.style.opacity = 0;
            // Z-index will revert due to removing the .open class
            envelopeContainer.classList.remove('open');
             // Remove vibration animation after it finishes
            birthdayLetter.style.animation = '';
        }, slideDuration);
    }
});

// Hover effect (optional, handled by CSS transition on transform)
// You can add more complex hover effects here if needed, e.g., subtle scale up
envelopeContainer.addEventListener('mouseenter', () => {
     // Add a class for hover if needed for specific effects
     // envelopeContainer.classList.add('hovered');
});

envelopeContainer.addEventListener('mouseleave', () => {
     // Remove hover class
     // envelopeContainer.classList.remove('hovered');
});

// Redirect to index.html on refresh
if (performance.navigation.type === 1) {
    // Type 1 indicates navigation through the history API or a reload
    window.location.href = 'index.html';
}