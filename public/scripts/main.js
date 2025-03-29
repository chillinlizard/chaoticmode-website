// Add this to the very top of your main.js file, outside any event handlers
let pendingAction = null;

// Create a global variable to track whether the blue button finale has completed
window.blueButtonFinaleCompleted = false;

document.addEventListener('DOMContentLoaded', function () {
    // Global mobile detection
    window.isMobile = function () {
        const mobileWidth = 768; // Breakpoint for mobile devices
        const isMobileView = window.innerWidth <= mobileWidth;

        // Optional: add debug output if needed
        console.log(`[DEBUG] Window width: ${window.innerWidth}, isMobile: ${isMobileView}`);

        return isMobileView;
    };

    // Check for stored trigger actions immediately
    pendingAction = sessionStorage.getItem('triggerAction');
    if (pendingAction) {
        // Remove it immediately to prevent re-triggering
        sessionStorage.removeItem('triggerAction');
        console.log("Detected pending action: " + pendingAction);
    }

    // Console debug helper
    function debugInfo(message) {
        console.log(`[DEBUG] ${message}`);
    }

    // Set up global variables
    window.isScrollLocked = !isMobile(); // Locked for desktop, unlocked for mobile


    // Initial setup for mobile/desktop mode
    // Updated setupInitialMode function
    function setupInitialMode() {
        if (isMobile()) {
            debugInfo('Mobile mode activated');

            // Disable scroll snapping for mobile
            const container = document.querySelector('.desktop-container');
            if (container) {
                container.style.cssText = 'scroll-snap-type: none !important; height: auto !important; overflow-y: auto !important;';
            }

            // Make both screens visible on mobile
            const screens = document.querySelectorAll('.desktop-screen');
            screens.forEach(screen => {
                screen.style.cssText = 'height: auto !important; min-height: auto !important; scroll-snap-align: none !important;';
                screen.classList.add('active-screen');
            });

            // Updated window positioning for top header layout
            const windows = document.querySelectorAll('.window:not(#about)');
            windows.forEach(window => {
                // Remove specific inline positioning to let CSS handle it
                window.style.display = 'block';
                // Do not set position, width, or margins here - let CSS control it
            });

            // Hide about window initially
            const aboutWindow = document.getElementById('about');
            if (aboutWindow) {
                aboutWindow.style.display = 'none';
            }

            // Hide navigation dots
            const navDots = document.querySelector('.desktop-nav');
            if (navDots) {
                navDots.style.display = 'none';
            }
        } else {
            debugInfo('Desktop mode activated');

            // Ensure screens are set up correctly
            const screens = document.querySelectorAll('.desktop-screen');
            screens.forEach((screen, i) => {
                screen.style.height = '100vh';
                screen.style.minHeight = '100vh';
                screen.classList.toggle('active-screen', i === 0); // Set first screen as active
            });

            // Set up container for snap scrolling
            const container = document.querySelector('.desktop-container');
            if (container) {
                container.style.cssText = 'scroll-snap-type: y mandatory; height: 100vh; overflow-y: hidden;';
            }
        }

        // Add a special class to the body to mark the mode
        document.body.classList.remove('mobile-mode', 'desktop-mode');
        document.body.classList.add(isMobile() ? 'mobile-mode' : 'desktop-mode');
    }

    // Run initial setup
    setupInitialMode();

    // Rerun after a short delay to make sure it applies
    setTimeout(setupInitialMode, 100);

    // Run on window load to ensure all assets are loaded
    window.addEventListener('load', setupInitialMode);

    // Run on resize
    window.addEventListener('resize', setupInitialMode);

    // Add a special class to the body to mark the mode
    document.body.classList.add(isMobile() ? 'mobile-mode' : 'desktop-mode');
    window.addEventListener('resize', function () {
        document.body.classList.remove('mobile-mode', 'desktop-mode');
        document.body.classList.add(isMobile() ? 'mobile-mode' : 'desktop-mode');
    });
});

// This function will handle scrolling to elements on mobile
function scrollToElementMobile(elementId) {
    // Only run on mobile
    if (!isMobile()) return;

    const element = document.getElementById(elementId);
    if (!element) return;

    // Get the header height to offset the scroll position
    const header = document.querySelector('.layout_header');
    const headerHeight = header ? header.offsetHeight : 0;

    // Calculate the element's position
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;

    // Scroll to the element with an offset for the header
    window.scrollTo({
        top: elementPosition - headerHeight - 20, // Extra 20px padding
        behavior: 'smooth'
    });

    // Optional: Add a highlight effect to show the user where they scrolled to
    element.classList.add('mobile-highlight');
    setTimeout(() => {
        element.classList.remove('mobile-highlight');
    }, 1000);
}


