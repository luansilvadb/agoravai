/**
 * Animation Utilities
 * Easing functions, duration constants, and animation helpers
 * for the Premium POS UI
 * 
 * @see design.md for animation specifications
 */

/**
 * Animation duration constants in milliseconds
 * @readonly
 */
export const Duration = {
  /** Instant feedback - 150ms */
  INSTANT: 150,
  /** Normal transitions - 300ms */
  NORMAL: 300,
  /** Slow transitions - 400ms */
  SLOW: 400,
  /** Slower transitions - 500ms */
  SLOWER: 500,
};

/**
 * CSS easing functions
 * @readonly
 */
export const Easing = {
  /** Default ease - cubic-bezier(0.4, 0, 0.2, 1) */
  DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  /** Ease in - cubic-bezier(0.4, 0, 1, 1) */
  IN: 'cubic-bezier(0.4, 0, 1, 1)',
  /** Ease out - cubic-bezier(0, 0, 0.2, 1) */
  OUT: 'cubic-bezier(0, 0, 0.2, 1)',
  /** Bounce effect - cubic-bezier(0.34, 1.56, 0.64, 1) */
  BOUNCE: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  /** Spring effect - cubic-bezier(0.175, 0.885, 0.32, 1.275) */
  SPRING: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
};

/**
 * CSS transition shorthand generator
 * @param {string} properties - CSS properties to transition
 * @param {number} duration - Duration in ms
 * @param {string} easing - Easing function
 * @returns {string} CSS transition value
 */
export function transition(properties, duration = Duration.NORMAL, easing = Easing.DEFAULT) {
  return `${properties} ${duration}ms ${easing}`;
}

/**
 * Animate an element using CSS transitions
 * @param {HTMLElement} element - Element to animate
 * @param {Object} from - Initial styles
 * @param {Object} to - Final styles
 * @param {number} duration - Animation duration in ms
 * @param {string} easing - Easing function
 * @returns {Promise<void>} Resolves when animation completes
 */
export function animateElement(element, from, to, duration = Duration.NORMAL, easing = Easing.DEFAULT) {
  return new Promise((resolve) => {
    // Apply initial styles
    Object.assign(element.style, from);
    
    // Force reflow
    element.offsetHeight;
    
    // Apply transition and final styles
    element.style.transition = `all ${duration}ms ${easing}`;
    Object.assign(element.style, to);
    
    // Cleanup and resolve after animation
    const cleanup = () => {
      element.style.transition = '';
      element.removeEventListener('transitionend', cleanup);
      resolve();
    };
    
    element.addEventListener('transitionend', cleanup);
    
    // Fallback timeout in case transitionend doesn't fire
    setTimeout(cleanup, duration + 50);
  });
}

/**
 * Apply a "pop" animation to an element (scale up then back)
 * @param {HTMLElement} element - Element to animate
 * @param {number} scale - Maximum scale (default 1.05)
 * @param {number} duration - Animation duration in ms
 */
export async function popAnimation(element, scale = 1.05, duration = Duration.INSTANT) {
  await animateElement(
    element,
    { transform: 'scale(1)' },
    { transform: `scale(${scale})` },
    duration / 2,
    Easing.BOUNCE
  );
  await animateElement(
    element,
    { transform: `scale(${scale})` },
    { transform: 'scale(1)' },
    duration / 2,
    Easing.BOUNCE
  );
}

/**
 * Apply a shake animation to an element
 * @param {HTMLElement} element - Element to animate
 * @param {number} intensity - Shake intensity in degrees (default 2)
 * @param {number} duration - Animation duration in ms
 */
export function shakeAnimation(element, intensity = 2, duration = Duration.NORMAL) {
  const keyframes = [
    { transform: 'rotate(0deg)' },
    { transform: `rotate(-${intensity}deg)` },
    { transform: `rotate(${intensity}deg)` },
    { transform: `rotate(-${intensity}deg)` },
    { transform: `rotate(${intensity}deg)` },
    { transform: 'rotate(0deg)' },
  ];
  
  return element.animate(keyframes, {
    duration,
    easing: Easing.DEFAULT,
  }).finished;
}

/**
 * Slide in animation from a direction
 * @param {HTMLElement} element - Element to animate
 * @param {string} direction - Direction to slide from (top, bottom, left, right)
 * @param {number} distance - Distance to slide in pixels
 * @param {number} duration - Animation duration in ms
 */
export async function slideIn(element, direction = 'top', distance = 20, duration = Duration.SLOW) {
  const transforms = {
    top: `translateY(-${distance}px)`,
    bottom: `translateY(${distance}px)`,
    left: `translateX(-${distance}px)`,
    right: `translateX(${distance}px)`,
  };
  
  await animateElement(
    element,
    { 
      opacity: '0',
      transform: transforms[direction]
    },
    { 
      opacity: '1',
      transform: 'translate(0, 0)'
    },
    duration,
    Easing.OUT
  );
}

