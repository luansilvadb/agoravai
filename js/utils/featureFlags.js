/**
 * Feature Flags Utility
 * Manage feature flags with localStorage persistence
 * 
 * @see design.md for feature flag specifications
 */

const STORAGE_PREFIX = 'pos-feature-';

/**
 * Default feature flags
 */
const DEFAULT_FLAGS = {
  usePremiumPOS: false,
  enableAnalytics: true,
  debugMode: false
};

/**
 * Get feature flag value
 * @param {string} flag - Flag name
 * @param {boolean} defaultValue - Default if not set
 * @returns {boolean}
 */
export function getFeatureFlag(flag, defaultValue = false) {
  const stored = localStorage.getItem(`${STORAGE_PREFIX}${flag}`);
  if (stored === null) {
    return DEFAULT_FLAGS[flag] !== undefined ? DEFAULT_FLAGS[flag] : defaultValue;
  }
  return stored === 'true';
}

/**
 * Set feature flag value
 * @param {string} flag - Flag name
 * @param {boolean} value - New value
 */
export function setFeatureFlag(flag, value) {
  localStorage.setItem(`${STORAGE_PREFIX}${flag}`, String(value));
  
  // Dispatch event for real-time updates
  window.dispatchEvent(new CustomEvent('featureflagchange', {
    detail: { flag, value }
  }));
}

/**
 * Toggle feature flag
 * @param {string} flag - Flag name
 * @returns {boolean} New value
 */
export function toggleFeatureFlag(flag) {
  const current = getFeatureFlag(flag);
  const newValue = !current;
  setFeatureFlag(flag, newValue);
  return newValue;
}

/**
 * Enable feature flag
 * @param {string} flag - Flag name
 */
export function enableFeature(flag) {
  setFeatureFlag(flag, true);
}

/**
 * Disable feature flag
 * @param {string} flag - Flag name
 */
export function disableFeature(flag) {
  setFeatureFlag(flag, false);
}

/**
 * Reset feature flag to default
 * @param {string} flag - Flag name
 */
export function resetFeatureFlag(flag) {
  localStorage.removeItem(`${STORAGE_PREFIX}${flag}`);
}

/**
 * Reset all feature flags
 */
export function resetAllFeatureFlags() {
  Object.keys(DEFAULT_FLAGS).forEach(flag => {
    localStorage.removeItem(`${STORAGE_PREFIX}${flag}`);
  });
}

/**
 * Get all feature flags
 * @returns {Object}
 */
export function getAllFeatureFlags() {
  const flags = {};
  Object.keys(DEFAULT_FLAGS).forEach(flag => {
    flags[flag] = getFeatureFlag(flag);
  });
  return flags;
}

/**
 * Feature Flag Manager Class
 */
export class FeatureFlagManager {
  constructor() {
    this.listeners = new Map();
    
    // Listen for changes
    window.addEventListener('featureflagchange', (e) => {
      this.notifyListeners(e.detail.flag, e.detail.value);
    });
  }

  /**
   * Get flag value
   * @param {string} flag
   * @returns {boolean}
   */
  get(flag) {
    return getFeatureFlag(flag);
  }

  /**
   * Set flag value
   * @param {string} flag
   * @param {boolean} value
   */
  set(flag, value) {
    setFeatureFlag(flag, value);
  }

  /**
   * Toggle flag
   * @param {string} flag
   * @returns {boolean}
   */
  toggle(flag) {
    return toggleFeatureFlag(flag);
  }

  /**
   * Subscribe to flag changes
   * @param {string} flag
   * @param {Function} callback
   * @returns {Function} Unsubscribe function
   */
  subscribe(flag, callback) {
    if (!this.listeners.has(flag)) {
      this.listeners.set(flag, new Set());
    }
    this.listeners.get(flag).add(callback);
    
    return () => {
      this.listeners.get(flag)?.delete(callback);
    };
  }

  /**
   * Notify listeners of flag change
   * @private
   */
  notifyListeners(flag, value) {
    this.listeners.get(flag)?.forEach(callback => {
      callback(value, flag);
    });
  }

  /**
   * Check if premium POS is enabled
   * @returns {boolean}
   */
  isPremiumPOSEnabled() {
    return this.get('usePremiumPOS');
  }

  /**
   * Enable premium POS
   */
  enablePremiumPOS() {
    this.set('usePremiumPOS', true);
  }

  /**
   * Disable premium POS
   */
  disablePremiumPOS() {
    this.set('usePremiumPOS', false);
  }
}

// Singleton instance
export const featureFlags = new FeatureFlagManager();

export default featureFlags;