document.addEventListener('DOMContentLoaded', function () {
    // Original Window Management Code
    let activeWindows = [];

    // Open main container and secondary container windows by default
    openWindow('main-container');
    openWindow('secondary-container');

    // Desktop icons
    const icons = document.querySelectorAll('.icon');
    icons.forEach(icon => {
        icon.addEventListener('click', function () {
            const windowId = this.getAttribute('data-window');

            // Special handling for the Game icon on mobile
            if (windowId === 'game') {
                if (isMobile()) {
                    // Mobile behavior: Show and scroll to the game window
                    const gameWindow = document.getElementById('top-right-container');
                    if (gameWindow) {
                        // Make sure the window is visible
                        gameWindow.style.display = 'block';
                        // Apply glitch effect 
                        applyGlitchEffectToWindow(gameWindow);
                        // Scroll to the game window
                        scrollToElementMobile('top-right-container');
                    }
                } else {
                    // Keep original desktop behavior
                    const gameWindow = document.getElementById('top-right-container');

                    // Scroll to screen1 if currently on screen2
                    if (currentSection !== 0) {
                        scrollToSection(0);
                        // Make sure the game window is open
                        setTimeout(() => {
                            openWindow('top-right-container');
                            applyGlitchEffectToWindow(gameWindow);
                        }, 500);
                    } else {
                        // Already on screen1, just open and glitch the window
                        openWindow('top-right-container');
                        applyGlitchEffectToWindow(gameWindow);
                    }
                }
            }

            // Special handling for the Team/About icon on mobile
            else if (windowId === 'about') {
                if (isMobile()) {
                    // Mobile behavior: Show and scroll to the about window
                    const aboutWindow = document.getElementById('about');
                    if (aboutWindow) {
                        // Make sure the window is visible
                        aboutWindow.style.display = 'block';
                        // Scroll to the about window
                        scrollToElementMobile('about');
                    }
                } else {
                    // Keep original desktop behavior
                    // If on screen2, scroll to screen1 first, then open the About window
                    if (currentSection !== 0) {
                        // First, temporarily hide the secondary container for a smoother transition
                        const secondaryContainer = document.getElementById('secondary-container');
                        if (secondaryContainer) {
                            secondaryContainer.style.transition = 'opacity 0.2s ease-out';
                            secondaryContainer.style.opacity = '0.8';
                        }

                        scrollToSection(0);

                        // Wait for scrolling to complete before opening About window
                        // Increased timeout to ensure screen1 is fully active before positioning
                        setTimeout(() => {
                            // Restore secondary container visibility
                            if (secondaryContainer) {
                                secondaryContainer.style.opacity = '1';
                            }

                            positionAboutWindow();
                            openWindow('about');
                        }, 800);
                    } else {
                        // Already on screen1, fade out the secondary container slightly
                        const secondaryContainer = document.getElementById('secondary-container');
                        if (secondaryContainer) {
                            secondaryContainer.style.transition = 'opacity 0.2s ease-out';
                            secondaryContainer.style.opacity = '0.8';

                            // Brief timeout to let the fade effect happen before showing the About window
                            setTimeout(() => {
                                positionAboutWindow();
                                openWindow('about');

                                // Restore secondary container opacity after the About window appears
                                setTimeout(() => {
                                    secondaryContainer.style.opacity = '1';
                                }, 400);
                            }, 100);
                        } else {
                            // Fallback if secondary container isn't found
                            positionAboutWindow();
                            openWindow('about');
                        }
                    }
                }
            }

            // Special handling for the Home icon
            else if (windowId === 'main-container') {
                // Check if the About window is open and we're on screen1
                const aboutWindow = document.getElementById('about');
                if (currentSection === 0 && aboutWindow && aboutWindow.style.display === 'block') {
                    // Apply fade-out animation
                    aboutWindow.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
                    aboutWindow.style.opacity = '0';
                    aboutWindow.style.transform = 'translateY(-20px)';

                    // Hide after animation completes and then show secondary container
                    setTimeout(() => {
                        aboutWindow.style.display = 'none';
                        // Reset transform for next time it's shown
                        aboutWindow.style.transform = '';

                        // Make sure secondary-container is visible
                        openWindow('secondary-container');
                    }, 300);
                } else {
                    // Scroll to screen1 if currently on screen2
                    if (currentSection !== 0) {
                        scrollToSection(0);
                    }

                    // Close all windows on screen1 except main-container and secondary-container
                    const windows = document.querySelectorAll('.window:not(#main-container):not(#secondary-container)');
                    windows.forEach(window => {
                        // Check if this window is not fixed in screen2
                        if (!window.classList.contains('fixed-window')) {
                            window.style.display = 'none';
                        }
                    });

                    // Make sure main-container and secondary-container are both open
                    openWindow('main-container');
                    openWindow('secondary-container');
                }
            }

            // Special handling for the Blog icon
            else if (windowId === 'blog') {
                // Close the about window if it's open
                const aboutWindow = document.getElementById('about');
                if (aboutWindow && aboutWindow.style.display === 'block') {
                    // Apply fade-out animation
                    aboutWindow.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
                    aboutWindow.style.opacity = '0';
                    aboutWindow.style.transform = 'translateY(-20px)';

                    // Delay scrolling to allow animation to start
                    setTimeout(() => {
                        // Scroll to screen2 if currently on screen1
                        if (currentSection !== 1) {
                            scrollToSection(1);
                        }

                        // Hide after animation completes
                        setTimeout(() => {
                            aboutWindow.style.display = 'none';
                            // Reset transform for next time it's shown
                            aboutWindow.style.transform = '';
                        }, 200);
                    }, 100);
                } else {
                    // Scroll immediately if About window is not open
                    if (currentSection !== 1) {
                        scrollToSection(1);
                    }
                }

                // No need to close windows on screen2 since they're all fixed
                // Just ensure terminal animation runs if it hasn't already
                setTimeout(checkTerminalVisibility, 500);
            }
            // Special handling for the Game icon
            else if (windowId === 'game') {
                // Get the top-right-container window
                const gameWindow = document.getElementById('top-right-container');

                // Scroll to screen1 if currently on screen2
                if (currentSection !== 0) {
                    scrollToSection(0);
                    // Make sure the game window is open
                    setTimeout(() => {
                        openWindow('top-right-container');
                        applyGlitchEffectToWindow(gameWindow);
                    }, 500);
                } else {
                    // Already on screen1, just open and glitch the window
                    openWindow('top-right-container');
                    applyGlitchEffectToWindow(gameWindow);
                }
            }
            else {
                // Regular window opening behavior
                openWindow(windowId);
            }
        });
    });

    // Function to position the About window exactly over the secondary container
    function positionAboutWindow() {
        const secondaryContainer = document.getElementById('secondary-container');
        const aboutWindow = document.getElementById('about');

        if (secondaryContainer && aboutWindow) {
            console.log("Positioning About window over secondary container");

            // Get the dimensions of the secondary container
            const rect = secondaryContainer.getBoundingClientRect();

            // First completely reset styles
            aboutWindow.style.cssText = `
            position: absolute;
            display: block;
            opacity: 0;
            transition: none;
            transform: none;
            z-index: 20;
          `;

            // Force a reflow
            aboutWindow.offsetHeight;

            // Set dimensions to match secondary container
            aboutWindow.style.width = rect.width + 'px';
            aboutWindow.style.height = rect.height + 'px';

            // Position absolutely at the same position
            aboutWindow.style.top = rect.top + 'px';
            aboutWindow.style.left = rect.left + 'px';

            // Set transform for animation
            aboutWindow.style.transform = 'translateY(20px)';

            // Force another reflow
            aboutWindow.offsetHeight;

            console.log(`About window positioned at (${rect.left}, ${rect.top})`);
        } else {
            console.error("Secondary container or about window not found");
        }
    }


    // Function to apply glitch effect to a window
    function applyGlitchEffectToWindow(window) {
        // Add glitch effect class - this will apply just the shaking animation
        window.classList.add('glitch-effect');

        // Remove effect after animation completes
        setTimeout(() => {
            window.classList.remove('glitch-effect');
        }, 1000);
    }

    // Open window
    function openWindow(id) {
        const window = document.getElementById(id);
        if (!window) return;

        // Special handling for the about window to add animation
        if (id === 'about') {
            // Set initial state before showing
            window.style.display = 'block';

            // Force a reflow to ensure transition works
            window.offsetHeight;

            // Apply the transition
            window.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
            window.style.opacity = '1';

            // Get the base transform if there was one stored
            const baseTransform = window.getAttribute('data-base-transform') || '';

            // If there was a base transform, we need to incorporate it
            if (baseTransform) {
                // Keep the base transform but remove our animation part
                window.style.transform = baseTransform;
            } else {
                // Just remove our animation transform
                window.style.transform = '';
            }

            // Optional: add a subtle visual indicator that it's a different window
            setTimeout(() => {
                window.classList.add('active-highlight');
                setTimeout(() => {
                    window.classList.remove('active-highlight');
                }, 200);
            }, 400);
        } else {
            // Normal window opening
            window.style.display = 'block';
        }

        bringToFront(id);
    }

    // Bring window to front
    function bringToFront(id) {
        const windows = document.querySelectorAll('.window');
        windows.forEach(window => {
            window.style.zIndex = 10;
            window.classList.remove('active');
        });

        const frontWindow = document.getElementById(id);
        if (frontWindow) {
            frontWindow.style.zIndex = 20;
            frontWindow.classList.add('active');
        }
    }

    // ========== DESKTOP SCROLLING CODE ==========

    let currentSection = 0;
    const desktopScreens = document.querySelectorAll(".desktop-screen");
    const totalScreens = desktopScreens.length;
    let isScrolling = false;
    let scrollTimeout;
    let isScrollLocked = false;

    // Add desktop navigation dots
    function createDesktopNav() {
        if (totalScreens <= 1) return; // Don't create nav if only one screen

        const navContainer = document.createElement('div');
        navContainer.className = 'desktop-nav';

        for (let i = 0; i < totalScreens; i++) {
            const dot = document.createElement('div');
            dot.className = 'desktop-nav-dot' + (i === 0 ? ' active' : '');
            dot.dataset.index = i;
            dot.addEventListener('click', () => {
                scrollToSection(i);
            });
            navContainer.appendChild(dot);
        }

        document.querySelector('.layout').appendChild(navContainer);
    }

    // Function to scroll to a specific desktop screen
    function scrollToSection(index) {
        if (index < 0 || index >= totalScreens || isScrolling) return;

        // Set scrolling state
        isScrolling = true;
        currentSection = index;

        // Close the about window with animation when scrolling to screen2
        if (index === 1) {
            const aboutWindow = document.getElementById('about');
            if (aboutWindow && aboutWindow.style.display === 'block') {
                // Apply fade-out animation
                aboutWindow.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
                aboutWindow.style.opacity = '0';
                aboutWindow.style.transform = 'translateY(-20px)';

                // Hide after animation completes
                setTimeout(() => {
                    aboutWindow.style.display = 'none';
                    // Reset transform for next time it's shown
                    aboutWindow.style.transform = '';
                }, 300);
            }
        }

        // Scroll to the section
        desktopScreens[currentSection].scrollIntoView({ behavior: "smooth" });

        // Update active states
        desktopScreens.forEach((screen, i) => {
            screen.classList.toggle("active-screen", i === currentSection);
        });

        // Update nav dots
        document.querySelectorAll('.desktop-nav-dot').forEach((dot, i) => {
            dot.classList.toggle("active", i === currentSection);
        });

        // Clear any existing timeout
        clearTimeout(scrollTimeout);

        // Reset the scrolling state after animation completes
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
        }, 1000);
    }

    // Initialize desktop navigation and scrolling
    function initDesktopScrolling() {
        if (desktopScreens.length <= 1) return; // No need for scrolling with just one screen

        // Create desktop navigation dots
        createDesktopNav();

        // Wait for page to completely load before enabling scroll lock
        window.addEventListener("load", () => {
            // First make sure we're at the top of the page
            window.scrollTo(0, 0);

            if (isMobile()) {
                // Mobile mode: Disable scroll locking and make all screens visible
                console.log('Mobile mode detected - disabling section scrolling');
                isScrollLocked = false;

                // Make all sections visible for vertical scrolling
                desktopScreens.forEach((screen) => {
                    screen.style.height = 'auto';
                    screen.style.minHeight = 'auto';
                    screen.classList.add('active-screen');
                });

                // Ensure container allows normal scrolling
                const container = document.querySelector('.desktop-container');
                if (container) {
                    container.style.scrollSnapType = 'none';
                    container.style.height = 'auto';
                    container.style.overflowY = 'auto';
                }

                // Hide navigation dots
                const navDots = document.querySelector('.desktop-nav');
                if (navDots) {
                    navDots.style.display = 'none';
                }
            } else {
                // Desktop mode: Mark the first section as active
                desktopScreens.forEach((screen, i) => {
                    screen.classList.toggle("active-screen", i === 0);
                });

                // Enable scroll control
                isScrollLocked = true;

                // Make sure container has snap scrolling
                const container = document.querySelector('.desktop-container');
                if (container) {
                    container.style.scrollSnapType = 'y mandatory';
                    container.style.height = '100vh';
                    container.style.overflowY = 'hidden';
                }

                // Show navigation dots
                const navDots = document.querySelector('.desktop-nav');
                if (navDots) {
                    navDots.style.display = 'flex';
                }
            }
        });

        // Create a throttled wheel event handler for desktop
        let lastWheelTime = 0;

        // Add wheel event listener with { passive: false } to allow preventDefault
        document.addEventListener("wheel", handleWheel, { passive: false });

        function handleWheel(event) {
            // On mobile, allow normal scrolling
            if (isMobile()) {
                return true;
            }

            // Desktop behavior: control section scrolling
            if (isScrollLocked) {
                event.preventDefault();

                // Current time for throttling
                const now = new Date().getTime();

                // Only process wheel events at most once every 100ms and when not already scrolling
                if (now - lastWheelTime > 100 && !isScrolling) {
                    lastWheelTime = now;

                    // Use a threshold to prevent accidental scrolls
                    if (event.deltaY > 30 && currentSection < totalScreens - 1) {
                        // Handle about window if it's open when scrolling to screen2
                        handleAboutWindowOnScroll();

                        // Scroll down
                        scrollToSection(currentSection + 1);
                    } else if (event.deltaY < -30 && currentSection > 0) {
                        // Scroll up
                        scrollToSection(currentSection - 1);
                    }
                }
            }
        }

        // Helper function to handle about window when scrolling
        function handleAboutWindowOnScroll() {
            const aboutWindow = document.getElementById('about');
            if (aboutWindow && aboutWindow.style.display === 'block') {
                // Apply fade-out animation
                aboutWindow.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
                aboutWindow.style.opacity = '0';
                aboutWindow.style.transform = 'translateY(-20px)';

                // Hide after animation completes
                setTimeout(() => {
                    aboutWindow.style.display = 'none';
                    // Reset transform for next time it's shown
                    aboutWindow.style.transform = '';
                }, 300);
            }
        }

        // Reset scroll position on page refresh
        if (history.scrollRestoration) {
            history.scrollRestoration = 'manual';
        }

        // Listen for resize events to handle switching between mobile and desktop
        window.addEventListener('resize', handleResize);

        function handleResize() {
            const mobile = isMobile();

            if (mobile) {
                // Switching to mobile mode
                isScrollLocked = false;

                // Make all sections visible
                desktopScreens.forEach((screen) => {
                    screen.style.height = 'auto';
                    screen.style.minHeight = 'auto';
                    screen.classList.add('active-screen');
                });

                // Ensure container allows normal scrolling
                const container = document.querySelector('.desktop-container');
                if (container) {
                    container.style.scrollSnapType = 'none';
                    container.style.height = 'auto';
                    container.style.overflowY = 'auto';
                }

                // Hide navigation dots
                const navDots = document.querySelector('.desktop-nav');
                if (navDots) {
                    navDots.style.display = 'none';
                }
            } else {
                // Switching to desktop mode
                isScrollLocked = true;

                // Reset section heights 
                desktopScreens.forEach((screen, index) => {
                    screen.style.height = '100vh';
                    screen.style.minHeight = '100vh';
                    screen.classList.toggle("active-screen", index === currentSection);
                });

                // Restore snap scrolling
                const container = document.querySelector('.desktop-container');
                if (container) {
                    container.style.scrollSnapType = 'y mandatory';
                    container.style.height = '100vh';
                    container.style.overflowY = 'hidden';
                }

                // Show navigation dots
                const navDots = document.querySelector('.desktop-nav');
                if (navDots) {
                    navDots.style.display = 'flex';
                }
            }
        }
    }

    // Call initDesktopScrolling function at the appropriate place in your code
    // This should be called right after declaring the scrollToSection function
    initDesktopScrolling();


    // Terminal animation code
    const terminalContainer = document.getElementById('terminal-container');
    if (terminalContainer) {
        const terminalLines = terminalContainer.querySelectorAll('.terminal-response');

        // Function to simulate typing

        // Function to simulate typing
        function simulateTyping() {
            // Get all terminal lines excluding the blink-text line
            const regularLines = Array.from(terminalLines).filter(line => !line.classList.contains('blink-text'));
            const blinkTextLine = terminalContainer.querySelector('.terminal-response.blink-text');
            const socialLinksContainer = terminalContainer.querySelector('.social-links-container');

            // Hide all lines initially
            regularLines.forEach(line => {
                line.style.visibility = 'hidden';
            });

            if (blinkTextLine) {
                blinkTextLine.style.visibility = 'hidden';
                blinkTextLine.style.opacity = '0';
                blinkTextLine.style.transition = 'opacity 0.4s ease-in-out';
            }

            if (socialLinksContainer) {
                socialLinksContainer.style.transition = 'opacity 1s ease-in-out';
            }

            // Create a typing animation for a specific element
            function typeText(element, callback) {
                const originalText = element.textContent.trim();
                element.textContent = '';
                element.style.visibility = 'visible';

                // Create a cursor element
                const cursor = document.createElement('span');
                cursor.className = 'terminal-cursor';
                cursor.textContent = '|';
                element.appendChild(cursor);

                let index = 0;
                const typingSpeed = 50;

                function addCharacter() {
                    if (index < originalText.length) {
                        element.insertBefore(document.createTextNode(originalText.charAt(index)), cursor);
                        index++;
                        setTimeout(addCharacter, typingSpeed);
                    } else {
                        setTimeout(() => {
                            element.removeChild(cursor);
                            if (callback) callback();
                        }, 500);
                    }
                }

                setTimeout(addCharacter, 100);
            }

            // Process lines one after another
            function processLines(lines, currentIndex = 0) {
                if (currentIndex >= lines.length) {
                    // Show the blinking text after all regular lines
                    setTimeout(() => {
                        if (blinkTextLine) {
                            blinkTextLine.style.visibility = 'visible';
                            setTimeout(() => {
                                blinkTextLine.style.opacity = '1';

                                // Show social links after the blinking text
                                setTimeout(() => {
                                    if (socialLinksContainer) {
                                        socialLinksContainer.style.opacity = '1';
                                    }
                                }, 400);
                            }, 50);
                        } else if (socialLinksContainer) {
                            socialLinksContainer.style.opacity = '1';
                        }
                    }, 400);
                    return;
                }

                typeText(lines[currentIndex], () => {
                    setTimeout(() => {
                        processLines(lines, currentIndex + 1);
                    }, 300);
                });
            }

            // Start the animation
            setTimeout(() => {
                if (regularLines.length > 0) {
                    processLines(regularLines);
                } else if (blinkTextLine) {
                    blinkTextLine.style.visibility = 'visible';
                    setTimeout(() => {
                        blinkTextLine.style.opacity = '1';
                        setTimeout(() => {
                            if (socialLinksContainer) {
                                socialLinksContainer.style.opacity = '1';
                            }
                        }, 400);
                    }, 50);
                }
            }, 200);
        }

        // Initialize typing animation when the second screen becomes visible
        let hasAnimated = false;

        // Function to check if device is mobile
        function isMobile() {
            return window.innerWidth <= 768; // Common breakpoint for mobile devices
        }

        // Function to check if terminal is visible and start animation
        function checkTerminalVisibility() {
            if (isMobile()) {
                // On mobile, start animation when terminal is in viewport
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && !hasAnimated) {
                            simulateTyping();
                            hasAnimated = true;
                            // Stop observing after animation starts
                            observer.disconnect();
                        }
                    });
                }, { threshold: 0.3 }); // Trigger when 30% of the terminal is visible

                observer.observe(terminalContainer);
            } else {
                // Original desktop behavior
                const desktopScreen2 = document.querySelector('.desktop-screen-2');
                if (desktopScreen2 && desktopScreen2.classList.contains('active-screen') && !hasAnimated) {
                    simulateTyping();
                    hasAnimated = true;
                }
            }
        }

        // Run on page load and whenever sections change
        checkTerminalVisibility();

        // Check when scrolling between sections
        const navDots = document.querySelectorAll('.desktop-nav-dot');
        if (navDots.length > 0) {
            navDots.forEach(dot => {
                dot.addEventListener('click', () => {
                    // Small delay to ensure the section has changed
                    setTimeout(checkTerminalVisibility, 500);
                });
            });
        }

        // Also check when using mouse wheel to navigate
        document.addEventListener('wheel', () => {
            // Small delay to ensure the section has changed if it did
            setTimeout(checkTerminalVisibility, 500);
        });

        // Call check visibility after a short delay for mobile
        if (isMobile()) {
            setTimeout(checkTerminalVisibility, 1000);
        }
    }

    // Execute any pending actions from redirects
    if (pendingAction) {
        console.log("Executing pending action: " + pendingAction);

        // Small delay to ensure everything is loaded
        setTimeout(() => {
            if (pendingAction === 'game') {
                if (isMobile()) {
                    // Mobile behavior: Show and scroll to the game window
                    const gameWindow = document.getElementById('top-right-container');
                    if (gameWindow) {
                        // Make sure the window is visible
                        gameWindow.style.display = 'block';
                        // Apply glitch effect 
                        applyGlitchEffectToWindow(gameWindow);
                        // Scroll to the game window
                        scrollToElementMobile('top-right-container');
                    }
                } else {
                    // Original desktop behavior
                    const gameWindow = document.getElementById('top-right-container');
                    if (gameWindow) {
                        // Ensure we're on the first screen
                        if (currentSection !== 0) {
                            scrollToSection(0);
                            setTimeout(() => {
                                openWindow('top-right-container');
                                applyGlitchEffectToWindow(gameWindow);
                            }, 200);
                        } else {
                            openWindow('top-right-container');
                            applyGlitchEffectToWindow(gameWindow);
                        }
                        console.log("Applied game window effect");
                    }
                }
            }
            else if (pendingAction === 'team') {
                if (isMobile()) {
                    // Mobile behavior: Show and scroll to the about window
                    const aboutWindow = document.getElementById('about');
                    if (aboutWindow) {
                        // Make sure the window is visible
                        aboutWindow.style.display = 'block';
                        // Scroll to the about window
                        scrollToElementMobile('about');
                    }
                } else {
                    // Original desktop behavior
                    if (currentSection !== 0) {
                        scrollToSection(0);
                        setTimeout(() => {
                            positionAboutWindow();
                            openWindow('about');
                        }, 200);
                    } else {
                        positionAboutWindow();
                        openWindow('about');
                    }
                    console.log("Opened about window");
                }
            }

            // Clear the pending action
            pendingAction = null;
        }, 500);
    }


});

