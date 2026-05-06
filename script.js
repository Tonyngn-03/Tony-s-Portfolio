tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                pixel: ['VT323', 'monospace'],
                sans: ['Space Grotesk', 'sans-serif'],
                display: ['Anton', 'sans-serif'],
            },
            colors: {
                retro: {
                    bg: '#050505',
                    pink: '#ff4c8b',
                    blue: '#4c6fff',
                    orange: '#ff6b00',
                    yellow: '#f2e800'
                }
            },
            animation: {
                'float-slow': 'float 6s ease-in-out infinite',
                'float-fast': 'float 4s ease-in-out infinite',
                'float-medium': 'float 5s ease-in-out infinite',
                'spin-slow': 'spin 8s linear infinite',
                'blink': 'blink 1.5s step-end infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                blink: {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0 },
                }
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    // ==========================================
    // UTILITIES
    // ==========================================
    function splitTextToSpans(selectorOrElement) {
        const elements = typeof selectorOrElement === 'string'
            ? document.querySelectorAll(selectorOrElement)
            : [selectorOrElement];

        const allItems = [];
        elements.forEach(element => {
            if (!element) return;
            const text = element.innerText;
            element.innerHTML = '';
            [...text].forEach(char => {
                const wrapper = document.createElement('span');
                wrapper.className = 'reveal-wrapper';
                const item = document.createElement('span');
                item.className = 'reveal-item';
                item.innerText = char === ' ' ? '\u00A0' : char;
                wrapper.appendChild(item);
                element.appendChild(wrapper);
                allItems.push(item);
            });
        });
        return allItems;
    }

    // ==========================================
    // LOADING SCREEN ANIMATION
    // ==========================================
    const loadingScreen = document.getElementById('loading-screen');
    const mainContent = document.getElementById('main-content');

    if (loadingScreen && mainContent) {
        // Lock scroll during load
        document.body.style.overflow = 'hidden';
        window.scrollTo(0, 0);

        const label = document.getElementById('loader-label');
        const counterEl = document.getElementById('loader-counter');
        const progressEl = document.getElementById('loader-progress');
        const wordsContainer = document.getElementById('loader-words-container');

        const words = ["DESIGN", "CREATE", "INSPIRE"];
        const tl = gsap.timeline({
            onComplete: () => {
                // Prepare text splitting before fade-in to avoid layout jumps
                const navItems = splitTextToSpans('#hero-nav .reveal-item');
                const heroChars = splitTextToSpans('#hero-title');
                const subItems = splitTextToSpans('#text-left, #text-right, #hero-scroll-cue, #animating-labels span');
                const videoInner = document.getElementById('animating-video-inner');
                const heroVideo = document.getElementById('hero-video');

                // Hide immediately to prevent flash
                if (navItems.length) gsap.set(navItems, { yPercent: 100 });
                if (heroChars.length) gsap.set(heroChars, { yPercent: 100 });
                if (subItems.length) gsap.set(subItems, { yPercent: 100 });

                // Video initial state
                if (videoInner) gsap.set(videoInner, { clipPath: 'inset(100% 0% 0% 0%)' });
                if (heroVideo) gsap.set(heroVideo, { scale: 1.2 });

                // Master transition timeline for a smooth cross-fade
                const masterTl = gsap.timeline({
                    onComplete: () => {
                        loadingScreen.style.display = 'none';
                        ScrollTrigger.refresh();
                    }
                });

                // 1. Loader fades out (0.8s)
                masterTl.to(loadingScreen, {
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.inOut"
                });

                // 2. Main content fades in (start mid-way through loader fade)
                masterTl.to(mainContent, {
                    opacity: 1,
                    duration: 0.8,
                    ease: "power2.out",
                    onStart: () => {
                        document.body.style.overflow = '';
                    }
                }, "-=0.4");

                // 3. Trigger reveals (starts slightly after main content starts fading in)
                masterTl.add(() => {
                    // 1. Nav & Time (Top) — Delay 0.0s
                    if (navItems.length > 0) {
                        gsap.to(navItems, {
                            yPercent: 0, duration: 1, stagger: 0.005, ease: "expo.out", delay: 0.0, force3D: true
                        });
                    }

                    // 2. Hero Title — Delay 0.5s
                    if (heroChars.length > 0) {
                        gsap.to(heroChars, {
                            yPercent: 0, duration: 1.4, stagger: 0.03, ease: "expo.out", delay: 0.5, force3D: true
                        });
                    }

                    // 3. Sub Titles & Cues — Delay 1.0s
                    if (subItems.length > 0) {
                        gsap.to(subItems, {
                            yPercent: 0, duration: 1.2, stagger: 0.015, ease: "expo.out", delay: 1.0, force3D: true
                        });
                    }

                    // 4. Video Reveal — Delay 1.5s
                    if (videoInner) {
                        gsap.to(videoInner, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: "expo.out", delay: 1.5 });
                    }
                    if (heroVideo) {
                        gsap.to(heroVideo, { scale: 1, duration: 1.5, ease: "expo.out", delay: 1.5 });
                        heroVideo.play().catch(e => console.log("Autoplay prevented:", e));
                    }
                }, "-=0.6");
            }
        });

        const themes = [
            { bg: "#000000", text: "#ffffff" },
            { bg: "#341c09", text: "#F2F1EC" }, // Brown & Cream
            { bg: "#F2F1EC", text: "#0e0c0a" }  // Cream & Dark
        ];

        // Ensure GSAP has a solid starting hex color to interpolate from
        gsap.set(loadingScreen, { backgroundColor: "#000000", color: "#ffffff" });

        // 0.0s — Label & Counter Slide in
        gsap.set(label, { opacity: 0 }); // reset opacity explicitly
        tl.to(label, { opacity: 0.5, y: 0, duration: 0.6, ease: "power2.out" }, 0);
        tl.to(counterEl, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0);

        // Rotating Words
        words.forEach((word, index) => {
            const span = document.createElement('span');
            span.innerText = word;
            // Removed explicit text color so it inherits from loadingScreen
            span.className = "absolute text-4xl md:text-6xl lg:text-7xl font-display tracking-tight opacity-0 italic";
            gsap.set(span, { y: 20 });
            wordsContainer.appendChild(span);

            // Stagger each word by 1.5s to give more reading time and avoid overlap
            const startTime = index * 1.5;

            // Theme change starts slightly before the word enters (during the previous word's exit)
            const themeStartTime = index === 0 ? 0 : startTime - 0.4;

            if (themes[index]) {
                tl.to(loadingScreen, {
                    backgroundColor: themes[index].bg,
                    duration: 0.6,
                    ease: "power2.inOut"
                }, themeStartTime);

                tl.to(loadingScreen, {
                    color: themes[index].text,
                    duration: 0.6,
                    ease: "power2.inOut"
                }, themeStartTime);
            }

            // Enter animation (word sliding up) starts exactly at its turn
            tl.to(span, { opacity: 0.8, y: 0, duration: 0.5, ease: "power2.out" }, startTime);

            // Exit animation starts at 1.1s, lasts 0.4s (finishes exactly at 1.5s when the next word enters)
            if (index < words.length - 1) {
                tl.to(span, { opacity: 0, y: -20, duration: 0.4, ease: "power2.in" }, startTime + 1.1);
            }
        });

        // Counter (000 -> 100 over 4.0s) & Progress Bar
        const counterObj = { val: 0 };
        tl.to(counterObj, {
            val: 100,
            duration: 4.0,
            ease: "none",
            onUpdate: () => {
                const progress = counterObj.val;
                counterEl.innerText = Math.round(progress).toString().padStart(3, '0');
                gsap.set(progressEl, { scaleX: progress / 100 });
            }
        }, 0);

        // Wait 500ms after the counter finishes (total duration 4.5s before fading out)
        tl.to({}, { duration: 0.5 });
    }

    const heroSection = document.getElementById('hero-section');
    const placeholder = document.getElementById('video-placeholder');
    const destination = document.getElementById('video-destination');
    const wrapper = document.getElementById('animating-video-wrapper');
    const inner = document.getElementById('animating-video-inner');
    const labels = document.getElementById('animating-labels');

    if (!heroSection || !placeholder || !destination || !wrapper) return;

    // We calculate bounds once, and on resize
    let startBounds = {};
    let endBounds = {};
    function updateBounds() {
        // Since wrapper is absolute relative to body (assuming body has no relative parent)
        // we can use offsetTop/offsetLeft. But getBoundingClientRect + window.scrollY is safer.
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const scrollX = window.scrollX || document.documentElement.scrollLeft;

        const pRect = placeholder.getBoundingClientRect();
        startBounds = {
            top: pRect.top + scrollY,
            left: pRect.left + scrollX,
            width: pRect.width,
            height: pRect.height
        };

        const dRect = destination.getBoundingClientRect();
        endBounds = {
            top: dRect.top + scrollY,
            left: dRect.left + scrollX,
            width: dRect.width,
            height: dRect.height
        };

        // (Text merge animation logic removed)

        // Apply initial state
        gsap.set(wrapper, {
            top: startBounds.top,
            left: startBounds.left,
            width: startBounds.width,
            height: startBounds.height
        });
    }

    // Call initially and on resize
    updateBounds();
    window.addEventListener('resize', () => {
        updateBounds();
        ScrollTrigger.refresh();
    });

    // ── Text merge: A VISUAL ← → DESIGNER come together on scroll ────
    const textLeft = document.getElementById('text-left');
    const textRight = document.getElementById('text-right');

    if (textLeft && textRight) {
        // Calculate how far each word needs to travel to meet in the center.
        // We do this dynamically so it works on any screen width.
        function getTextOffset() {
            const lRect = textLeft.getBoundingClientRect();
            const rRect = textRight.getBoundingClientRect();
            const center = window.innerWidth / 2;
            // Distance from current edge to center (where they'll meet)
            const leftTarget = center - lRect.right;  // positive = move right
            const rightTarget = center - rRect.left;    // negative = move left
            return { leftTarget, rightTarget };
        }

        let offsets = getTextOffset();
        window.addEventListener('resize', () => { offsets = getTextOffset(); });

        ScrollTrigger.create({
            trigger: heroSection,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
            onUpdate: (self) => {
                const p = self.progress;
                // Ease: words start moving slowly then snap together
                const ease = p * p; // quadratic — slow start, faster finish
                gsap.set(textLeft, { x: offsets.leftTarget * ease });
                gsap.set(textRight, { x: offsets.rightTarget * ease });
                // Also fade out the words as video fully expands
                gsap.set([textLeft, textRight], { opacity: 1 - Math.max(0, (p - 0.7) / 0.3) });
            }
        });
    }

    // ── Video element & mute button refs ─────────────────────────────
    const video = document.getElementById('hero-video');
    const muteBtn = document.getElementById('mute-btn');
    const iconOn = document.getElementById('icon-sound-on');
    const iconOff = document.getElementById('icon-sound-off');

    // Volume constants
    const START_VOL = 0.5; // volume khi người dùng mới bật tiếng
    const MAX_VOL = 1.0; // volume tối đa khi video full-screen

    // Helper: set volume (chỉ hoạt động khi video đang unmuted)
    function setVol(v) {
        if (!video || video.muted) return;
        video.volume = Math.max(0, Math.min(1, v));
    }

    // ── ScrollTrigger 1: Hero phình to video full-screen ─────────────
    // Volume: 0 → MAX_VOL as scroll progress goes 0 → 1
    ScrollTrigger.create({
        trigger: heroSection,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
            const p = self.progress;
            const easeP = p;

            // Interpolate video coordinates
            const curTop = startBounds.top + (endBounds.top - startBounds.top) * easeP;
            const curLeft = startBounds.left + (endBounds.left - startBounds.left) * easeP;
            const curWidth = startBounds.width + (endBounds.width - startBounds.width) * easeP;
            const curHeight = startBounds.height + (endBounds.height - startBounds.height) * easeP;

            gsap.set(wrapper, { top: curTop, left: curLeft, width: curWidth, height: curHeight });

            // Fade out labels
            gsap.set(labels, { opacity: 1 - p * 3 });



            // Volume: START_VOL → MAX_VOL theo scroll progress
            setVol(START_VOL + (MAX_VOL - START_VOL) * easeP);

            // Enable pointer events when fully expanded
            wrapper.style.pointerEvents = p > 0.95 ? 'auto' : 'none';
        }
    });

    // ── ScrollTrigger 2: Video-destination → #about (volume fade-out) ─
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
        ScrollTrigger.create({
            trigger: destination,
            start: 'bottom bottom', // khi bottom của destination chạm bottom viewport
            end: () => `+=${aboutSection.offsetHeight * 0.5}`, // nửa chiều cao about
            scrub: true,
            onUpdate: (self) => {
                // Volume: MAX_VOL → 0
                setVol(MAX_VOL * (1 - self.progress));
            }
        });
    }


    // ── Mute button: hover show/hide + toggle ─────────────────────────
    if (video && muteBtn && inner) {
        inner.addEventListener('mouseenter', () => { muteBtn.style.opacity = '1'; });
        inner.addEventListener('mouseleave', () => { muteBtn.style.opacity = '0'; });

        muteBtn.addEventListener('click', () => {
            video.muted = !video.muted;
            if (!video.muted) {
                // Bật tiếng: set volume theo vị trí scroll hiện tại
                const st = ScrollTrigger.getAll().find(t => t.trigger === heroSection);
                const p = st ? st.progress : 0;
                video.volume = Math.max(0, Math.min(1, START_VOL + (MAX_VOL - START_VOL) * p));
            }
            iconOn.style.display = video.muted ? 'none' : 'block';
            iconOff.style.display = video.muted ? 'block' : 'none';
        });
    }

    // ── Live Vietnam Time Clock ───────────────────────────────────────
    const timeEl = document.getElementById('nav-time');
    if (timeEl) {
        const updateTime = () => {
            const time = new Date().toLocaleTimeString('en-US', {
                timeZone: 'Asia/Ho_Chi_Minh',
                hour: '2-digit',
                minute: '2-digit'
            });
            timeEl.innerText = `${time} GMT+7`;
        };

        // Update immediately to get correct time before splitting
        updateTime();

        // Delay the interval so it doesn't overwrite the spans during the intro animation
        setTimeout(() => {
            setInterval(updateTime, 1000);
        }, 4000);
    }

    // ── Break Section: hover "POSSIBLE" → invert entire section ──────
    const possibleWord = document.getElementById('break-possible');
    const breakSection = document.getElementById('break');
    if (possibleWord && breakSection) {
        possibleWord.addEventListener('mouseenter', () => {
            breakSection.classList.add('break-inverted');
        });
        possibleWord.addEventListener('mouseleave', () => {
            breakSection.classList.remove('break-inverted');
        });
    }

    // ── Archive: Motion Learning Video hover-to-play ──────────────────
    const motionVideo = document.getElementById('motion-learning-video');
    if (motionVideo) {
        const motionCard = motionVideo.closest('.work-card');
        if (motionCard) {
            const playVideo = () => motionVideo.play().catch(e => console.log("Playback error:", e));
            const pauseVideo = () => motionVideo.pause();

            motionCard.addEventListener('mouseenter', playVideo);
            motionCard.addEventListener('mouseleave', pauseVideo);

            // Touch support
            motionCard.addEventListener('touchstart', (e) => {
                if (motionVideo.paused) {
                    playVideo();
                } else {
                    pauseVideo();
                }
            }, { passive: true });
        }
    }

    // ── Archive: Gamee Studio Video hover-to-play ─────────────────────
    const gameeVideo = document.getElementById('gamee-studio-video');
    if (gameeVideo) {
        const gameeCard = gameeVideo.closest('.work-card');
        if (gameeCard) {
            const playVideo = () => gameeVideo.play().catch(e => console.log("Playback error:", e));
            const pauseVideo = () => gameeVideo.pause();

            gameeCard.addEventListener('mouseenter', playVideo);
            gameeCard.addEventListener('mouseleave', pauseVideo);

            // Touch support
            gameeCard.addEventListener('touchstart', (e) => {
                if (gameeVideo.paused) {
                    playVideo();
                } else {
                    pauseVideo();
                }
            }, { passive: true });
        }
    }

    // ── Archive: Dynamic Video Modal ──────────────────────────
    const modalCards = document.querySelectorAll('.work-card[data-video]');
    const videoModal = document.getElementById('video-modal');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalContainer = document.getElementById('modal-container');
    const modalVideo = document.getElementById('modal-video');
    const modalClose = document.getElementById('modal-close');
    const modalTitle = document.getElementById('modal-project-title');

    if (modalCards.length > 0 && videoModal && modalBackdrop && modalContainer && modalVideo) {
        modalCards.forEach(card => {
            card.addEventListener('click', () => {
                const videoSrc = card.getAttribute('data-video');
                const projectTitle = card.getAttribute('data-title');

                if (videoSrc && projectTitle) {
                    // Update content
                    modalVideo.src = videoSrc;
                    modalTitle.innerText = projectTitle;

                    // Disable scroll
                    document.body.style.overflow = 'hidden';

                    // Show modal element
                    videoModal.classList.remove('hidden');

                    // Animation
                    const tl = gsap.timeline();
                    tl.to(modalBackdrop, { opacity: 1, duration: 0.5, ease: "power2.out" })
                        .to(modalContainer, { opacity: 1, scale: 1, duration: 0.6, ease: "expo.out" }, "-=0.3");

                    // Play video
                    modalVideo.play().catch(e => console.log("Modal video playback error:", e));
                }
            });
        });

        const closeModal = () => {
            const tl = gsap.timeline({
                onComplete: () => {
                    videoModal.classList.add('hidden');
                    document.body.style.overflow = '';
                    modalVideo.pause();
                    modalVideo.src = ""; // Clear source to stop loading
                }
            });

            tl.to(modalContainer, { opacity: 0, scale: 0.95, duration: 0.4, ease: "power2.in" })
                .to(modalBackdrop, { opacity: 0, duration: 0.4, ease: "power2.in" }, "-=0.2");
        };

        modalClose.addEventListener('click', closeModal);
        modalBackdrop.addEventListener('click', closeModal);

        // Escape key to close
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !videoModal.classList.contains('hidden')) {
                closeModal();
            }
        });
    }
});
