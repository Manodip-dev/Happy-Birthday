document.addEventListener('DOMContentLoaded', () => {
    // --- Canvas Setup ---
    const fireworksCanvas = document.getElementById('fireworks-canvas');
    const fireworksCtx = fireworksCanvas.getContext('2d');
    let fireworks = [];
    let particles = [];
    let fireworkAnimationFrameId = null;
    const maxActiveFireworks = 10;

    const balloonCanvas = document.getElementById("balloonCanvas");
    const balloonCtx = balloonCanvas.getContext("2d");
    let balloons = [];
    const balloonCount = 12;

    // Get individual main content elements
    const pageTitle = document.getElementById('page-title');
    const pageQuote = document.getElementById('page-quote');
    const claimButton = document.getElementById('claim-button');
    const bottomElements = document.getElementById('bottom-elements');
    const lightsContainer = document.getElementById('lights-container');

    // Get audio elements
    const bgMusic1 = document.getElementById('bg-music-1');
    const bgMusic2 = document.getElementById('bg-music-2');
    const fireworkSoundElements = document.querySelectorAll('.firework-sound');

    // Get audio control elements
    const audioControlContainer = document.getElementById('audio-control-container');
    const audioControlButton = document.getElementById('audio-control-button');
    const volumeSlider = document.getElementById('volume-slider');
    const listenText = document.getElementById('listen-text'); // Get the listen text element

    const countdownElement = document.getElementById('countdown');
    const transitionOverlay = document.getElementById('transition-overlay');
    const transitionContent = document.getElementById('transition-content');
    const videoPlaceholder = document.getElementById('video-placeholder');
    const giftVideo = document.getElementById('gift-video');

    // Variable to track which background music is currently playing
    let currentBgMusic = bgMusic1; // Start with music 1

    // Flag to track if music has been explicitly played by user interaction
    let musicStarted = false;


    // --- Canvas Size Setup (for both canvases) ---
    const setCanvasSize = () => {
        fireworksCanvas.width = window.innerWidth;
        fireworksCanvas.height = window.innerHeight;
        balloonCanvas.width = window.innerWidth;
        balloonCanvas.height = window.innerHeight;
    };

    window.addEventListener('resize', setCanvasSize);
    setCanvasSize(); // Set initial size

    // --- Fireworks Logic (Keep existing code) ---
    class Particle {
        constructor(x, y, color, angle, speed, gravity, friction, size = 1.5) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.alpha = 1;
            this.gravity = gravity;
            this.friction = friction;
            this.speed = speed;
            this.angle = angle;
            this.velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            };
            this.size = size;
        }

        update() {
            this.velocity.x *= this.friction;
            this.velocity.y *= this.friction;
            this.velocity.y += this.gravity;
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            this.alpha -= 0.01;
            this.size *= 0.98;
        }

        draw() {
            fireworksCtx.save();
            fireworksCtx.globalAlpha = Math.max(0, this.alpha);
            fireworksCtx.fillStyle = this.color;
            fireworksCtx.beginPath();
            fireworksCtx.arc(this.x, this.y, Math.max(0, this.size), 0, Math.PI * 2, false);
            fireworksCtx.fill();
            fireworksCtx.restore();
        }
    }

    class Firework {
        constructor(x, y, targetX, targetY, color, speed) {
            this.x = x;
            this.y = y;
            this.targetX = targetX;
            this.targetY = targetY;
            this.color = color;
            this.speed = speed;
            this.distanceToTarget = Math.hypot(targetX - x, targetY - y);
            this.angle = Math.atan2(targetY - y, targetX - x);
            this.velocity = {
                x: Math.cos(this.angle) * this.speed,
                y: Math.sin(this.angle) * this.speed
            };
            this.trail = [];
            this.trailLength = 10;
            this.trailOpacity = 0.3;
            this.exploded = false;
        }

        update() {
             if (this.exploded) return;

            let dx = this.targetX - this.x;
            let dy = this.targetY - this.y;
            let distanceCovered = Math.hypot(dx, dy);

            this.trail.push({ x: this.x, y: this.y, opacity: this.trailOpacity, size: 2 + Math.random() });
            if (this.trail.length > this.trailLength) {
                this.trail.shift();
            }

            if (distanceCovered < this.speed) {
                this.explode();
                this.exploded = true;
                fireworks = fireworks.filter(f => f !== this);
            } else {
                this.x += this.velocity.x;
                this.y += this.velocity.y;
            }
        }

        draw() {
             if (this.exploded) return;

            for (let i = 0; i < this.trail.length; i++) {
                const trailParticle = this.trail[i];
                fireworksCtx.save();
                fireworksCtx.globalAlpha = trailParticle.opacity * (i / this.trail.length);
                fireworksCtx.fillStyle = this.color;
                fireworksCtx.beginPath();
                fireworksCtx.arc(trailParticle.x, trailParticle.y, trailParticle.size * (i / this.trailLength), 0, Math.PI * 2, false);
                fireworksCtx.fill();
                fireworksCtx.restore();
            }

            fireworksCtx.fillStyle = this.color;
            fireworksCtx.beginPath();
            fireworksCtx.arc(this.x, this.y, 3, 0, Math.PI * 2, false);
            fireworksCtx.fill();
        }

        explode() {
            const particleCount = 80 + Math.random() * 70;
            const gravity = 0.08;
            const friction = 0.94;

            fireworksCtx.save();
            fireworksCtx.globalAlpha = 1;
            fireworksCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            fireworksCtx.beginPath();
            fireworksCtx.arc(this.x, this.y, 20, 0, Math.PI * 2, false);
            fireworksCtx.fill();
            fireworksCtx.restore();

            for (let i = 0; i < particleCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 4 + 1;

                const particleColor = this.color.replace(')', `, ${Math.random() * 0.4 + 0.6})`).replace('rgb', 'rgba');

                particles.push(new Particle(this.x, this.y, particleColor, angle, speed, gravity, friction, 2));
            }

            // Play firework sound at 80% volume
            playRandomFireworkSound(0.8);
        }
    }

    function launchRandomFirework(isBigBurst = false) {
        if (fireworks.length >= maxActiveFireworks && !isBigBurst) {
            return;
        }

        const startX = window.innerWidth / 2 + (Math.random() - 0.5) * window.innerWidth * 0.8;
        const startY = window.innerHeight;

        const targetY = Math.random() < 0.85 ?
                        Math.random() * window.innerHeight * 0.5 :
                        Math.random() * window.innerHeight * 0.3 + window.innerHeight * 0.5;

        const targetX = Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1;

        const colors = [
            '#FF6347', '#4682B4', '#32CD32', '#9370DB', '#FFD700', '#00CED1', '#FF69B4', '#FF8C00',
            '#ADFF2F', '#FF4500', '#7B68EE'
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const fixedSpeed = 1.5;

        fireworks.push(new Firework(startX, startY, targetX, targetY, randomColor, fixedSpeed));
    }

     function launchBigBurst(count = 70) { // Adjusted default count to 70
         for (let i = 0; i < count; i++) {
             setTimeout(() => {
                 launchRandomFirework(true);
             }, i * 30);
         }
     }

    function animateFireworks() {
        fireworkAnimationFrameId = requestAnimationFrame(animateFireworks);
        fireworksCtx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }

        particles = particles.filter(p => p.alpha > 0 && p.size > 0);

        for (let i = 0; i < fireworks.length; i++) {
            fireworks[i].update();
            fireworks[i].draw();
        }
    }

    setInterval(() => {
        if (fireworks.length < maxActiveFireworks) {
            const numFireworksToLaunch = Math.min(Math.floor(Math.random() * 3) + 1, maxActiveFireworks - fireworks.length);
            for (let i = 0; i < numFireworksToLaunch; i++) {
                setTimeout(() => {
                    launchRandomFirework();
                }, i * 100);
            }
        }
    }, 1000 + Math.random() * 1000);

    animateFireworks();


    // --- Lights Logic (Keep existing code) ---
    const numberOfLights = 60;

    function createLights() {
        for (let i = 0; i < numberOfLights; i++) {
            const light = document.createElement('span');
            light.classList.add('light');
            light.style.left = `${Math.random() * 100}%`;
            light.style.animationDelay = `${Math.random() * 4}s`;
            light.style.animationDuration = `${0.5 + Math.random() * 2}s`;
            lightsContainer.appendChild(light);
        }
    }

    createLights();


    // --- Balloons Logic (Keep existing code) ---
    const balloonColors = [
        '#FF6347', '#4682B4', '#32CD32', '#9370DB', '#FFD700', '#00CED1', '#FF69B4', '#FF8C00',
        '#ADFF2F', '#FF4500', '#7B68EE'
    ];

    class Balloon {
      constructor(isLarge = false) {
        this.reset(isLarge);
      }

      reset(isLarge = false) {
        this.x = Math.random() * balloonCanvas.width;
        this.y = balloonCanvas.height + Math.random() * balloonCanvas.height;

        const sizes = [15, 25, 35];
        this.radius = isLarge ? 35 : sizes[Math.floor(Math.random() * sizes.length)];

        const shapes = ['circle', 'ellipse', 'heart'];
        this.shape = shapes[Math.floor(Math.random() * shapes.length)];

        this.color = balloonColors[Math.floor(Math.random() * balloonColors.length)];

        this.speed = 0.3 + Math.random() * 0.7;
        this.threadPhase = Math.random() * Math.PI * 2;
        this.threadType = Math.floor(Math.random() * 3);
        this.vx = (Math.random() - 0.5) * 0.2;
      }

      update() {
        this.y -= this.speed;
        this.x += this.vx;
        this.threadPhase += 0.05;
        if (this.y + this.radius < 0 || this.x < -this.radius || this.x > balloonCanvas.width + this.radius) {
          this.reset();
        }
      }

      checkCollision(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < this.radius + other.radius;
      }

      resolveCollision(other) {
        const angle = Math.atan2(this.y - other.y, this.x - other.x);
        const overlap = this.radius + other.radius - Math.hypot(this.x - other.x, this.y - other.y);
        const shift = overlap / 2;
        this.x += Math.cos(angle) * shift;
        this.y += Math.sin(angle) * shift;
        other.x -= Math.cos(angle) * shift;
        other.y -= Math.sin(angle) * shift;
      }

      drawShape() {
        const gradient = balloonCtx.createRadialGradient(
          this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.1,
          this.x, this.y, this.radius * 1.2
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, this.color);
        gradient.addColorStop(1, this.color.replace(')', ', 0.8)').replace('rgb', 'rgba'));

        balloonCtx.fillStyle = gradient;
        balloonCtx.beginPath();
        if (this.shape === 'circle') {
          balloonCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        } else if (this.shape === 'ellipse') {
          balloonCtx.ellipse(this.x, this.y, this.radius * 0.8, this.radius, 0, 0, Math.PI * 2);
        } else if (this.shape === 'heart') {
          const r = this.radius * 0.6;
          balloonCtx.moveTo(this.x, this.y);
          balloonCtx.bezierCurveTo(this.x - r, this.y - r, this.x - r, this.y + r, this.x, this.y + r * 1.5);
          balloonCtx.bezierCurveTo(this.x + r, this.y + r, this.x + r, this.y - r, this.x, this.y);
        }
        balloonCtx.fill();
        balloonCtx.closePath();
      }

      drawThread() {
        balloonCtx.beginPath();
        const segments = 10;
        const length = 30;
        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          let offsetX;
          switch (this.threadType) {
            case 0:
              offsetX = Math.sin(this.threadPhase + t * Math.PI * 4) * 2;
              break;
            case 1:
              offsetX = (i % 2 === 0 ? 1 : -1) * 2;
              break;
            case 2:
              offsetX = Math.cos(this.threadPhase + t * Math.PI * 2) * t * 4;
              break;
            default:
              offsetX = 0;
          }
          const px = this.x + offsetX;
          const py = this.y + this.radius + t * length;
          if (i === 0) balloonCtx.moveTo(px, py);
          else balloonCtx.lineTo(px, py);
        }
        balloonCtx.lineWidth = 2.5;
        balloonCtx.strokeStyle = this.color;
        balloonCtx.stroke();
        balloonCtx.closePath();
      }

      draw() {
        this.drawShape();
        this.drawThread();
      }
    }

    balloons.push(new Balloon(true));

    for (let i = 1; i < balloonCount; i++) {
      balloons.push(new Balloon());
    }

    function animateBalloons() {
      balloonCtx.clearRect(0, 0, balloonCanvas.width, balloonCanvas.height);

      for (let i = 0; i < balloons.length; i++) {
        balloons[i].update();
      }

      for (let i = 0; i < balloons.length; i++) {
        for (let j = i + 1; j < balloons.length; j++) {
          if (balloons[i].checkCollision(balloons[j])) {
            balloons[i].resolveCollision(balloons[j]);
          }
        }
      }

      for (let balloon of balloons) {
        balloon.draw();
      }

      requestAnimationFrame(animateBalloons);
    }

    animateBalloons();


    // --- Audio Logic ---

    // Function to play background music 1
    function playBgMusic1() {
        if (!bgMusic2.paused) {
            bgMusic2.pause();
            bgMusic2.currentTime = 0;
        }
        currentBgMusic = bgMusic1; // Update current music tracker
        currentBgMusic.volume = volumeSlider.value; // Set volume from slider
        currentBgMusic.play().catch(error => {
            console.log("Background music 1 playback prevented:", error);
        });
    }

    // Function to play background music 2
    function playBgMusic2() {
         if (!bgMusic1.paused) {
             bgMusic1.pause();
             bgMusic1.currentTime = 0;
         }
         currentBgMusic = bgMusic2; // Update current music tracker
         currentBgMusic.volume = volumeSlider.value; // Set volume from slider
        currentBgMusic.play().catch(error => {
            console.log("Background music 2 playback prevented:", error);
        });
    }

    // Add event listeners to loop the music, switching tracks
    // This ensures continuous playback between the two tracks with minimal gap
    bgMusic1.onended = playBgMusic2;
    bgMusic2.onended = playBgMusic1;

    // Function to play a random firework sound effect with a specific volume
    function playRandomFireworkSound(volume = 1.0) { // Added volume parameter
        if (fireworkSoundElements.length === 0) return;

        const randomIndex = Math.floor(Math.random() * fireworkSoundElements.length);
        const sound = fireworkSoundElements[randomIndex];

        const soundClone = sound.cloneNode();
        soundClone.volume = volume; // Use the provided volume (0.8 for fireworks)
        soundClone.play().catch(error => {
            console.log("Firework sound playback prevented:", error);
        });

        soundClone.onended = () => {
            soundClone.remove();
        };
    }

    // --- Audio Control Button Logic ---

    // Function to update the audio button icon based on play/pause state
    function updateAudioButtonIcon() {
        const icon = audioControlButton.querySelector('i');
         // Remove all possible icons first
         icon.classList.remove('fa-play', 'fa-pause');

         if (currentBgMusic.paused) {
             icon.classList.add('fa-play'); // Show play icon when paused
         } else {
             icon.classList.add('fa-pause'); // Show pause icon when playing
         }

         // Hide the "Click here to listen" text once music has started
         if (musicStarted) {
             listenText.style.display = 'none';
         } else {
             listenText.style.display = 'inline-block'; // Or 'flex' depending on layout
         }
    }

    // Toggle play/pause when the button is clicked
    audioControlButton.addEventListener('click', () => {
        if (currentBgMusic.paused) {
            // If paused, attempt to play the current track
            // Set musicStarted flag to true on first user interaction
            musicStarted = true;
            currentBgMusic.play().catch(error => {
                 console.log("Playback prevented by user gesture policy:", error);
            });
        } else {
            // If playing, pause the current track
            currentBgMusic.pause();
        }
         updateAudioButtonIcon(); // Update icon after toggle
    });

    // Update volume when the slider is changed
    volumeSlider.addEventListener('input', () => {
        currentBgMusic.volume = volumeSlider.value;
        updateAudioButtonIcon(); // Update icon based on new volume

         // If volume is increased from 0 while paused, and music hasn't started yet, attempt to play
         // This handles the case where a user uses the slider first
         if (currentBgMusic.paused && volumeSlider.value > 0 && !musicStarted) {
              musicStarted = true; // Set musicStarted flag
              currentBgMusic.play().catch(error => {
                  console.log("Playback prevented by user gesture policy on volume change:", error);
              });
         } else if (currentBgMusic.paused && volumeSlider.value > 0 && musicStarted) {
             // If volume is increased from 0 while paused, and music was previously started by user, resume playback
              currentBgMusic.play().catch(error => {
                  console.log("Playback prevented by user gesture policy on volume change:", error);
              });
         }
    });

     // Initial icon and text update based on default state (paused and volume 1)
     // It will show the play icon and the "Click here to listen" text initially.
     updateAudioButtonIcon();


    // --- Button Click and Transition Logic ---
    claimButton.addEventListener('click', () => {
        claimButton.disabled = true; // Disable the button

        // Stop background music when button is clicked
        if (!bgMusic1.paused) {
            bgMusic1.pause();
            bgMusic1.currentTime = 0;
        }
        if (!bgMusic2.paused) {
            bgMusic2.pause();
            bgMusic2.currentTime = 0;
        }

        // Fade out audio control button along with other elements
        audioControlContainer.classList.add('fade-out');

        // Fade out individual main content elements
        pageTitle.classList.add('fade-out');
        pageQuote.classList.add('fade-out');
        claimButton.classList.add('fade-out');
        bottomElements.classList.add('fade-out');

        // Speed up the background grid animation
        document.body.classList.add('fast-grid');

        // After main content fades out (1 second transition + a small delay)
        setTimeout(() => {
            // Hide main content and bottom elements completely
            pageTitle.style.display = 'none';
            pageQuote.style.display = 'none';
            claimButton.style.display = 'none';
            bottomElements.style.display = 'none';
            audioControlContainer.style.display = 'none'; // Hide audio control

            // Activate the transition overlay
            transitionOverlay.classList.add('visible');

            // Start countdown
            countdownElement.style.display = 'block';
            let count = 3;
            countdownElement.textContent = `Your surprise coming in ${count}...`;

            const countdownInterval = setInterval(() => {
                count--;
                if (count > 0) {
                    countdownElement.textContent = `Your surprise coming in ${count}...`;
                } else {
                    clearInterval(countdownInterval);
                    countdownElement.textContent = 'Ready!';

                    // After countdown "Ready!", show video and launch fireworks
                    setTimeout(() => {
                        countdownElement.style.display = 'none'; // Hide countdown
                        videoPlaceholder.style.display = 'flex'; // Show video placeholder
                        giftVideo.play().catch(error => {
                             console.log("Video playback prevented:", error);
                        });

                        // Launch a burst of fireworks (volume is handled in explode method)
                        launchBigBurst(70);

                        // After video finishes (or a set duration), transition to black and redirect
                        const transitionDelayAfterVideo = 500;

                        giftVideo.onended = () => {
                             setTimeout(() => {
                                 transitionOverlay.classList.add('full-black');
                                 setTimeout(() => {
                                     window.location.href = 'birthday.html';
                                 }, 500);
                             }, transitionDelayAfterVideo);
                        };

                        const fallbackTimeout = (giftVideo.duration * 1000 || 3000) + transitionDelayAfterVideo;
                        setTimeout(() => {
                             if (!giftVideo.ended) {
                                 transitionOverlay.classList.add('full-black');
                                 setTimeout(() => {
                                     window.location.href = 'birthday.html';
                                 }, 500);
                                 }
                        }, fallbackTimeout);


                    }, 1000); // Delay after "Ready!" before showing video/fireworks
                }
            }, 1000); // Update countdown every 1 second
        }, 1000); // Delay for main content fade out transition to finish
    });
});