// Existing distortion effect code
document.addEventListener("DOMContentLoaded", () => {
    const gameSection = document.getElementById("game");
    const maxLength = 15;
    const distortionElements = [];
    let cursorTimeout;
    let fadeInterval;

    if (!gameSection) {
        console.warn("Game section with id 'game' not found.");
        return;
    }

    gameSection.style.position = "relative";

    function isInGameSection(x, y) {
        const rect = gameSection.getBoundingClientRect();
        return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    }

    function startFadingTrail() {
        clearInterval(fadeInterval);
        fadeInterval = setInterval(() => {
            if (distortionElements.length > 0) {
                const oldest = distortionElements.shift(); // Remove the oldest element
                oldest.style.opacity = "0";
                setTimeout(() => oldest.remove(), 400);
            } else {
                clearInterval(fadeInterval); // Stop when no elements left
            }
        }, 100); // Smooth step-by-step fade effect
    }

    document.addEventListener("mousemove", (e) => {
        if (isInGameSection(e.clientX, e.clientY)) {
            clearTimeout(cursorTimeout);
            clearInterval(fadeInterval); // Stop fading while moving

            const rect = gameSection.getBoundingClientRect();
            const distortion = document.createElement("div");

            distortion.classList.add("distortion");
            gameSection.appendChild(distortion);
            distortion.style.left = `${e.clientX - rect.left - 10}px`;
            distortion.style.top = `${e.clientY - rect.top - 10}px`;
            distortion.style.opacity = "1";
            distortion.style.transform = "scale(1.5)";

            distortionElements.push(distortion);

            if (distortionElements.length > maxLength) {
                const oldest = distortionElements.shift();
                oldest.style.opacity = "0";
                setTimeout(() => oldest.remove(), 400);
            }

            cursorTimeout = setTimeout(startFadingTrail, 200); // Start gradual fade after stop
        }
    });
});

// Custom buttons code
document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll('.custom-button-3').forEach(button => {
        button.addEventListener('click', function (event) {
            event.preventDefault();

            let targetText = document.querySelector('.glitch-text-2');
            if (!targetText || targetText.dataset.scrambling === "true") return;

            // Array of pre-prepared text options
            const textOptions = [
                "We craft digital chaos with purpose, building playgrounds where rules are just suggestions.",
                "Digital alchemists transforming caffeine and code into experiences you can't forget.",
                "We're indie devs obsessed with creating worlds that feel alive, where every moment and discovery matters.",
                "Building worlds where the NPCs have independent thoughts. Btw, they're asking about you.",
                "Your browser history is our game design document. We know what keeps you up at night.",
                "Achievement unlocked: Persistent Psychological Damage. Rare (0.01% of players)",
                "The backrooms were actually just our old office. We've since relocated deeper into the void.",
                "NPC dialogue written exclusively from Reddit's most downvoted comments. For immersion.",
                "This isn't a game studio, it's a collective fever dream with tax benefits."
            ];

            // Track current text to avoid repetition
            const currentText = targetText.innerText;
            let newText;

            // Filter out the current text, then select randomly from remaining options
            const availableOptions = textOptions.filter(text => text !== currentText);
            newText = availableOptions[Math.floor(Math.random() * availableOptions.length)];

            // Save original dimensions and force them during animation
            const originalWidth = targetText.offsetWidth;
            const originalHeight = targetText.offsetHeight;
            const originalStyles = window.getComputedStyle(targetText);

            // Force dimensions during animation
            targetText.style.width = `${originalWidth}px`;
            targetText.style.height = `${originalHeight}px`;
            targetText.style.display = 'block';
            targetText.style.overflow = 'hidden';

            targetText.dataset.scrambling = "true";
            let originalText = targetText.innerText;
            let chars = "!@#$%^&*()-+[]";

            let scrambleInterval = setInterval(() => {
                targetText.innerText = originalText
                    .split("")
                    .map(letter => (Math.random() > 0.5 ? chars[Math.floor(Math.random() * chars.length)] : letter))
                    .join("");
            }, 50);

            setTimeout(() => {
                clearInterval(scrambleInterval);

                // Instead of restoring original text, set the new randomly selected text
                targetText.innerText = newText;

                // Restore original styles
                targetText.style.width = originalStyles.width;
                targetText.style.height = originalStyles.height;
                targetText.style.display = originalStyles.display;
                targetText.style.overflow = originalStyles.overflow;

                targetText.dataset.scrambling = "false";
            }, 1200);
        });
    });

    const buttonClasses = ['.custom-button', '.custom-button-2', '.custom-button-3', '.custom-button-4', '.custom-button-5', '.custom-button-6'];

    const buttonTexts = [
        "THIS WAY →",
        "TRY ME",
        "DON'T WAIT",
        "WHY NOT?",
        "GO AHEAD",
        "JUST CLICK",
        "SECRET →",
        "DO IT",
        "DANGER!",
        "YES, YOU!",
        "TOUCH ME",
        "ONE WAY",
        "???",
        "CLICK NOW"
    ];

    // Change button text every 3 seconds for all button types
    buttonClasses.forEach(buttonClass => {
        document.querySelectorAll(buttonClass).forEach(button => {
            // Randomized text change interval per button
            const randomInterval = Math.floor(Math.random() * (5000 - 2000) + 2000); // Between 2s - 5s

            setInterval(() => {
                const randomText = buttonTexts[Math.floor(Math.random() * buttonTexts.length)];
                button.innerText = randomText;
            }, randomInterval);
        });
    });


    // Icon click effect
    document.querySelectorAll('.icon').forEach(icon => {
        icon.addEventListener('click', function () {
            this.classList.add('active');
            setTimeout(() => {
                this.classList.remove('active');
            }, 300); // Remove class after animation completes
        });
    });
});

//clicking steam logo button
document.addEventListener('DOMContentLoaded', function () {
    // Steam redirect button functionality
    const steamButton = document.getElementById('steam-redirect-button');
    if (steamButton) {
        steamButton.addEventListener('click', function (e) {
            e.preventDefault();

            // Replace with your actual Steam profile URL
            const steamProfileUrl = 'https://store.steampowered.com/developer/YourStudioName';

            // Add a small visual effect before redirect
            this.classList.add('clicked');

            // Slight delay for the effect to be visible
            setTimeout(() => {
                // Open in a new tab
                window.open(steamProfileUrl, '_blank');
                // Remove the effect class
                this.classList.remove('clicked');
            }, 200);
        });
    }
});

