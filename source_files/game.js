document.addEventListener('DOMContentLoaded', () => {
    const diceContainer = document.getElementById('dice-container');
    const bowl = document.getElementById('open-bowl-btn');
    const shakeBtn = document.getElementById('shake-btn');

    // State
    let isDragging = false;
    let isOpen = false;
    let startX, startY;
    const DRAG_THRESHOLD = 100; // Pixels to drag to open

    // Cheat Mode State
    let cheatClicks = 0;
    const CLICK_THRESHOLD = 10; // Pixels to consider a "click" vs "drag"

    // Initialize
    // Randomize dice initially but keep hidden
    randomizeDice();

    // --- Drag Logic ---
    bowl.addEventListener('mousedown', startDrag);
    bowl.addEventListener('touchstart', startDrag, { passive: false });

    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });

    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);

    function startDrag(e) {
        if (isOpen) return; // Can't drag if already open

        isDragging = true;
        // Get start position
        if (e.type === 'touchstart') {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        } else {
            startX = e.clientX;
            startY = e.clientY;
        }

        // Disable transition during drag for responsiveness
        bowl.style.transition = 'none';
        bowl.style.cursor = 'grabbing';
    }

    function drag(e) {
        if (!isDragging) return;
        e.preventDefault(); // Prevent scrolling

        let clientX, clientY;
        if (e.type === 'touchmove') {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const deltaX = clientX - startX;
        const deltaY = clientY - startY;

        bowl.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    }

    function endDrag(e) {
        if (!isDragging) return;
        isDragging = false;

        // Re-enable transitions
        bowl.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s ease';
        bowl.style.cursor = 'grab';

        // Check if dragged far enough
        let clientX, clientY;
        // For touchend, changedTouches
        if (e.type === 'touchend') {
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const deltaX = clientX - startX;
        const deltaY = clientY - startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance > DRAG_THRESHOLD) {
            openBowl();
        } else {
            resetBowlPosition();
        }

        // Mark as "has moved" if distance is significant to prevent click
        if (distance > CLICK_THRESHOLD) {
            bowl.dataset.moved = 'true';
        } else {
            bowl.dataset.moved = 'false';
        }
    }

    // Add native click event
    bowl.addEventListener('click', (e) => {
        // Only trigger if we haven't moved significantly (i.e., it's a tap/click)
        // And if the bowl is not currently open/opening
        if (!isOpen && bowl.dataset.moved !== 'true') {
            handleCheatClick();
        }
        // Reset moved state
        bowl.dataset.moved = 'false';
    });

    function handleCheatClick() {
        cheatClicks++;
        console.log("Cheat Count:", cheatClicks);

        // Apply Cheat Logic IMMEDIATELY upon click
        // Even clicks -> Tai (11-17), Odd clicks -> Xiu (4-10)
        const target = (cheatClicks % 2 === 0) ? 'tai' : 'xiu';
        console.log(`Click Action: Forcing ${target.toUpperCase()}`);
        forceResult(target);
    }

    function openBowl() {
        isOpen = true;
        // Move bowl out of view or fade out
        // Let's fade it out and scale up slightly for effect,
        // AND move it to where it was dragged + a bit more?
        // Or just hide it smoothly.
        bowl.classList.add('opacity-0', 'pointer-events-none');
        bowl.style.transform = 'scale(1.1)'; // Reset translate, rely on opacity



        // Calculate result logic here or log it
        // The dice are already rendered from the shake/init,
        // but let's re-render just to be safe if we want "instant" feel upon open?
        // Actually, "Mở bát" usually shows what's already there (from Shakng).
        // So we just show.
        calculateResult();
    }

    function forceResult(type) {
        let results = [];
        let total = 0;
        let valid = false;

        // Loop until we get a valid combination
        while (!valid) {
            results = [
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1
            ];
            total = results.reduce((a, b) => a + b, 0);

            if (type === 'tai' && total >= 11 && total <= 17) valid = true;
            if (type === 'xiu' && total >= 4 && total <= 10) valid = true;
        }

        // Update dice immediately before user sees (bowl is opening)
        renderDice(results);
        bowl.dataset.results = JSON.stringify(results);
    }

    function resetBowlPosition() {
        bowl.style.transform = 'translate(0, 0)';
    }

    // --- Shake Logic ---
    if (shakeBtn) {
        shakeBtn.addEventListener('click', shakeBowl);
    }

    function shakeBowl() {
        if (isOpen) {
            // Close the bowl first
            closeBowl();
            // Wait for close animation then shake?
            // Or just shake immediately.
            setTimeout(performShake, 300);
        } else {
            performShake();
        }
    }

    function closeBowl() {
        isOpen = false;
        bowl.classList.remove('opacity-0', 'pointer-events-none');
        resetBowlPosition();
    }

    function performShake() {
        // Reset cheat clicks
        cheatClicks = 0;
        console.log("Shake - Cheat Reset");

        // Disable transition for instant shake movements
        bowl.style.transition = 'none';

        // Add visual shake effect
        let startTime = Date.now();
        const duration = 500; // ms

        // Simple JS animation for shake
        const shakeInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            if (elapsed > duration) {
                clearInterval(shakeInterval);
                // Reset position and transition
                bowl.style.transform = 'translate(0, 0)';
                bowl.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s ease';
                randomizeDice(); // Randomize AFTER shake
                return;
            }

            const dx = (Math.random() - 0.5) * 40; // Increased shake intensity
            const dy = (Math.random() - 0.5) * 40;
            bowl.style.transform = `translate(${dx}px, ${dy}px) rotate(${Math.random() * 10 - 5}deg)`; // Add slight rotation
        }, 50);
    }

    // --- Game Logic ---

    function randomizeDice() {
        const results = [
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1
        ];
        renderDice(results);

        // Sace results for when opened
        bowl.dataset.results = JSON.stringify(results);
    }

    function calculateResult() {
        const results = JSON.parse(bowl.dataset.results || '[]');
        if (!results.length) return;

        const total = results.reduce((a, b) => a + b, 0);
        const isTai = total >= 11 && total <= 17;

        console.log(`Open: ${results.join(', ')} - Total: ${total} - ${isTai ? 'TAI' : 'XIU'}`);
    }

    function renderDice(numbers) {
        diceContainer.innerHTML = '';

        // Rotations for natural look now handled by 3D transform + random base rotation
        // We will wrap the 3D scene in a container that has the random rotation

        numbers.forEach((num, index) => {
            const dieHTML = getDiceCubeHTML(num);
            diceContainer.innerHTML += dieHTML;
        });
    }

    function getDiceCubeHTML(num) {
        // We use a scene wrapper for the perspective and positioning
        // And inner cube for the 3D faces

        // Mapping of dot layouts for each face (1-6)
        // We define the faces once and reuse them.

        const dotBase = `bg-black rounded-full`;
        const dotRed = `bg-primary rounded-full`;

        const getFaceContent = (n) => {
            switch (n) {
                case 1: return `<div class="size-8 ${dotRed} shadow-inner"></div>`;
                case 2: return `<div class="flex flex-col justify-between h-8 w-8 p-1"><div class="size-2 ${dotBase} self-start"></div><div class="size-2 ${dotBase} self-end"></div></div>`;
                case 3: return `<div class="flex flex-col justify-between h-8 w-8 p-1"><div class="size-2 ${dotBase} self-start"></div><div class="size-2 ${dotBase} self-center"></div><div class="size-2 ${dotBase} self-end"></div></div>`;
                case 4: return `<div class="grid grid-cols-2 gap-2 p-2"><div class="size-2 ${dotBase}"></div><div class="size-2 ${dotBase}"></div><div class="size-2 ${dotBase}"></div><div class="size-2 ${dotBase}"></div></div>`;
                case 5: return `<div class="relative size-8 flex items-center justify-center"><div class="absolute top-0 left-0 size-2 ${dotBase}"></div><div class="absolute top-0 right-0 size-2 ${dotBase}"></div><div class="size-2 ${dotBase}"></div><div class="absolute bottom-0 left-0 size-2 ${dotBase}"></div><div class="absolute bottom-0 right-0 size-2 ${dotBase}"></div></div>`;
                case 6: return `<div class="grid grid-cols-2 gap-x-2 gap-y-1 p-2"><div class="size-2 ${dotBase}"></div><div class="size-2 ${dotBase}"></div><div class="size-2 ${dotBase}"></div><div class="size-2 ${dotBase}"></div><div class="size-2 ${dotBase}"></div><div class="size-2 ${dotBase}"></div></div>`;
                default: return '';
            }
        };

        // Construct all 6 faces
        let facesHTML = '';
        for (let i = 1; i <= 6; i++) {
            facesHTML += `<div class="cube__face cube__face--${i}">${getFaceContent(i)}</div>`;
        }

        // Random rotation for the scene container to make it look "tossed"
        const rotation = `rotate-${[0, 6, 12, 45][Math.floor(Math.random() * 4)]}`;
        // Actually, let's keep the scene flat and just show the cube.
        // Or we can rotate the container slightly?
        // Let's stick to the `show-${num}` class doing the work for the result face.
        // We can add a random Z-rotation to the whole scene div for variety.
        const randomDeg = Math.floor(Math.random() * 360);

        return `
            <div class="scene" style="transform: rotate(${randomDeg}deg)">
                <div class="cube show-${num}">
                    ${facesHTML}
                </div>
            </div>
        `;
    }
});
