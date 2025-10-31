export function updateMetaTags({ title, description, url }) {
  // Update document title
  document.title = title;

  // Update or create OpenGraph tags
  updateMetaTag('og:title', title);
  updateMetaTag('og:description', description);
  if (url) updateMetaTag('og:url', url);

  // Update or create Twitter Card tags
  updateMetaTag('twitter:title', title);
  updateMetaTag('twitter:description', description);
}

function updateMetaTag(property, content) {
  const isOg = property.startsWith('og:');
  const attribute = isOg ? 'property' : 'name';
  
  let element = document.querySelector(`meta[${attribute}="${property}"]`);
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, property);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}