//animated Team icon
// Add this to your main.js file
// Enhanced team icon animation with transition effects
document.addEventListener('DOMContentLoaded', function () {
    // Team icon animation
    const teamIconWrapper = document.querySelector('.icon[data-window="about"]');
    const teamIcon = teamIconWrapper?.querySelector('.icon-img');

    if (teamIcon) {
        // Array of team member images (replace with your actual image paths)
        const teamImages = [
            '/assets/girl-face-pixel-icon.png', // Original image as first frame
            '/assets/demon-pixel-icon.png',
            '/assets/pixel-cat-icon.png',
            '/assets/question-mark-pixel.png',
        ];

        let currentFrame = 0;
        let animationInterval;
        let isAnimating = false;

        // Store original image for resetting
        const originalImage = teamIcon.src;

        // Preload images for smoother animation
        function preloadImages() {
            teamImages.forEach(src => {
                const img = new Image();
                img.src = src;
            });
        }

        // Call preload function
        preloadImages();

        // Function to advance animation frame with transition effect
        function nextFrame() {
            // Add transition class
            teamIcon.classList.add('changing');

            // Short timeout to allow the transition effect to show
            setTimeout(() => {
                // Update image
                currentFrame = (currentFrame + 1) % teamImages.length;
                teamIcon.src = teamImages[currentFrame];

                // Remove transition class after image has loaded
                const newImg = new Image();
                newImg.onload = function () {
                    teamIcon.classList.remove('changing');
                };
                newImg.src = teamImages[currentFrame];
            }, 50);
        }

        // Start animation on hover
        teamIconWrapper.addEventListener('mouseenter', function () {
            // Only start if not already animating
            if (!isAnimating) {
                isAnimating = true;
                currentFrame = 0; // Reset to first frame
                // Change frames every 200ms
                animationInterval = setInterval(nextFrame, 200);
            }
        });

        // Stop animation when mouse leaves
        teamIconWrapper.addEventListener('mouseleave', function () {
            if (isAnimating) {
                clearInterval(animationInterval);
                isAnimating = false;

                // Reset to original image with transition
                teamIcon.classList.add('changing');
                setTimeout(() => {
                    teamIcon.src = originalImage;

                    // Remove transition class after image has loaded
                    const origImg = new Image();
                    origImg.onload = function () {
                        teamIcon.classList.remove('changing');
                    };
                    origImg.src = originalImage;
                }, 50);
            }
        });
    }
});


// Blog window click handlers - Add this to the end of your main.js file
// Make sure to remove the previous blog click handlers if they exist
document.addEventListener('DOMContentLoaded', function () {
    // First Blog Post Window - Latest Post
    const latestPostContainer = document.getElementById('blog-container-1');
    if (latestPostContainer) {
        latestPostContainer.addEventListener('click', function (e) {
            // Prevent clicking on controls from navigating
            if (e.target.closest('.window-controls')) {
                return;
            }

            // Get the latest post slug from a data attribute
            const postSlug = this.getAttribute('data-post-slug');

            // Only navigate if we have a post slug
            if (postSlug && postSlug.trim() !== '') {
                // Apply click effect
                this.style.transform = 'scale(0.98)';

                console.log('Navigating to blog post:', postSlug); // Debugging

                // Navigate to the post page after a brief delay for the animation
                setTimeout(() => {
                    this.style.transform = '';
                    window.location.href = `/blog/${postSlug}/`;
                }, 100);
            } else {
                console.log('No post slug found for blog-container-1'); // Debugging
            }
        });
    } else {
        console.log('blog-container-1 not found'); // Debugging
    }

    // Second Blog Post Window - Second Latest Post
    const secondPostContainer = document.getElementById('blog-container-2');
    if (secondPostContainer) {
        secondPostContainer.addEventListener('click', function (e) {
            // Prevent clicking on controls from navigating
            if (e.target.closest('.window-controls')) {
                return;
            }

            // Get the second latest post slug from a data attribute
            const postSlug = this.getAttribute('data-post-slug');

            // Only navigate if we have a post slug
            if (postSlug && postSlug.trim() !== '') {
                // Apply click effect
                this.style.transform = 'scale(0.98)';

                console.log('Navigating to blog post:', postSlug); // Debugging

                // Navigate to the post page after a brief delay for the animation
                setTimeout(() => {
                    this.style.transform = '';
                    window.location.href = `/blog/${postSlug}/`;
                }, 100);
            } else {
                console.log('No post slug found for blog-container-2'); // Debugging
            }
        });
    } else {
        console.log('blog-container-2 not found'); // Debugging
    }

    // Third Blog Post Window - All Posts Link
    const blogLinkContainer = document.getElementById('blog-container-3');
    if (blogLinkContainer) {
        blogLinkContainer.addEventListener('click', function (e) {
            // Prevent clicking on controls from navigating
            if (e.target.closest('.window-controls')) {
                return;
            }

            console.log('Navigating to blog index'); // Debugging

            // Apply click effect
            this.style.transform = 'scale(0.98)';

            // Navigate to blog page after a brief delay for the animation
            setTimeout(() => {
                this.style.transform = '';
                window.location.href = '/blog/';
            }, 100);
        });
    } else {
        console.log('blog-container-3 not found'); // Debugging
    }
});

// Add this to your JavaScript file
let lastScrollTop = 0;
const header = document.querySelector('.layout_header');

window.addEventListener('scroll', function () {
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll > lastScrollTop && currentScroll > 100) {
        // Scrolling down & past threshold
        header.classList.add('header-hidden');
    } else {
        // Scrolling up
        header.classList.remove('header-hidden');
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
}, false);


// Add this function to your blog.js file
document.addEventListener('DOMContentLoaded', function () {
    // Find the header element
    const header = document.querySelector('.layout_header');

    // Create a helper function to update header visibility
    function updateHeaderVisibility() {
        // Get the current scroll position
        const scrollPosition = window.scrollY || document.documentElement.scrollTop;

        // Get the current section based on scroll position
        // This assumes each section is 100vh
        const currentSection = Math.floor(scrollPosition / window.innerHeight);

        // Optional: Add a class to the header based on which section is active
        // This can be used for section-specific styling
        header.classList.remove('on-section-1', 'on-section-2');
        header.classList.add(`on-section-${currentSection + 1}`);
    }

    // For mobile: Add scroll animation to hide/show header based on scroll direction
    let lastScrollTop = 0;
    const mobileHeaderScroll = function () {
        if (!isMobile()) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Determine if we're scrolling up or down
        if (scrollTop > lastScrollTop && scrollTop > header.offsetHeight) {
            // Scrolling DOWN - hide header
            header.classList.add('header-hidden');
        } else {
            // Scrolling UP - show header
            header.classList.remove('header-hidden');
        }

        lastScrollTop = scrollTop;
    };

    // Add event listeners
    window.addEventListener('scroll', updateHeaderVisibility);
    window.addEventListener('scroll', mobileHeaderScroll, { passive: true });
    window.addEventListener('resize', updateHeaderVisibility);

    // Initial call to set up the header properly
    updateHeaderVisibility();
});