/**
 * Fade out and slide animation for removal
 * @param {HTMLElement} element - Element to animate
 * @param {string} direction - Direction to slide (top, bottom, left, right)
 * @param {number} duration - Animation duration in ms
 */
export async function fadeOutSlide(element, direction = 'left', duration = Duration.NORMAL) {
  const transforms = {
    top: 'translateY(-20px)',
    bottom: 'translateY(20px)',
    left: 'translateX(-20px)',
    right: 'translateX(20px)',
  };
  
  await animateElement(
    element,
    { 
      opacity: '1',
      transform: 'translate(0, 0)',
      height: element.offsetHeight + 'px',
      margin: getComputedStyle(element).margin,
      padding: getComputedStyle(element).padding
    },
    { 
      opacity: '0',
      transform: transforms[direction],
      height: '0px',
      margin: '0',
      padding: '0'
    },
    duration,
    Easing.IN
  );
  
  element.remove();
}

/**
 * Staggered animation delay calculator
 * @param {number} index - Item index
 * @param {number} baseDelay - Base delay in ms
 * @param {number} staggerDelay - Stagger delay per item in ms
 * @returns {number} Total delay in ms
 */
export function staggerDelay(index, baseDelay = 0, staggerDelay = 50) {
  return baseDelay + (index * staggerDelay);
}

/**
 * Check if user prefers reduced motion
 * @returns {boolean} True if user prefers reduced motion
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Conditionally run animation based on user preference
 * @param {Function} animationFn - Animation function to run
 * @param {...any} args - Arguments for the animation function
 * @returns {Promise<void>|undefined}
 */
export async function conditionalAnimation(animationFn, ...args) {
  if (prefersReducedMotion()) {
    // Skip animation, just return resolved promise
    return Promise.resolve();
  }
  return animationFn(...args);
}

/**
 * Create a shimmer effect animation for skeleton screens
 * @param {HTMLElement} element - Element to apply shimmer
 */
export function applyShimmer(element) {
  element.style.background = 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)';
  element.style.backgroundSize = '200% 100%';
  element.style.animation = 'shimmer 1.5s infinite';
}

/**
 * CSS keyframes for shimmer effect (inject into document)
 */
export function injectShimmerKeyframes() {
  if (document.getElementById('shimmer-keyframes')) return;
  
  const style = document.createElement('style');
  style.id = 'shimmer-keyframes';
  style.textContent = `
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Badge "pop" animation for cart badge updates
 * Scale 1.0→1.3→1.0 with bounce effect
 * @param {HTMLElement} element - Badge element to animate
 */
export async function badgePopAnimation(element) {
  await animateElement(
    element,
    { transform: 'scale(1)' },
    { transform: 'scale(1.3)' },
    Duration.INSTANT / 2,
    Easing.BOUNCE
  );
  await animateElement(
    element,
    { transform: 'scale(1.3)' },
    { transform: 'scale(1)' },
    Duration.INSTANT / 2,
    Easing.BOUNCE
  );
}

/**
 * Cart header shake animation (subtle rotate)
 * @param {HTMLElement} element - Header element to animate
 * @param {number} intensity - Shake intensity in degrees (default 2)
 */
export function cartHeaderShake(element, intensity = 2) {
  const keyframes = [
    { transform: 'rotate(0deg)' },
    { transform: `rotate(-${intensity}deg)` },
    { transform: `rotate(${intensity}deg)` },
    { transform: `rotate(-${intensity}deg)` },
    { transform: `rotate(${intensity}deg)` },
    { transform: 'rotate(0deg)' },
  ];
  
  return element.animate(keyframes, {
    duration: Duration.NORMAL,
    easing: Easing.DEFAULT,
  }).finished;
}

/**
 * Apply staggered entrance animation to a list of elements
 * @param {HTMLElement[]} elements - Array of elements to animate
 * @param {string} animationClass - CSS class with animation
 * @param {number} baseDelay - Base delay in ms
 * @param {number} staggerDelay - Delay between each element in ms
 */
export function applyStaggeredAnimation(elements, animationClass = 'stagger-fade-in', baseDelay = 0, staggerDelay = 50) {
  elements.forEach((el, index) => {
    el.style.animationDelay = `${baseDelay + (index * staggerDelay)}ms`;
    el.classList.add(animationClass);
  });
}

/**
 * Inject staggered animation keyframes
 */
export function injectStaggeredAnimationStyles() {
  const styleId = 'stagger-animation-styles';
  if (document.getElementById(styleId)) return;
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .stagger-fade-in {
      animation: stagger-fade-in 400ms cubic-bezier(0, 0, 0.2, 1) both;
    }
    
    @keyframes stagger-fade-in {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @media (prefers-reduced-motion: reduce) {
      .stagger-fade-in {
        animation: none;
        opacity: 1;
        transform: none;
      }
    }
  `;
  document.head.appendChild(style);
}
