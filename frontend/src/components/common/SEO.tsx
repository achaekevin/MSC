import React, { useEffect } from 'react';
import { MSC_ORGANIZATION } from '../../constants';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  canonicalUrl?: string;
  type?: 'website' | 'article' | 'profile';
  schema?: Record<string, unknown>;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description = 'Mwancha Senior Community (MSC) is a community-based organization dedicated to advancing the rights, welfare, and wellbeing of older persons in Kenya through holistic care and grassroots mobilization.',
  keywords = 'Mwancha Senior Community, MSC, elderly care Kenya, senior citizens rights Nyamira, older persons welfare, psychosocial support seniors',
  image = '/logo.png',
  canonicalUrl,
  type = 'website',
  schema,
}) => {
  const fullTitle = title 
    ? `${title} | ${MSC_ORGANIZATION.name} (${MSC_ORGANIZATION.shortName})`
    : `${MSC_ORGANIZATION.name} (${MSC_ORGANIZATION.shortName}) | Dignity, Care & Wellbeing for Older Persons`;

  useEffect(() => {
    // 1. Title
    document.title = fullTitle;

    // 2. Helper to set or update meta tag
    const setMetaTag = (attributeName: string, attributeValue: string, content: string) => {
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard Meta
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);

    // OpenGraph
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:image', image);
    if (canonicalUrl || typeof window !== 'undefined') {
      setMetaTag('property', 'og:url', canonicalUrl || window.location.href);
    }

    // Twitter Card
    setMetaTag('property', 'twitter:title', fullTitle);
    setMetaTag('property', 'twitter:description', description);
    setMetaTag('property', 'twitter:image', image);

    // Canonical Link
    const currentUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : '');
    if (currentUrl) {
      let canonicalEl = document.querySelector('link[rel="canonical"]');
      if (!canonicalEl) {
        canonicalEl = document.createElement('link');
        canonicalEl.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalEl);
      }
      canonicalEl.setAttribute('href', currentUrl);
    }

    // 3. Dynamic JSON-LD Structured Data
    let scriptTag = document.getElementById('dynamic-jsonld') as HTMLScriptElement | null;
    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'dynamic-jsonld';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.text = JSON.stringify(schema);
    } else if (scriptTag) {
      scriptTag.remove();
    }
  }, [fullTitle, description, keywords, image, canonicalUrl, type, schema]);

  return null;
};