// Simple standalone version of the falling button effect
// Final button sequence
document.addEventListener("DOMContentLoaded", function () {
    // Add necessary styles
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        .falling-animation {
            transform: translateY(100vh) rotate(15deg) !important;
            opacity: 0 !important;
            transition: transform 1.5s ease-in, opacity 1.2s ease-in !important;
            pointer-events: none !important;
        }
        
        .new-dodging-button {
            margin-right: 7px !important;
        }
        
        .custom-button-5 {
            display: inline-block;
            padding: 12px 24px;
            font-size: 16px;
            font-weight: bold;
            text-decoration: none;
            text-transform: uppercase;
            color: white;
            background-color: #ff3333; /* Red color */
            border: none;
            cursor: pointer;
            z-index: 2;
            transition: transform 0.2s ease-out, color 0.2s ease-out;
        }
        
        .custom-button-6 {
            display: inline-block;
            padding: 12px 24px;
            font-size: 16px;
            font-weight: bold;
            text-decoration: none;
            text-transform: uppercase;
            color: white;
            background-color: #3366ff; /* Blue color */
            border: none;
            cursor: pointer;
            z-index: 2;
            transition: transform 0.2s ease-out, color 0.2s ease-out;
        }
        
        /* Match hover state of original buttons */
        .button-container:hover .custom-button-5 {
            transform: translateY(-2px);
            background-color: #ff6666;
        }
        
        .button-container:hover .custom-button-6 {
            transform: translateY(-2px);
            background-color: #6699ff;
        }
        
        /* Ensure proper spacing in button containers */
        .button-spacing {
            margin-right: 7px;
        }
        
        /* Ensure empty container maintains spacing */
        .empty-container {
            display: inline-block;
            margin-right: 7px;
        }
    `;
    document.head.appendChild(styleEl);

    // Fixed global variables to ensure consistent behavior
    let contentContainer = null;
    let scrambleButtonContainer = null;
    let originalButtonPosition = null;
    let initialButtonEffect = true; // Track if we're still in the first cycle

    // Find the original falling button
    const fallingButton = document.querySelector('.custom-button-4');

    if (fallingButton) {
        console.log("Found falling button");

        // Add click handler to initial button
        fallingButton.addEventListener('click', function (e) {
            // Only respond if we're in the initial cycle
            if (!initialButtonEffect) return;

            e.preventDefault();

            // Get important references only on first click
            if (!contentContainer) {
                const buttonContainer = this.closest('.button-container');
                contentContainer = buttonContainer.closest('.content-container');
                scrambleButtonContainer = contentContainer.querySelector('.button-container:has(.custom-button-3)');

                // Store the original position reference
                originalButtonPosition = {
                    parent: contentContainer,
                    nextSibling: buttonContainer.nextElementSibling
                };
            }

            // Create falling animation
            createFallingEffect(this);
        });
    }

    // Function to make any button fall and create a new one
    function createFallingEffect(buttonElement) {
        // Get container and position
        const buttonContainer = buttonElement.closest('.button-container');
        const rect = buttonElement.getBoundingClientRect();

        // Skip if already being processed
        if (buttonElement.dataset.falling === "true") return;
        buttonElement.dataset.falling = "true";

        // Store original position values
        const originalTop = rect.top;
        const originalLeft = rect.left;

        // Clone for falling animation
        const clone = buttonElement.cloneNode(true);
        clone.style.position = 'fixed';
        clone.style.top = originalTop + 'px';
        clone.style.left = originalLeft + 'px';
        clone.style.width = rect.width + 'px';
        clone.style.height = rect.height + 'px';
        clone.style.zIndex = '1000';
        document.body.appendChild(clone);

        // Hide the original
        buttonContainer.style.opacity = '0';

        // Apply falling effect
        setTimeout(() => {
            clone.classList.add('falling-animation');

            // Clean up after animation
            setTimeout(() => {
                if (clone.parentNode) {
                    clone.parentNode.removeChild(clone);
                }
            }, 1500);
        }, 10);

        // Create a new button after a delay
        setTimeout(() => {
            // Remove the original button container
            if (buttonContainer.parentNode) {
                buttonContainer.parentNode.removeChild(buttonContainer);
            }

            // Create replacement button
            createDodgingButton();
        }, 800);
    }

    // Function to create a button that dodges on hover
    function createDodgingButton() {
        // Create button container with proper spacing
        const newButtonContainer = document.createElement('div');
        newButtonContainer.className = 'button-container new-dodging-button';
        newButtonContainer.style.marginRight = '10px';

        // Create shadow element
        const buttonShadow = document.createElement('div');
        buttonShadow.className = 'button-shadow';
        newButtonContainer.appendChild(buttonShadow);

        // Create the actual button with a different class name
        const newButton = document.createElement('a');
        newButton.href = '#';
        newButton.className = 'custom-button-5'; // Different class to avoid conflicts
        newButton.textContent = getRandomButtonText();
        newButtonContainer.appendChild(newButton);

        // Position to the left of the scrambling button
        contentContainer.insertBefore(newButtonContainer, scrambleButtonContainer);

        // Variables to control dodging behavior
        let isMoving = false;
        let dodgingEnabled = false;
        let hasDodged = false;
        let hasCreatedBlueButton = false; // Track if blue button was created

        // Enable dodging after delay
        const dodgingTimeout = setTimeout(() => {
            dodgingEnabled = true;
            console.log("Dodging enabled for new button");
        }, 200);

        // Add one-time mouseover event for dodging
        function dodgeHandler(e) {
            // Only dodge if enabled and not already moving or dodged
            if (!dodgingEnabled || isMoving || hasDodged) return;
            isMoving = true;

            console.log("Dodging triggered - one time only");

            // Apply glitch effect
            newButton.classList.add('glitch-effect');

            // Remove from current position
            newButtonContainer.remove();

            // Insert at original position
            if (originalButtonPosition.nextSibling) {
                originalButtonPosition.parent.insertBefore(newButtonContainer, originalButtonPosition.nextSibling);
            } else {
                originalButtonPosition.parent.appendChild(newButtonContainer);
            }

            // Add smooth transition
            newButtonContainer.style.transition = 'all 0.8s ease-out';

            // Reset after animation completes
            setTimeout(() => {
                // Remove effects
                newButton.classList.remove('glitch-effect');
                newButtonContainer.style.transition = '';

                // Mark as dodged and no longer moving
                hasDodged = true;
                isMoving = false;

                // Remove mouseover listener since we only dodge once
                newButton.removeEventListener('mouseover', dodgeHandler);

                // First click creates blue button, second click makes it fall
                newButton.addEventListener('click', handleRedButtonClick);

                console.log("Dodge complete - click enabled");
            }, 800);
        }

        // Handle clicks on the red button with state tracking
        function handleRedButtonClick(e) {
            e.preventDefault();

            if (!hasCreatedBlueButton) {
                // FIRST CLICK: Create blue button
                createBlueButton();
                hasCreatedBlueButton = true;
                console.log("Blue button created - red button ready for second click");
            } else {
                // SECOND CLICK: Make red button fall
                newButton.removeEventListener('click', handleRedButtonClick);
                makeRedButtonFall();
                console.log("Red button falling after second click");
            }
        }

        // Function to create blue button
        function createBlueButton() {
            const blueButtonContainer = document.createElement('div');
            blueButtonContainer.className = 'button-container button-spacing';
            blueButtonContainer.style.position = 'relative';

            // Create shadow for blue button
            const blueButtonShadow = document.createElement('div');
            blueButtonShadow.className = 'button-shadow';
            blueButtonContainer.appendChild(blueButtonShadow);


            // Create the blue button
            const blueButton = document.createElement('a');
            blueButton.href = '#';
            blueButton.className = 'custom-button-6';
            blueButton.textContent = getRandomButtonText();
            blueButtonContainer.appendChild(blueButton);


            // Insert blue button after red button
            if (newButtonContainer.nextSibling) {
                newButtonContainer.parentNode.insertBefore(blueButtonContainer, newButtonContainer.nextSibling);
            } else {
                newButtonContainer.parentNode.appendChild(blueButtonContainer);
            }
        }

        // Function to make red button fall
        function makeRedButtonFall() {
            // Get dimensions for preserving space
            const redRect = newButton.getBoundingClientRect();

            // Create a clone for falling animation
            const clone = newButton.cloneNode(true);
            clone.style.position = 'fixed';
            clone.style.top = redRect.top + 'px';
            clone.style.left = redRect.left + 'px';
            clone.style.width = redRect.width + 'px';
            clone.style.height = redRect.height + 'px';
            clone.style.zIndex = '1000';
            document.body.appendChild(clone);

            // Remove content from original container but keep it in DOM
            while (newButtonContainer.firstChild) {
                newButtonContainer.removeChild(newButtonContainer.firstChild);
            }

            // Apply falling animation to clone
            setTimeout(() => {
                clone.classList.add('falling-animation');

                // Remove clone after animation
                setTimeout(() => {
                    if (clone.parentNode) {
                        clone.parentNode.removeChild(clone);
                    }
                }, 1500);
            }, 10);
        }

        // Add the one-time dodge handler
        newButton.addEventListener('mouseover', dodgeHandler);

        // Setup random text for initial display
        newButton.textContent = getRandomButtonText();
    }

    // Helper function to generate random button text
    function getRandomButtonText() {
        const texts = [
            "THIS WAY →",
            "TRY ME",
            "DON'T WAIT",
            "WHY NOT?",
            "GO AHEAD",
            "JUST CLICK",
            "SECRET →",
            "DO IT",
            "DANGER!",
            "YES, YOU!",
            "TOUCH ME",
            "ONE WAY",
            "???",
            "CLICK NOW"
        ];
        return texts[Math.floor(Math.random() * texts.length)];
    }
});

// Particle explosion and text transition effects
document.addEventListener("DOMContentLoaded", function () {
    // Add necessary styles for particles, text transitions, and new effects
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        /* Particle styling */
        .particle {
            position: fixed;
            pointer-events: none;
            z-index: 1000;
            border-radius: 20%;
            transform: translate(-50%, -50%);
            will-change: transform;
        }
        
        /* Text transition effects - smoother animation for "YOU ARE CHAOTIC" */
        @keyframes textReveal {
    0% {
        opacity: 0;
        filter: blur(2px);
        transform: translateY(-10px);
        text-shadow: -3px 0 red, 3px 0 #00ff7f;
    }
    20% {
        opacity: 0.4;
        filter: blur(1px);
        transform: translateY(-5px);
        text-shadow: -3px 0 red, 3px 0 #00ff7f;
    }
    40% {
        opacity: 0.6;
        filter: blur(1px);
        transform: translateY(-3px);
        text-shadow: -3px 0 red, 3px 0 #00ff7f;
    }
    60% {
        opacity: 0.8;
        filter: blur(0.5px);
        transform: translateY(-2px);
        text-shadow: -3px 0 red, 3px 0 #00ff7f;
    }
    80% {
        opacity: 0.9;
        filter: blur(0.2px);
        transform: translateY(-1px);
        text-shadow: -3px 0 red, 3px 0 #00ff7f;
    }
    100% {
        opacity: 1;
        filter: blur(0);
        transform: translateY(0);
        text-shadow: -3px 0 red, 3px 0 #00ff7f;
    }
}

.text-glitch-effect {
    font-family: "GlitchGoblin", sans-serif;
    color: white;
    text-transform: uppercase;
    animation: textReveal 1.2s ease-out forwards, subtleGlow 3s ease-in-out infinite alternate;
    display: inline-block;
}

        
        /* CRT-like scan during transition - header only with slower movement */
        @keyframes scanline {
            0% {
                top: 0;
            }
            100% {
                top: 42px; /* Height of window-header */
            }
        }
        
        .scanline-effect {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 5px;
            background: linear-gradient(to right,
                rgba(255, 255, 255, 0.1),
                rgba(255, 255, 255, 0.8) 20%,
                rgba(255, 255, 255, 0.9) 50%,
                rgba(255, 255, 255, 0.8) 80%,
                rgba(255, 255, 255, 0.1)
            );
            z-index: 55; /* Above window content */
            animation: scanline 1s ease-out forwards;
            pointer-events: none;
            box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
        }
        
        /* Window shake effect for finale - reduced amplitude */
        @keyframes windowFinaleShake {
            0% { transform: translate(0); }
            10% { transform: translate(-3px, 2px); }
            20% { transform: translate(4px, -2px); }
            30% { transform: translate(-3px, 1px); }
            40% { transform: translate(2px, -1px); }
            50% { transform: translate(-2px, 2px); }
            60% { transform: translate(3px, -2px); }
            70% { transform: translate(-2px, 1px); }
            80% { transform: translate(2px, 0); }
            90% { transform: translate(-1px, 1px); }
            100% { transform: translate(0); }
        }
        
        .window-finale-shake {
            animation: windowFinaleShake 0.8s ease-out;
        }
        
        /* Electric flicker text effect */

        /* Electric flicker text effect */
@keyframes electricFlicker {
    0%, 100% { opacity: 0.9; text-shadow: 0 0 5px rgba(255, 0, 0, 0.6), 0 0 10px rgba(128, 0, 255, 0.5); }
    5% { opacity: 1; text-shadow: 0 0 20px rgba(255, 0, 0, 0.9), 0 0 30px rgba(128, 0, 255, 0.7), 0 0 40px rgba(255, 0, 128, 0.5); }
    10% { opacity: 0.8; text-shadow: 0 0 5px rgba(255, 0, 0, 0.6), 0 0 10px rgba(128, 0, 255, 0.5); }
    15% { opacity: 1; text-shadow: 0 0 15px rgba(255, 0, 0, 0.8), 0 0 25px rgba(0, 0, 0, 0.7), 0 0 35px rgba(128, 0, 255, 0.6); }
    20% { opacity: 0.9; text-shadow: 0 0 5px rgba(255, 0, 0, 0.6), 0 0 10px rgba(128, 0, 255, 0.5); }
    25% { opacity: 1; text-shadow: 0 0 25px rgba(255, 0, 0, 1), 0 0 35px rgba(0, 0, 0, 0.8), 0 0 45px rgba(128, 0, 255, 0.7); }
    30% { opacity: 0.8; text-shadow: 0 0 5px rgba(255, 0, 0, 0.6), 0 0 10px rgba(128, 0, 255, 0.5); }
    40% { opacity: 1; text-shadow: 0 0 15px rgba(0, 255, 255, 0.7), 0 0 25px rgba(255, 0, 0, 0.8), 0 0 35px rgba(0, 0, 0, 0.9); }
    50% { opacity: 0.9; text-shadow: 0 0 5px rgba(255, 0, 0, 0.6), 0 0 10px rgba(128, 0, 255, 0.5); }
    60% { opacity: 1; text-shadow: 0 0 20px rgba(255, 0, 0, 0.9), 0 0 30px rgba(0, 0, 0, 0.9), 0 0 40px rgba(255, 0, 255, 0.7); }
    70% { opacity: 0.8; text-shadow: 0 0 5px rgba(255, 0, 0, 0.6), 0 0 10px rgba(128, 0, 255, 0.5); }
    80% { opacity: 1; text-shadow: 0 0 25px rgba(255, 0, 0, 1), 0 0 35px rgba(0, 0, 0, 0.9), 0 0 45px rgba(128, 0, 255, 0.7); }
    90% { opacity: 0.9; text-shadow: 0 0 5px rgba(255, 0, 0, 0.6), 0 0 10px rgba(128, 0, 255, 0.5); }
}

@keyframes ambientGlow {
    0%, 100% { opacity: 0; }
    25% { opacity: 0.3; }
    50% { opacity: 0.1; }
    75% { opacity: 0.4; }
}

.flicker-text {
    color: white;
    font-weight: bold;
    display: inline-block;
    position: relative;
    animation: electricFlicker 3s steps(1, end) infinite;
}

.flicker-text::after {
    content: "";
    position: absolute;
    top: -20%;
    left: -20%;
    right: -20%;
    bottom: -20%;
    background: radial-gradient(ellipse at center, rgba(255, 0, 0, 0), rgba(255, 0, 0, 0.2), rgba(128, 0, 255, 0));
    z-index: -1;
    pointer-events: none;
    animation: ambientGlow 3s linear infinite;
}
        
        /* Matrix falling symbols effect - improved version */
        /* Matrix falling symbols effect - improved version */
/* Matrix falling symbols effect - improved version */
.matrix-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
    z-index: 1;
    opacity: 0.3; /* Increased opacity for better visibility */
}

.matrix-symbol {
    position: absolute;
    color: #00ffcc;
    font-family: monospace;
    font-size: 14px;
    font-weight: bold;
    text-shadow: 0 0 5px #00ffcc, 0 0 7px rgba(255, 0, 0, 0.3);
    user-select: none;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    animation-name: matrixFall;
    animation-timing-function: linear;
    animation-iteration-count: 1;
    top: 0;
}

/* Variation in symbols */
.matrix-symbol.bright {
    color: #00ffff;
    text-shadow: 0 0 8px #00ffff, 0 0 12px #ff3333, 0 0 15px rgba(255, 255, 255, 0.4);
    font-size: 16px;
    opacity: 0.95 !important; /* Make head of stream brighter */
}

.matrix-symbol.dim {
    color: #008888;
    text-shadow: 0 0 3px #008888, 0 0 5px rgba(255, 0, 0, 0.2);
    font-size: 12px;
}

@keyframes matrixFall {
    0% {
        opacity: 0;
        transform: translateY(-100px);
    }
    10% {
        opacity: 0.7;
    }
    80% {
        opacity: 0.7;
    }
    100% {
        opacity: 0;
        transform: translateY(calc(100vh + 50px));
    }
}
    `;
    document.head.appendChild(styleEl);

    // Get references to important elements
    const mainContainer = document.getElementById("main-container");
    const mainTitle = mainContainer ? mainContainer.querySelector('.window-title') : null;
    const contentContainer = mainContainer ? mainContainer.querySelector('.content-container') : null;
    const glitchText = contentContainer ? contentContainer.querySelector('.glitch') : null;
    const windowContent = mainContainer ? mainContainer.querySelector('.window-content') : null;

    // Function to create Matrix-style falling symbols

    // Function to create Matrix-style falling symbols in more distinct streams
    // Function to create Matrix-style falling symbols in more distinct streams
    function createMatrixEffect(container) {
        if (!container) return;

        // Create matrix container
        const matrixContainer = document.createElement('div');
        matrixContainer.className = 'matrix-container';
        container.appendChild(matrixContainer);

        // Matrix symbols - mix of characters for a code-like appearance
        const symbols = [
            'Ⱒ', '☾', '🜎', 'ᛃ', 'ᚱ', 'タ', '🜋', '☥', '🜘', 'Ⰱ', '☩', 'Ⰾ',
            'ア', 'Ⱊ', 'Ⱍ', '🜏', 'Ⰰ', 'ᚠ', '♑', '𐤀', '♄', '𓂀', '☽', '☽',
            '⚸', '🜃', '🜂', '🜁', '∞', '⛧', '⛤', '⛧', '⛧', '𓃶', '☿', 'π', '≈'
        ];

        // Define fixed columns for the streams - more precision
        const columnWidth = 100; // Increased spacing between columns
        const columns = Math.floor(container.offsetWidth / columnWidth);
        const activeColumns = {};

        // Initialize some streams immediately
        const initialStreams = Math.floor(columns * 0.3); // Reduced to 30% of columns active
        const usedPositions = new Set();

        for (let i = 0; i < initialStreams; i++) {
            let columnIndex;
            do {
                columnIndex = Math.floor(Math.random() * columns);
            } while (usedPositions.has(columnIndex));

            usedPositions.add(columnIndex);
            startStream(columnIndex);
        }

        // Continuously add new streams at random intervals
        setInterval(() => {
            if (container.offsetParent !== null) {
                // Find inactive columns to start new streams
                const inactiveColumns = [];
                for (let i = 0; i < columns; i++) {
                    if (!activeColumns[i]) {
                        inactiveColumns.push(i);
                    }
                }

                // Start 1-2 new streams if we have inactive columns
                if (inactiveColumns.length > 0) {
                    const newStreams = Math.min(inactiveColumns.length, 1 + Math.floor(Math.random() * 2));
                    for (let i = 0; i < newStreams; i++) {
                        const randomIndex = Math.floor(Math.random() * inactiveColumns.length);
                        const columnIndex = inactiveColumns[randomIndex];
                        inactiveColumns.splice(randomIndex, 1);
                        startStream(columnIndex);
                    }
                }
            }
        }, 1200); // Increased delay between new streams

        // Function to start a new stream in a column
        function startStream(columnIndex) {
            if (activeColumns[columnIndex]) return;

            activeColumns[columnIndex] = true;
            const xPosition = columnIndex * columnWidth + (columnWidth / 2); // Center in column

            // Generate a random length for the stream (7-12 symbols) - more consistent lengths
            const streamLength = 7 + Math.floor(Math.random() * 6);

            // Random speed variation for the entire stream
            const speedFactor = 0.8 + (Math.random() * 0.4); // 0.8x to 1.2x speed

            // Create the actual stream
            createStreamOfSymbols(xPosition, streamLength, speedFactor, 0, columnIndex);
        }

        // Recursively create a stream of symbols
        function createStreamOfSymbols(x, length, speedFactor, index, columnIndex) {
            if (index >= length || !container.offsetParent) {
                // Stream is complete, mark column as available after a cooldown
                setTimeout(() => {
                    activeColumns[columnIndex] = false;
                }, 2000 + Math.random() * 3000); // 2-5 second cooldown
                return;
            }

            // Create a symbol
            const symbolElem = document.createElement('div');
            const isHead = (index === 0);

            // First symbol is brighter (the "head" of the stream)
            if (isHead) {
                symbolElem.className = 'matrix-symbol bright';
            } else if (Math.random() < 0.2) {
                symbolElem.className = 'matrix-symbol dim';
            } else {
                symbolElem.className = 'matrix-symbol';
            }

            // Position precisely in column with minimal random offset
            const xOffset = -2 + Math.random() * 4; // Reduced variation (-2px to +2px)
            symbolElem.style.left = `${x + xOffset}px`;

            // Set symbol content and animation properties
            symbolElem.innerText = symbols[Math.floor(Math.random() * symbols.length)];

            // Speed decreases slightly for each symbol in the stream
            const baseDuration = 5 + Math.random() * 2; // 5-7 seconds
            const duration = baseDuration * speedFactor * (1 + (index * 0.1));
            symbolElem.style.animationDuration = `${duration}s`;

            // Delay increases for each symbol in the stream to create trailing effect
            const delay = index * (0.15 + Math.random() * 0.1); // 0.15-0.25s between symbols
            symbolElem.style.animationDelay = `${delay}s`;

            // Add to container
            matrixContainer.appendChild(symbolElem);

            // Symbol changing during fall (increased frequency for all symbols)
            if (!isHead) {
                // Set up multiple changes during fall for greater dynamism
                const changeCount = 1 + Math.floor(Math.random() * 3); // 1-3 changes during fall
                for (let i = 0; i < changeCount; i++) {
                    const changeTime = ((0.2 + (i * 0.25)) * duration) * 1000; // Changes at 20%, 45%, 70% of the way down
                    setTimeout(() => {
                        if (symbolElem.parentNode === matrixContainer) {
                            symbolElem.innerText = symbols[Math.floor(Math.random() * symbols.length)];
                        }
                    }, changeTime);
                }
            } else {
                // Even the head symbols change occasionally (but less frequently)
                if (Math.random() < 0.4) {
                    setTimeout(() => {
                        if (symbolElem.parentNode === matrixContainer) {
                            symbolElem.innerText = symbols[Math.floor(Math.random() * symbols.length)];
                        }
                    }, (duration * 0.6) * 1000);
                }
            }

            // Remove after animation completes
            setTimeout(() => {
                if (symbolElem.parentNode === matrixContainer) {
                    matrixContainer.removeChild(symbolElem);
                }
            }, (duration + delay) * 1000);

            // Create next symbol in the stream with a consistent delay
            setTimeout(() => {
                createStreamOfSymbols(x, length, speedFactor, index + 1, columnIndex);
            }, 150); // More consistent timing between symbols in the same stream
        }
    }

    // Function to apply rainbow highlight effect to the first paragraph
    function applyRainbowEffect(contentContainer) {
        if (!contentContainer) return;

        // Find the first paragraph
        const firstParagraph = contentContainer.querySelector('p');
        if (firstParagraph) {
            // Save original text
            const originalText = firstParagraph.textContent;

            // Create glowing rainbow text
            firstParagraph.innerHTML = `<span class="flicker-text">${originalText}</span>`;

            // Add subtle reveal effect
            const rainbowSpan = firstParagraph.querySelector('.flicker-text');
            if (rainbowSpan) {
                // Brief flash of brightness before animation starts
                rainbowSpan.style.filter = 'brightness(1.5)';
                setTimeout(() => {
                    rainbowSpan.style.filter = 'brightness(1)';
                }, 50);
            }
        }
    }

    // Function to create an individual particle
    function createParticle(x, y, color) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // Random size between 3-12px for more pixelated look
        const size = Math.random() * 9 + 3;

        // More pixelated appearance - square particles
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.backgroundColor = color;
        particle.style.boxShadow = `0 0 ${size / 3}px ${color}`;
        particle.style.borderRadius = `${Math.random() > 0.7 ? '0' : '20%'}`; // Mix of square and slightly rounded

        // Position at the source of explosion
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;

        // Random initial velocity - slightly reduced for more controlled effect
        const velocity = {
            x: (Math.random() - 0.5) * 10,
            y: (Math.random() - 0.5) * 10
        };

        // Random rotation
        const rotation = Math.random() * 360;
        particle.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;

        // Add to DOM
        document.body.appendChild(particle);

        // Start animation
        let opacity = 1;
        let posX = x;
        let posY = y;
        let lifespan = 0;
        const maxLifespan = Math.random() * 800 + 400; // 0.4-1.2 seconds - slightly faster

        function updateParticle() {
            lifespan += 16.67; // Approx 60fps

            // Apply "gravity" effect
            velocity.y += 0.1;

            // Update position
            posX += velocity.x;
            posY += velocity.y;

            // Fade out
            opacity = 1 - (lifespan / maxLifespan);

            // Update styles
            particle.style.left = `${posX}px`;
            particle.style.top = `${posY}px`;
            particle.style.opacity = opacity.toString();

            // Continue animation or remove
            if (lifespan < maxLifespan) {
                requestAnimationFrame(updateParticle);
            } else {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }
        }

        requestAnimationFrame(updateParticle);
        return particle;
    }

    // Particle explosion effect
    function createParticleExplosion(x, y) {
        // Define more chaotic color palette - glitchy, digital, less rainbow-like
        const colors = [
            '#00ffcc', // Teal (matches matrix symbols)
            '#00ffff', // Cyan (matches bright matrix heads)
            '#ff3333', // Red (matches text glitch effect)
            '#00ff7f', // Green (matches text glitch effect)
            '#ff00ff', // Magenta (accent color)
            '#ffffff'  // White (for contrast/highlights)
        ];

        // Create particles
        const particleCount = 120; // Slightly more particles for density
        for (let i = 0; i < particleCount; i++) {
            // Weighted color selection - favor certain colors for more chaotic feel
            let colorIndex;
            const rand = Math.random();
            if (rand < 0.3) {
                // 30% chance for digital greens
                colorIndex = [2, 3, 9, 11][Math.floor(Math.random() * 4)];
            } else if (rand < 0.5) {
                // 20% chance for reds
                colorIndex = [0, 1][Math.floor(Math.random() * 2)];
            } else {
                // 50% chance for any color
                colorIndex = Math.floor(Math.random() * colors.length);
            }
            createParticle(x, y, colors[colorIndex]);
        }
    }

    // Function to handle blue button click finale
    function handleBlueButtonFinale(event) {
        // Remove click event to prevent multiple triggers
        this.removeEventListener('click', handleBlueButtonFinale);

        // Get button position for particle source
        const rect = this.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        // Create particle explosion
        createParticleExplosion(x, y);

        // Make button disappear with a flash
        this.style.transition = 'all 0.2s ease-out';
        this.style.transform = 'scale(1.5)';
        this.style.opacity = '0';
        this.style.filter = 'brightness(2)';

        // Enhanced sequence timeline with additional effects
        const timeline = {
            explosionStart: 0,
            blueButtonRemove: 300,
            windowShakeStart: 300,
            scanlineStart: 400,
            headerTextChange: 900,
            windowShakeEnd: 1100,
            chaosTextChange: 1200,
            matrixEffectStart: 1400,
            rainbowTextEffect: 1800
        };

        // Remove blue button from DOM after explosion
        setTimeout(() => {
            if (this.parentNode) {
                this.parentNode.parentNode.removeChild(this.parentNode);
            }
        }, timeline.blueButtonRemove);

        // Start the enhanced sequence effects
        setTimeout(() => {
            if (mainContainer) {
                // Start window shake effect
                mainContainer.classList.add('window-finale-shake');

                // Add scanline effect
                setTimeout(() => {
                    const scanline = document.createElement('div');
                    scanline.className = 'scanline-effect';
                    // Add specifically to the window header
                    const windowHeader = mainContainer.querySelector('.window-header');
                    if (windowHeader) {
                        windowHeader.style.overflow = 'hidden'; // Ensure scanline stays within header
                        windowHeader.appendChild(scanline);
                    } else {
                        mainContainer.appendChild(scanline);
                    }

                    // Remove scanline after animation
                    setTimeout(() => {
                        if (scanline.parentNode) {
                            scanline.parentNode.removeChild(scanline);
                        }
                    }, 1000);
                }, timeline.scanlineStart - timeline.windowShakeStart);

                // Change window title
                setTimeout(() => {
                    if (mainTitle) {
                        mainTitle.innerHTML = mainTitle.innerHTML.replace('Initiation',
                            '<span class="title-transition">Welcome, Awakened</span>');
                    }
                }, timeline.headerTextChange - timeline.windowShakeStart);

                // End window shake effect
                setTimeout(() => {
                    mainContainer.classList.remove('window-finale-shake');
                    if (contentContainer) {
                        contentContainer.classList.remove('container-glitch');
                    }
                }, timeline.windowShakeEnd - timeline.windowShakeStart);

                // Change glitch text 
                setTimeout(() => {
                    if (glitchText) {
                        glitchText.innerHTML = '<span class="glitch glitch-text text-glitch-effect">YOU ARE<br>CHAOTIC</span>';

                        // Make sure the glitch class is maintained
                        if (!glitchText.classList.contains('glitch')) {
                            glitchText.classList.add('glitch');
                        }
                    }
                }, timeline.chaosTextChange - timeline.windowShakeStart);

                // Start matrix falling symbols effect
                setTimeout(() => {
                    if (windowContent) {
                        windowContent.style.position = 'relative'; // Ensure proper positioning
                        createMatrixEffect(windowContent);
                    }
                }, timeline.matrixEffectStart - timeline.windowShakeStart);

                // Add rainbow highlight to first paragraph
                setTimeout(() => {
                    applyRainbowEffect(contentContainer);
                }, timeline.rainbowTextEffect - timeline.windowShakeStart);

                // Knight is chaotic now
                setTimeout(() => {
                    window.blueButtonFinaleCompleted = true;
                    console.log("Blue button finale completed - knight will now use chaotic image");

                    // Update any visible knight immediately
                    const knightImage = document.querySelector('.rising-knight');
                    if (knightImage) {
                        knightImage.src = '/assets/rome-chaotic-no-background.png';
                        // Add a special glitch effect to visualize the change
                        knightImage.classList.add('knight-glitch');
                        setTimeout(() => {
                            knightImage.classList.remove('knight-glitch');
                        }, 600);
                    }
                }, 2000); // Adjust timing as needed


            }
        }, timeline.windowShakeStart);
    }

    // Monitor for new blue buttons being added to the DOM
    function observeForBlueButton() {
        // Create a mutation observer to watch for newly added blue buttons
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                // Check for added nodes
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        // Check if this is a blue button or contains one
                        if (node.nodeType === 1) { // Element node
                            // Direct match
                            if (node.classList && node.classList.contains('custom-button-6')) {
                                node.addEventListener('click', handleBlueButtonFinale);
                            }

                            // Check children
                            const blueButton = node.querySelector('.custom-button-6');
                            if (blueButton) {
                                blueButton.addEventListener('click', handleBlueButtonFinale);
                            }
                        }
                    });
                }
            });
        });

        // Start observing the document with the configured parameters
        observer.observe(document.body, { childList: true, subtree: true });

        // Also check for any existing blue buttons that might already be in the DOM
        const existingBlueButtons = document.querySelectorAll('.custom-button-6');
        existingBlueButtons.forEach(button => {
            button.addEventListener('click', handleBlueButtonFinale);
        });
    }

    // Start watching for blue buttons
    observeForBlueButton();
});

