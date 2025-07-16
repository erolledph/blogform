// Utility functions

export const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

export const parseArrayInput = (value) => {
  return value.split(',').map(item => item.trim()).filter(item => item);
};

export const formatDate = (date) => {
  if (!date) return 'N/A';
  
  if (date.toDate) {
    return date.toDate().toLocaleDateString();
  }
  
  return new Date(date).toLocaleDateString();
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'published':
      return 'badge-success';
    case 'draft':
      return 'badge-warning';
    default:
      return 'badge-secondary';
  }
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Custom domain helpers
export const getCustomDomain = () => {
  try {
    return localStorage.getItem('customDomain') || '';
  } catch (error) {
    console.error('Error getting custom domain:', error);
    return '';
  }
};

export const setCustomDomain = (domain) => {
  try {
    if (domain) {
      localStorage.setItem('customDomain', domain);
    } else {
      localStorage.removeItem('customDomain');
    }
  } catch (error) {
    console.error('Error setting custom domain:', error);
  }
};

export const getContentUrl = (slug) => {
  const customDomain = getCustomDomain();
  
  if (customDomain) {
    // Add https:// if no protocol is present
    let domain = customDomain;
    if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
      domain = `https://${domain}`;
    }
    return `${domain}/post/${slug}`;
  }
  
  // Default domain
  return `https://ailodi.xyz/post/${slug}`;
};