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

    // Animate from placeholder to destination
    ScrollTrigger.create({
        trigger: heroSection,
        start: 'top top',
        end: 'bottom top', // Scrub exactly until hero is out of view (and destination is in full view)
        scrub: true,
        onUpdate: (self) => {
            const p = self.progress;

            // Linear scrub is usually best for scroll
            const easeP = p;

            // Interpolate video coordinates
            const curTop = startBounds.top + (endBounds.top - startBounds.top) * easeP;
            const curLeft = startBounds.left + (endBounds.left - startBounds.left) * easeP;
            const curWidth = startBounds.width + (endBounds.width - startBounds.width) * easeP;
            const curHeight = startBounds.height + (endBounds.height - startBounds.height) * easeP;

            gsap.set(wrapper, {
                top: curTop,
                left: curLeft,
                width: curWidth,
                height: curHeight
            });

            // Fade out labels
            gsap.set(labels, { opacity: 1 - p * 3 });

            // Reduce border radius on the inner video container
            const radius = 8 * (1 - easeP);
            gsap.set(inner, { borderRadius: radius + 'px' });

            // Enable clicks when it's fully expanded (optional)
            wrapper.style.pointerEvents = p > 0.95 ? 'auto' : 'none';
        }
    });

    // Live Vietnam Time Clock
    const timeEl = document.getElementById('nav-time');
    if (timeEl) {
        setInterval(() => {
            const time = new Date().toLocaleTimeString('en-US', {
                timeZone: 'Asia/Ho_Chi_Minh',
                hour: '2-digit',
                minute: '2-digit'
            });
            timeEl.innerText = `${time} GMT+7`;
        }, 1000);
    }
});