// Knight rising effect for start button
document.addEventListener('DOMContentLoaded', function () {
    // Make sure we're not conflicting with existing DOMContentLoaded handlers
    setupStartButtonEffect();

    // Set up enhanced blue button finale that communicates with the knight effect
    setupEnhancedBlueButtonFinale();
});

function setupStartButtonEffect() {
    console.log("Setting up Start button knight effect");

    // Find the start button
    const startButton = document.querySelector('.start-button');

    if (!startButton) {
        console.log("Start button not found");
        return;
    }

    // Check if knight container already exists (prevent duplicates)
    let knightContainer = document.querySelector('.knight-container');

    if (!knightContainer) {
        // Create the knight container
        knightContainer = document.createElement('div');
        knightContainer.className = 'knight-container';
        knightContainer.innerHTML = `
            <img src="/assets/rome-fallen-no-background.png" alt="Knight" class="rising-knight" />
            <div class="knight-text-bubble">
                <span class="typing-text"></span>
                <span class="text-cursor">|</span>
            </div>
        `;

        // Append to body
        document.body.appendChild(knightContainer);
        console.log("Knight container appended to body");

        // Add styles dynamically
        addKnightStyles();
    }

    // Variables to track button press and animation state
    let isButtonPressed = false;
    let isRising = false;
    let isFallingDown = false;
    let pressTimer = null;
    let revealTimer = null;
    let hideTimer = null;
    let riseStepTimer = null;
    let knightVisible = false;
    let textFullyTyped = false;
    let typingAnimation = null;
    let currentRiseStage = 0; // 0 = hidden, 1 = peek, 2 = partial, 3 = full

    // Function to update the knight image based on finale state
    function updateKnightImage() {
        const knightImage = document.querySelector('.rising-knight');
        if (knightImage) {
            // Check if finale has completed and update the image source
            if (window.blueButtonFinaleCompleted) {
                knightImage.src = '/assets/rome-chaotic-no-background.png';
                console.log("Knight changed to chaotic version");
            } else {
                knightImage.src = '/assets/rome-fallen-no-background.png';
            }
        }
    }

    // The text to be typed changes based on finale state
    function getKnightText() {
        return window.blueButtonFinaleCompleted ?
            "I am chaos incarnate!" :
            "Rome has fallen, centurion.";
    }

    // Function to type text character by character
    function typeText(text, element, startIndex = 0) {
        const typingSpeed = 80; // milliseconds per character

        if (startIndex < text.length) {
            element.textContent = text.substring(0, startIndex + 1);
            typingAnimation = setTimeout(() => {
                typeText(text, element, startIndex + 1);
            }, typingSpeed);
        } else {
            textFullyTyped = true;
            // Add glitch effect to knight after text finishes
            const knight = document.querySelector('.rising-knight');
            if (knight) {
                knight.classList.add('knight-glitch');
                setTimeout(() => {
                    knight.classList.remove('knight-glitch');
                }, 600);
            }
        }
    }

    // Position the knight near the Start button
    function positionKnightContainer() {
        const startButtonRect = startButton.getBoundingClientRect();
        const knightContainer = document.querySelector('.knight-container');

        if (knightContainer) {
            // Position the knight to the left of the start button
            knightContainer.style.left = (startButtonRect.left + startButtonRect.width / 2) + 'px';

            // Store initial position for reference
            knightContainer.dataset.initialLeft = knightContainer.style.left;
        }
    }

    // Function to initiate a controlled rise of the knight
    function startRisingKnight() {
        if (isRising) {
            // If already rising, abort current rise and restart
            cancelRising();
        }

        if (isFallingDown) {
            // If currently falling, abort and start rising immediately
            cancelFallingDown();
        }

        isRising = true;
        currentRiseStage = 0;

        // Update the knight image based on finale state
        updateKnightImage();

        // Position the knight container relative to the start button
        positionKnightContainer();

        const knightContainer = document.querySelector('.knight-container');

        // Immediately show the first peek (30% visible)
        knightContainer.style.bottom = '0%';
        knightVisible = true;
        currentRiseStage = 1;

        // Schedule next rise stage - even if button is released, we'll show this minimum amount
        riseStepTimer = setTimeout(() => {
            if (isRising) {
                if (isButtonPressed) {
                    // Button still held, move to stage 2 (60% visible)
                    knightContainer.style.bottom = '0%';
                    currentRiseStage = 2;

                    // Schedule final rise stage
                    riseStepTimer = setTimeout(() => {
                        if (isRising && isButtonPressed) {
                            // Button still held, move to full visibility
                            knightContainer.style.bottom = '0px';
                            currentRiseStage = 3;

                            // Show text bubble
                            revealTimer = setTimeout(() => {
                                const textBubble = document.querySelector('.knight-text-bubble');
                                const typingTextElement = document.querySelector('.typing-text');

                                if (textBubble && typingTextElement) {
                                    textBubble.style.opacity = '1';

                                    // Start typing effect with the appropriate text
                                    textFullyTyped = false;
                                    clearTimeout(typingAnimation);
                                    typingTextElement.textContent = '';
                                    typeText(getKnightText(), typingTextElement);
                                }
                            }, 200);
                        } else {
                            // Button was released during the rise, start falling
                            startFallingDown();
                        }
                    }, 400);
                } else {
                    // Button was released, but we've shown the minimum, now start falling
                    startFallingDown();
                }
            }
        }, 100); // Show minimum rise even for very fast clicks
    }

    // Function to cancel rising animation
    function cancelRising() {
        isRising = false;
        clearTimeout(riseStepTimer);
        clearTimeout(revealTimer);
    }

    // Function to start knight falling animation
    function startFallingDown() {
        cancelRising();

        if (isFallingDown) {
            return; // Already falling
        }

        isFallingDown = true;

        // Hide text bubble immediately
        const textBubble = document.querySelector('.knight-text-bubble');
        if (textBubble) {
            textBubble.style.opacity = '0';
        }

        // Stop typing animation
        clearTimeout(typingAnimation);

        const knightContainer = document.querySelector('.knight-container');

        // Add a minimum display time based on how far the knight has risen
        let delayBeforeFalling = 200; // Minimum display time

        hideTimer = setTimeout(() => {
            if (isFallingDown) {
                knightContainer.style.bottom = '-100%';
                knightVisible = false;
                textFullyTyped = false;
                currentRiseStage = 0;

                // Reset state after animation completes
                setTimeout(() => {
                    isFallingDown = false;
                }, 300); // Match your CSS transition time
            }
        }, delayBeforeFalling);
    }

    // Function to cancel falling animation
    function cancelFallingDown() {
        isFallingDown = false;
        clearTimeout(hideTimer);
    }

    // Handle mouse events
    function handleMouseDown() {
        console.log("Start button pressed");
        isButtonPressed = true;

        // Start rising animation - this will handle any current animations gracefully
        startRisingKnight();
    }

    function handleButtonRelease() {
        console.log("Start button released");
        isButtonPressed = false;

        // If knight is in the process of rising, let it continue to the minimum level
        // startFallingDown will be called after minimum rise is shown
        if (currentRiseStage >= 2) {
            // Already risen past minimum, start falling now
            startFallingDown();
        }
        // Otherwise, the rise function will handle the falling after minimum rise
    }

    // Handle touch events for mobile support
    function handleTouchStart(e) {
        e.preventDefault();
        handleMouseDown();
    }

    function handleTouchEnd(e) {
        e.preventDefault();
        handleButtonRelease();
    }

    // Try to remove existing event listeners
    try {
        startButton.removeEventListener('mousedown', handleMouseDown);
        startButton.removeEventListener('mouseup', handleButtonRelease);
        startButton.removeEventListener('mouseleave', handleButtonRelease);
        startButton.removeEventListener('touchstart', handleTouchStart);
        startButton.removeEventListener('touchend', handleTouchEnd);
        startButton.removeEventListener('touchcancel', handleTouchEnd);
    } catch (e) {
        console.log("No previous listeners to remove");
    }

    // Add event listeners
    startButton.addEventListener('mousedown', handleMouseDown);
    startButton.addEventListener('mouseup', handleButtonRelease);
    startButton.addEventListener('mouseleave', handleButtonRelease);

    // Add touch events for mobile support
    startButton.addEventListener('touchstart', handleTouchStart, { passive: false });
    startButton.addEventListener('touchend', handleTouchEnd, { passive: false });
    startButton.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    console.log("Event listeners added to Start button");

    // Initial positioning when page loads
    positionKnightContainer();

    // Also reposition when window is resized
    window.addEventListener('resize', positionKnightContainer);
}

