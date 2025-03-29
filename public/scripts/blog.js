// Add this to the top of your blog.js file, before any other code
window.onbeforeunload = function () {
  // Reset the scroll position when leaving the page
  window.scrollTo(0, 0);
};

document.addEventListener('DOMContentLoaded', function () {
  // Function to check if device is mobile
  function isMobile() {
    return window.innerWidth <= 768; // Common breakpoint for mobile devices
  }

  // Initialize the blog page setup
  function initBlogPage() {
    // Add click functionality to icons
    setupIconNavigation();

    // Handle window controls (minimize/maximize)
    setupWindowControls();

    // Initialize pagination if we're on the blog index page
    initPagination();

    // Generate table of contents for blog post
    generateTableOfContents();

    // Set up image zoom functionality
    setupImageZoom();

    // Apply syntax highlighting to code blocks
    highlightCodeBlocks();

    // Set up mobile layout if needed
    if (isMobile()) {
      setupMobileMode();
    }
  }

  // Setup icon navigation

  // Modify your setupIconNavigation function like this
  function setupIconNavigation() {
    // SPECIFIC selector for layout header icons only
    document.querySelectorAll('.layout_header .icon').forEach(icon => {
      icon.addEventListener('click', function (event) {
        // Only process direct clicks on this element
        if (event.target.closest('.icon') !== this) return;

        const windowId = this.getAttribute('data-window');

        // Add active effect to icon (animation)
        this.classList.add('active');
        setTimeout(() => {
          this.classList.remove('active');
        }, 300);

        // Handle icon click based on the window id
        if (windowId === 'main-container' || windowId === 'home') {
          // Navigate to home page
          window.location.href = '/';
        }
        else if (windowId === 'blog') {
          // Navigate to blog page
          window.location.href = '/blog/';
        }
        else if (windowId === 'game') {
          // Navigate to home page with game parameter
          sessionStorage.setItem('triggerAction', 'game');
          window.location.href = '/';
        }
        else if (windowId === 'team' || windowId === 'about') {
          // Stop any ongoing animation
          const teamIcon = this.querySelector('.icon-img');
          if (teamIcon && teamIcon.classList.contains('changing')) {
            teamIcon.classList.remove('changing');
          }

          // Navigate to home page with team parameter
          sessionStorage.setItem('triggerAction', 'team');
          window.location.href = '/';
        }
        else {
          // For other icons, you can implement navigation later
          console.log(`Clicked on ${windowId} icon`);
        }
      });
    });
  }

  // Setup window control animations
  function setupWindowControls() {
    document.querySelectorAll('.window-control').forEach(control => {
      control.addEventListener('click', function () {
        const window = this.closest('.window');
        if (!window) return;

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
  }

  // Initialize pagination functionality
  function initPagination() {
    const paginationButtons = document.querySelectorAll('.page-item');
    if (paginationButtons.length === 0) return; // Not on a page with pagination

    paginationButtons.forEach(button => {
      button.addEventListener('click', () => {
        const page = Number(button.getAttribute('data-page'));
        if (!page) return; // No page data attribute

        // Update active state
        document.querySelectorAll('.page-item').forEach(btn => btn.classList.remove('current'));
        button.classList.add('current');

        // If this is client-side pagination (not navigation to new URL)
        const postsContainer = document.getElementById('posts-container');
        if (postsContainer) {
          // Let the allPosts and postsPerPage data handle rendering
          // The actual rendering happens in the Astro file's script section

          // Scroll to top of posts container
          postsContainer.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // Alternative approach using scroll sequence
  function generateTableOfContents() {
    const tocList = document.getElementById('toc-list');
    if (!tocList) return;

    const headings = document.querySelectorAll('.post-content h2, .post-content h3');

    if (headings.length > 0) {
      tocList.innerHTML = '';

      headings.forEach((heading, index) => {
        if (!heading.id) {
          heading.id = `heading-${index}`;
        }

        const tocItem = document.createElement('a');
        tocItem.href = 'javascript:void(0);'; // Avoid hash navigation
        tocItem.classList.add('toc-item');

        if (heading.tagName === 'H3') {
          tocItem.classList.add('toc-subitem');
        }

        tocItem.textContent = heading.textContent;
        tocList.appendChild(tocItem);


        tocItem.addEventListener('click', function () {
          const scrollTarget = heading;

          // Try to find the best container to scroll
          const scrollOptions = { behavior: 'smooth', block: 'start' };


          setTimeout(() => {
            console.log("Scroll attempt 1");
            scrollTarget.scrollIntoView(scrollOptions);
          }, 0);

        });
      });
    } else {
      tocList.innerHTML = '<div class="toc-empty">No sections found</div>';
    }
  }

  // Simple function to add a "retro" style to code blocks
  function highlightCodeBlocks() {
    const codeBlocks = document.querySelectorAll('.post-content pre code');

    codeBlocks.forEach(block => {
      // Add a class for styling
      block.classList.add('retro-code');

      // Split code into lines for line numbers
      const lines = block.textContent.split('\n');
      let numberedCode = '';

      lines.forEach((line, index) => {
        // Skip the last empty line if present
        if (index === lines.length - 1 && line.trim() === '') return;

        const lineNumber = index + 1;
        numberedCode += `<span class="line-number">${lineNumber}</span>${line}\n`;
      });

      // Replace code with numbered version
      block.innerHTML = numberedCode;

      // Wrap in a container to add scrollbar
      const preElement = block.parentNode;
      preElement.classList.add('retro-code-container');

      // Add language indicator if any class contains language-*
      Array.from(block.classList).forEach(className => {
        if (className.startsWith('language-')) {
          const language = className.replace('language-', '');
          const langIndicator = document.createElement('div');
          langIndicator.className = 'code-language';
          langIndicator.textContent = language;
          preElement.parentNode.insertBefore(langIndicator, preElement);
        }
      });
    });
  }

  // Mobile-specific setup
  function setupMobileMode() {
    // Mobile layout adjustments
    document.body.classList.add('mobile-mode');

    // Adjust window heights for better viewing on mobile
    const contentWindows = document.querySelectorAll('.window-content');
    contentWindows.forEach(contentWindow => {
      // Override fixed heights on mobile
      contentWindow.style.maxHeight = 'none';
      contentWindow.style.height = 'auto';
    });

    // Hide desktop navigation dots if they exist
    const navDots = document.querySelector('.desktop-nav');
    if (navDots) {
      navDots.style.display = 'none';
    }
  }

  // Add image zoom functionality
  function setupImageZoom() {
    const contentImages = document.querySelectorAll('.post-content img');

    contentImages.forEach(img => {
      // Make images clickable for zoom
      img.style.cursor = 'zoom-in';

      img.addEventListener('click', function () {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'image-zoom-overlay';

        // Create zoomed image container
        const zoomedImg = document.createElement('img');
        zoomedImg.src = this.src;
        zoomedImg.className = 'zoomed-image';

        // Create close button
        const closeBtn = document.createElement('div');
        closeBtn.className = 'zoom-close-btn';
        closeBtn.innerHTML = '×';

        // Add to DOM
        overlay.appendChild(zoomedImg);
        overlay.appendChild(closeBtn);
        document.body.appendChild(overlay);

        // Prevent scrolling on body
        document.body.style.overflow = 'hidden';

        // Setup close functionality
        function closeZoom() {
          document.body.removeChild(overlay);
          document.body.style.overflow = '';
        }

        // Close on overlay click
        overlay.addEventListener('click', closeZoom);

        // Stop propagation on image click to prevent closing
        zoomedImg.addEventListener('click', function (e) {
          e.stopPropagation();
        });

        // Add keyboard support
        document.addEventListener('keydown', function closeOnEsc(e) {
          if (e.key === 'Escape') {
            closeZoom();
            document.removeEventListener('keydown', closeOnEsc);
          }
        });

        // Close on button click
        closeBtn.addEventListener('click', closeZoom);
      });
    });
  }

  // Run initialization
  initBlogPage();
});

// Add this function to your blog.js file
function setupMobileHeaderScroll() {
  // Only run on mobile devices
  if (window.innerWidth > 768) return;

  const header = document.querySelector('.layout_header');
  if (!header) return;

  let lastScrollTop = 0;
  let scrollThreshold = 20; // Minimum scroll amount before hiding/showing

  // Listen for scroll events
  window.addEventListener('scroll', function () {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Determine scroll direction and distance
    if (Math.abs(scrollTop - lastScrollTop) < scrollThreshold) return;

    // Hide header when scrolling down and past the header height
    if (scrollTop > lastScrollTop && scrollTop > header.offsetHeight) {
      header.classList.add('header-hidden');
    }
    // Show header when scrolling up
    else if (scrollTop < lastScrollTop) {
      header.classList.remove('header-hidden');
    }

    lastScrollTop = scrollTop;
  }, { passive: true }); // passive for better performance

  // Also show header when at the top of the page
  window.addEventListener('scroll', function () {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop <= 10) { // Near the top
      header.classList.remove('header-hidden');
    }
  }, { passive: true });
}

// Call this function after DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  // Add this to your existing initBlogPage function or call it separately
  setupMobileHeaderScroll();
});

// Add this function to your blog.js file
function setupStickyRightSidebar() {
  // Only run on desktop
  if (window.innerWidth <= 768) return;

  // First, check if we're on a blog post page
  // We'll use the presence of #blog-post-body as an indicator
  const blogPostBody = document.getElementById('blog-post-body');
  if (!blogPostBody) {
    console.log("Not on a blog post page - sticky sidebar disabled");
    return; // Exit if not on a post page
  }

  const contentGrid = document.querySelector('.content-grid');
  const rightSidebar = document.querySelector('.layout_cell.right-sidebar');
  if (!contentGrid || !rightSidebar) {
    console.log("Required layout elements not found");
    return;
  }

  console.log("Setting up trending articles sticky sidebar");

  // Create the sticky sidebar element
  const stickySidebar = document.createElement('div');
  stickySidebar.className = 'layout_cell right-sidebar-sticky';

  // Create the window element for the sticky sidebar
  const trendingWindow = document.createElement('div');
  trendingWindow.className = 'window fixed-window';
  trendingWindow.innerHTML = `
      <div class="window-header">
        <div class="window-title">
          <img src="/assets/pixel-art.png" class="window-title-icon" alt="Trending" />
          Trending Posts
        </div>
        <div class="window-controls">
          <div class="window-control minimize"></div>
          <div class="window-control maximize"></div>
        </div>
      </div>
      <div class="window-content">
        <div id="trending-content" class="trending-container">
          <!-- Content will be populated here -->
          <p class="loading-text">Loading trending articles...</p>
        </div>
      </div>
    `;

  // Add window to sticky sidebar
  stickySidebar.appendChild(trendingWindow);

  // Add sticky sidebar to content grid after the regular sidebar
  contentGrid.insertBefore(stickySidebar, rightSidebar.nextSibling);

  // Add minimize functionality
  const minimize = trendingWindow.querySelector('.window-control.minimize');
  if (minimize) {
    minimize.addEventListener('click', () => {
      stickySidebar.classList.remove('active');
      // Remember user choice for this session
      sessionStorage.setItem('stickyNavClosed', 'true');
    });
  }

  // Populate with trending articles (with a slight delay to ensure DOM is ready)
  setTimeout(() => {
    populateTrendingArticles(trendingWindow);
  }, 100);

  // Scroll tracking
  let lastScrollTop = 0;
  const showThreshold = 50; // Show when scrolled 50% down
  const hideThreshold = 30; // Hide when scrolled back to 30% up
  let ticking = false;

  // Use requestAnimationFrame for smoother scroll handling
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateStickyNavVisibility();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Function to update sticky nav visibility
  function updateStickyNavVisibility() {
    // Calculate scroll position as percentage
    const scrollPosition = window.scrollY;
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    ) - window.innerHeight;

    const scrollPercentage = (scrollPosition / documentHeight) * 100;

    // Check if user previously closed the window
    const wasClosed = sessionStorage.getItem('stickyNavClosed') === 'true';

    // Determine scroll direction
    const scrollingDown = scrollPosition > lastScrollTop;
    const isSidebarActive = stickySidebar.classList.contains('active');

    // Show sidebar when scrolling down past threshold
    if (scrollPercentage >= showThreshold && !wasClosed && scrollingDown && !isSidebarActive) {
      stickySidebar.classList.add('active');
    }
    // Hide sidebar when scrolling back up past threshold
    else if (scrollPercentage <= hideThreshold && isSidebarActive) {
      stickySidebar.classList.remove('active');
      // Reset the closed state when back at top
      sessionStorage.removeItem('stickyNavClosed');
    }

    lastScrollTop = scrollPosition;
  }

  // Function to populate trending articles
  // Function to populate trending articles
  function populateTrendingArticles(windowElement) {
    const trendingContent = windowElement.querySelector('#trending-content');
    if (!trendingContent) return;

    // Get current post path to exclude it
    const currentPath = window.location.pathname;

    // Look for trending articles data injected by Astro
    const trendingDataElement = document.getElementById('trending-posts-data');

    if (trendingDataElement) {
      try {
        // Get the content from the script tag - try both properties
        const rawContent = trendingDataElement.textContent || trendingDataElement.innerHTML;
        console.log("Raw trending data:", rawContent); // Debug output

        // Clean up the content before parsing - remove HTML entities if present
        const cleanedContent = rawContent
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'")
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&');

        // Try parsing the cleaned content
        const trendingPosts = JSON.parse(cleanedContent);

        console.log("Parsed trending posts:", trendingPosts); // Debug output

        if (trendingPosts && Array.isArray(trendingPosts) && trendingPosts.length > 0) {
          // We have trending posts from Astro - display them
          displayTrendingPosts(trendingPosts, trendingContent, currentPath);
          return;
        } else {
          console.log("Trending data is not an array or is empty");
        }
      } catch (error) {
        console.error("Error parsing trending posts data:", error);
        console.log("Content that failed parsing:", trendingDataElement.textContent || trendingDataElement.innerHTML);
      }
    } else {
      console.log("No trending posts data element found");
    }

    // Fallback message if no trending posts found
    trendingContent.innerHTML = `
      <div class="trending-message">
        <p>No trending articles found.</p>
        <p>Add <code>trending: true</code> to post frontmatter to mark posts as trending.</p>
      </div>
      <ul class="trending-list">
        <li class="trending-item">
          <a href="/blog/" class="trending-link">
            <div class="trending-title">Browse All Blog Posts</div>
          </a>
        </li>
      </ul>
    `;
  }

  // Helper function to display trending posts
  // Helper function to display trending posts
  function displayTrendingPosts(posts, container, currentPath) {
    // Filter out current post and limit to 3 posts
    const filteredPosts = posts
      .filter(post => !post.url.includes(currentPath))
      .slice(0, 3);

    if (filteredPosts.length === 0) {
      container.innerHTML = `
        <div class="trending-message">
          <p>No other trending articles found.</p>
        </div>
        <ul class="trending-list">
          <li class="trending-item">
            <a href="/blog/" class="trending-link">
              <div class="trending-title">Browse All Blog Posts</div>
            </a>
          </li>
        </ul>
      `;
      return;
    }

    // Create trending posts list
    container.innerHTML = '<ul class="trending-list"></ul>';
    const list = container.querySelector('.trending-list');

    // Add each post to the list with numbers
    filteredPosts.forEach((post, index) => {
      const li = document.createElement('li');
      li.className = 'trending-item';

      // Create the item content with a number indicator
      li.innerHTML = `
        <a href="${post.url}" class="trending-link">
          <span class="trending-number">${index + 1}</span>
          <div class="trending-title">${post.title}</div>
        </a>
      `;

      list.appendChild(li);
    });
  }

  // Check initial scroll position
  updateStickyNavVisibility();
}

// Make sure to call this function on page load
document.addEventListener('DOMContentLoaded', function () {
  setupStickyRightSidebar();
});


// Fixed JavaScript for Share Button functionality

document.addEventListener('DOMContentLoaded', function () {
  // Set up post footer interactions
  setupPostFooter();
});

function setupPostFooter() {
  // Handle like button
  const likeButton = document.getElementById('likeButton');
  const likeCounter = document.getElementById('likeCounter');

  if (likeButton && likeCounter) {
    // Get post ID from URL
    const postId = getPostIdFromUrl();

    // Check if already liked in localStorage
    const isLiked = localStorage.getItem(`liked_${postId}`) === 'true';
    const likeCount = parseInt(localStorage.getItem(`likeCount_${postId}`)) || 0;

    // Update initial state
    if (isLiked) {
      likeButton.classList.add('active');
    }
    likeCounter.textContent = likeCount;

    // Add click event
    likeButton.addEventListener('click', function () {
      // Toggle like state
      const newIsLiked = !likeButton.classList.contains('active');
      likeButton.classList.toggle('active');

      // Update count
      let count = parseInt(likeCounter.textContent);
      count = newIsLiked ? count + 1 : Math.max(0, count - 1);
      likeCounter.textContent = count;

      // Store state in localStorage
      localStorage.setItem(`liked_${postId}`, newIsLiked);
      localStorage.setItem(`likeCount_${postId}`, count);
    });
  }

  // Handle share button - copy to clipboard functionality
  // Enhanced share button functionality - modified for device-specific behavior
  const shareButton = document.getElementById('shareButton');
  const copiedNotification = document.getElementById('copiedNotification');

  if (shareButton) {
    shareButton.addEventListener('click', function () {
      const postUrl = window.location.href;
      const postTitle = document.title;

      // Check if it's a mobile device (using screen width)
      const isMobileDevice = window.innerWidth <= 768;

      // Only use Web Share API on mobile devices that support it
      if (isMobileDevice && navigator.share) {
        navigator.share({
          title: postTitle,
          url: postUrl
        })
          .then(() => {
            console.log('Successfully shared using native share');
          })
          .catch((error) => {
            console.log('Error sharing:', error);
            // Fall back to clipboard copying if sharing fails
            useCopyToClipboard(postTitle, postUrl);
          });
      } else {
        // For desktop, always use clipboard method
        useCopyToClipboard(postTitle, postUrl);
      }
    });
  }

  // Helper function for clipboard copying
  function useCopyToClipboard(title, url) {
    const textToCopy = `Check this out: ${title}\n${url}`;

    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        // Show notification
        if (copiedNotification) {
          console.log("Text copied, showing notification");
          copiedNotification.classList.add('show');

          // Add active state to button temporarily
          shareButton.classList.add('active');

          // Hide notification and remove active state after 2 seconds
          setTimeout(() => {
            copiedNotification.classList.remove('show');
            shareButton.classList.remove('active');
          }, 2000);
        }
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
        // Try fallback method for copying
        tryFallbackCopy(textToCopy);
      });
  }
}

// Fallback copy method for browsers that don't support clipboard API
function tryFallbackCopy(text) {
  // Create temporary textarea
  const textArea = document.createElement("textarea");
  textArea.value = text;

  // Make the textarea out of viewport
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);

  // Select and copy
  textArea.focus();
  textArea.select();

  let success = false;
  try {
    success = document.execCommand('copy');
  } catch (err) {
    console.error('Fallback copy failed:', err);
  }

  // Remove the textarea
  document.body.removeChild(textArea);

  // Show notification if successful
  if (success) {
    const notification = document.getElementById('copiedNotification');
    if (notification) {
      notification.classList.add('show');
      setTimeout(() => {
        notification.classList.remove('show');
      }, 2000);
    }
  }

  return success;
}

// Helper to get post ID/slug from URL
function getPostIdFromUrl() {
  const pathSegments = window.location.pathname.split('/');
  // Assuming URL structure like /blog/post-slug/
  const slug = pathSegments[pathSegments.length - 2] || pathSegments[pathSegments.length - 1];
  return slug;
}



//animated Team icon
// Replace your current animation code with this combined version
document.addEventListener('DOMContentLoaded', function () {
  // Team icon animation - modified to work with navigation
  const teamIconWrapper = document.querySelector('.icon[data-window="about"]');
  const teamIcon = teamIconWrapper?.querySelector('.icon-img');

  if (teamIcon) {
    // Array of team member images
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