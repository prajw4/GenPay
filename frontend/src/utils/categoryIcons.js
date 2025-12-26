/**
 * Maps transaction category to emoji icon
 * Clean one-to-one mapping with no hardcoded overrides
 * 
 * @param {string} category - The transaction category
 * @returns {string} The corresponding emoji icon
 */
export function getCategoryIcon(category) {
  const iconMap = {
    'Food': '🍔',
    'Bills': '🧾',
    'Recharge': '🔋',
    'Transfer': '➡️'
  };

  // Return icon for category, or transfer icon as fallback for undefined/null
  return iconMap[category] || iconMap['Transfer'];
}

/**
 * Get all valid categories
 * @returns {string[]} Array of valid category names
 */
export function getValidCategories() {
  return ['Food', 'Bills', 'Recharge', 'Transfer'];
}