function setupEnhancedBlueButtonFinale() {
    // Monitor for new blue buttons being added to the DOM
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            // Check for added nodes
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    // Check if this is a blue button or contains one
                    if (node.nodeType === 1) { // Element node
                        // Direct match
                        if (node.classList && node.classList.contains('custom-button-6')) {
                            node.addEventListener('click', handleEnhancedBlueButtonFinale);
                        }

                        // Check children
                        const blueButton = node.querySelector('.custom-button-6');
                        if (blueButton) {
                            blueButton.addEventListener('click', handleEnhancedBlueButtonFinale);
                        }
                    }
                });
            }
        });
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });

    // Also check for any existing blue buttons that might already be in the DOM
    const existingBlueButtons = document.querySelectorAll('.custom-button-6');
    existingBlueButtons.forEach(button => {
        button.addEventListener('click', handleEnhancedBlueButtonFinale);
    });

    console.log("Enhanced blue button finale setup complete");
}

// Enhanced blue button finale that updates the global state and affects the knight
function handleEnhancedBlueButtonFinale(event) {
    // Remove click event to prevent multiple triggers
    this.removeEventListener('click', handleEnhancedBlueButtonFinale);

    // Get button position for particle source
    const rect = this.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Create particle explosion
    createParticleExplosion(x, y);

    // Make button disappear with a flash
    this.style.transition = 'all 0.2s ease-out';
    this.style.transform = 'scale(1.5)';
    this.style.opacity = '0';
    this.style.filter = 'brightness(2)';

    // Enhanced sequence timeline with additional effects
    const timeline = {
        explosionStart: 0,
        blueButtonRemove: 300,
        windowShakeStart: 300,
        scanlineStart: 400,
        headerTextChange: 900,
        windowShakeEnd: 1100,
        chaosTextChange: 1200,
        matrixEffectStart: 1400,
        rainbowTextEffect: 1800,
        knightUpdateTime: 2000 // Time to update the knight state
    };

    // Remove blue button from DOM after explosion
    setTimeout(() => {
        if (this.parentNode) {
            this.parentNode.parentNode.removeChild(this.parentNode);
        }
    }, timeline.blueButtonRemove);

    // Get references to important elements
    const mainContainer = document.getElementById("main-container");
    const mainTitle = mainContainer ? mainContainer.querySelector('.window-title') : null;
    const contentContainer = mainContainer ? mainContainer.querySelector('.content-container') : null;
    const glitchText = contentContainer ? contentContainer.querySelector('.glitch') : null;
    const windowContent = mainContainer ? mainContainer.querySelector('.window-content') : null;

    // Start the enhanced sequence effects
    setTimeout(() => {
        if (mainContainer) {
            // Start window shake effect
            mainContainer.classList.add('window-finale-shake');

            // Add scanline effect
            setTimeout(() => {
                const scanline = document.createElement('div');
                scanline.className = 'scanline-effect';
                // Add specifically to the window header
                const windowHeader = mainContainer.querySelector('.window-header');
                if (windowHeader) {
                    windowHeader.style.overflow = 'hidden'; // Ensure scanline stays within header
                    windowHeader.appendChild(scanline);
                } else {
                    mainContainer.appendChild(scanline);
                }

                // Remove scanline after animation
                setTimeout(() => {
                    if (scanline.parentNode) {
                        scanline.parentNode.removeChild(scanline);
                    }
                }, 1000);
            }, timeline.scanlineStart - timeline.windowShakeStart);

            // Change window title
            setTimeout(() => {
                if (mainTitle) {
                    mainTitle.innerHTML = mainTitle.innerHTML.replace('Initiation',
                        '<span class="title-transition">Welcome, Awakened</span>');
                }
            }, timeline.headerTextChange - timeline.windowShakeStart);

            // End window shake effect
            setTimeout(() => {
                mainContainer.classList.remove('window-finale-shake');
                if (contentContainer) {
                    contentContainer.classList.remove('container-glitch');
                }
            }, timeline.windowShakeEnd - timeline.windowShakeStart);

            // Change glitch text 
            setTimeout(() => {
                if (glitchText) {
                    glitchText.innerHTML = '<span class="glitch glitch-text text-glitch-effect">YOU ARE<br>CHAOTIC</span>';

                    // Make sure the glitch class is maintained
                    if (!glitchText.classList.contains('glitch')) {
                        glitchText.classList.add('glitch');
                    }
                }
            }, timeline.chaosTextChange - timeline.windowShakeStart);

            // Start matrix falling symbols effect
            setTimeout(() => {
                if (windowContent) {
                    windowContent.style.position = 'relative'; // Ensure proper positioning
                    if (typeof createMatrixEffect === 'function') {
                        createMatrixEffect(windowContent);
                    }
                }
            }, timeline.matrixEffectStart - timeline.windowShakeStart);

            // Add rainbow highlight to first paragraph
            setTimeout(() => {
                if (typeof applyRainbowEffect === 'function') {
                    applyRainbowEffect(contentContainer);
                }
            }, timeline.rainbowTextEffect - timeline.windowShakeStart);

            // Set the global state to indicate the finale has completed
            setTimeout(() => {
                window.blueButtonFinaleCompleted = true;
                console.log("Blue button finale completed - knight will now use chaotic image");

                // Update any visible knight immediately
                const knightImage = document.querySelector('.rising-knight');
                if (knightImage) {
                    knightImage.src = '/assets/rome-chaotic-no-background.png';
                    // Add a special glitch effect to visualize the change
                    knightImage.classList.add('knight-glitch');
                    setTimeout(() => {
                        knightImage.classList.remove('knight-glitch');
                    }, 600);
                }
            }, timeline.knightUpdateTime - timeline.windowShakeStart);
        }
    }, timeline.windowShakeStart);
}

// Keep your original addKnightStyles function unchanged
function addKnightStyles() {
    // Check if styles already exist
    if (document.getElementById('knight-styles')) return;

    // Add styles via JavaScript to avoid modifying CSS file
    const styleElement = document.createElement('style');
    styleElement.id = 'knight-styles';
    styleElement.textContent = `
        .knight-container {
            position: fixed;
            bottom: -50%;
            left: 30px; /* Starting left position, will be adjusted by JS */
            transform: translateX(-50%);
            width: 150px; /* Increased size */
            height: 250px; /* Increased size */
            pointer-events: none;
            z-index: 1;
            transition: bottom 0.4s ease-out; /* Faster animation */
        }
        
        .rising-knight {
            width: 100%;
            height: auto;
            image-rendering: pixelated;
            filter: drop-shadow(2px 2px 0 rgba(0,0,0,0.6));
        }
        
        .knight-text-bubble {
            position: absolute;
            top: 60px; /* Positioned at mouth level */
            left: 100%;
            background-color: #000;
            border: 2px solid #fff;
            padding: 8px 12px;
            border-radius: 5px;
            color: #fff;
            font-family: 'Web437_IBM_VGA_8x16', monospace;
            white-space: nowrap;
            opacity: 0;
            transition: opacity 0.3s ease;
            font-size: 14px;
            z-index: 1002;
        }
        
        .knight-text-bubble::before {
           content: '';
            position: absolute;
            left: -10px;
            top: 10px;
            border-width: 5px;
            border-style: solid;
            border-color: transparent #fff transparent transparent;
        }
        
        .text-cursor {
            display: inline-block;
            animation: blink 0.7s infinite;
        }
        
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
        }
        
        /* Glitch effect for the image */
        .knight-glitch {
            animation: knightGlitch 0.2s steps(3) 3;
        }
        
        @keyframes knightGlitch {
            0% { transform: translate(0, 0) scale(1); filter: brightness(1); }
            20% { transform: translate(-5px, 2px) scale(1.03); filter: brightness(1.2); }
            40% { transform: translate(3px, -2px) scale(0.97); filter: brightness(0.8); }
            60% { transform: translate(-2px, 1px) scale(1.01); filter: brightness(1.1); }
            80% { transform: translate(1px, -1px) scale(0.99); filter: brightness(0.9); }
            100% { transform: translate(0, 0) scale(1); filter: brightness(1); }
        }
        
        /* Special chaotic knight fade transition */
        .knight-transform {
            animation: knightTransform 0.5s ease-out;
        }
        
        @keyframes knightTransform {
            0% { opacity: 1; filter: brightness(1) hue-rotate(0deg); }
            50% { opacity: 0.7; filter: brightness(1.5) hue-rotate(180deg); }
            100% { opacity: 1; filter: brightness(1) hue-rotate(0deg); }
        }
    `;
    document.head.appendChild(styleElement);
    console.log("Knight styles added");
}

// Standalone window controls function - can be added to any JavaScript file
document.addEventListener('DOMContentLoaded', function () {
    // Make sure we're not adding duplicate event listeners
    setupAdaptiveWindowControls();
});

function setupAdaptiveWindowControls() {
    // First, remove any existing event listeners from window controls
    document.querySelectorAll('.window-control').forEach(control => {
        const newControl = control.cloneNode(true);
        control.parentNode.replaceChild(newControl, control);
    });

    // Now add our new improved event listeners
    document.querySelectorAll('.window-control').forEach(control => {
        control.addEventListener('click', function () {
            const window = this.closest('.window');
            if (!window) return;

            console.log("Window control clicked:", this.className);

            // Get the window dimensions for more adaptive animations
            const windowRect = window.getBoundingClientRect();
            const windowSize = Math.max(windowRect.width, windowRect.height);

            // Calculate scale factors based on window size
            // This makes the effect more proportional to window size
            const minimizeScale = 1 - (5 / windowSize);  // Smaller windows get subtler effects
            const maximizeScale = 1 + (5 / windowSize);  // Larger windows get subtler effects

            // Store the original transform to restore it later
            const originalTransform = window.style.transform || '';

            if (this.classList.contains('minimize')) {
                console.log("Minimize effect applied with scale:", minimizeScale);

                // Add a smooth transition
                window.style.transition = 'transform 150ms ease-out';
                // Apply minimize effect
                window.style.transform = `scale(${minimizeScale})`;

                // Restore original state with a slight delay
                setTimeout(() => {
                    window.style.transition = 'transform 100ms ease-in';
                    window.style.transform = originalTransform;

                    // Clean up transition property after animation completes
                    setTimeout(() => {
                        window.style.transition = '';
                    }, 100);
                }, 150);
            }
            else if (this.classList.contains('maximize')) {
                console.log("Maximize effect applied with scale:", maximizeScale);

                // Add a smooth transition
                window.style.transition = 'transform 150ms ease-out';
                // Apply maximize effect
                window.style.transform = `scale(${maximizeScale})`;

                // Restore original state with a slight delay
                setTimeout(() => {
                    window.style.transition = 'transform 100ms ease-in';
                    window.style.transform = originalTransform;

                    // Clean up transition property after animation completes
                    setTimeout(() => {
                        window.style.transition = '';
                    }, 100);
                }, 150);
            }
        });
    });

    console.log("Adaptive window controls setup complete");
}