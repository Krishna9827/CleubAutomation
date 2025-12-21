import { useEffect } from 'react';

interface SeoSchemaProps {
  type: 'organization' | 'service' | 'article';
  serviceName?: string;
  serviceType?: string;
  serviceDescription?: string;
  // Article-specific props
  articleTitle?: string;
  articleDescription?: string;
  articleDatePublished?: string;
  articleDateModified?: string;
  articleAuthor?: string;
  articleImage?: string;
  articleUrl?: string;
  articleWordCount?: number;
  articleKeywords?: string[];
}

const SeoSchema = ({ 
  type, 
  serviceName, 
  serviceType, 
  serviceDescription,
  articleTitle,
  articleDescription,
  articleDatePublished,
  articleDateModified,
  articleAuthor = 'Cleub Automation Team',
  articleImage,
  articleUrl,
  articleWordCount,
  articleKeywords
}: SeoSchemaProps) => {
  useEffect(() => {
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Cleub Automation",
      "alternateName": "Cleub",
      "url": "https://www.cleub.com",
      "logo": "https://www.cleub.com/logo.png",
      "description": "Cleub Automation is a KNX-certified luxury home automation integrator serving Delhi NCR (Gurgaon, Noida, Delhi, Faridabad, Ghaziabad) and Tier-2 cities. We deliver premium wired and wireless automation for apartments, villas, and penthouses with budgets from ₹1L to ₹50L+. Founded in 2017 with 4000+ projects delivered.",
      "foundingDate": "2017",
      "areaServed": [
        {
          "@type": "City",
          "name": "Gurgaon",
          "containedInPlace": { "@type": "State", "name": "Haryana" }
        },
        {
          "@type": "City",
          "name": "Noida",
          "containedInPlace": { "@type": "State", "name": "Uttar Pradesh" }
        },
        {
          "@type": "City",
          "name": "New Delhi",
          "containedInPlace": { "@type": "Country", "name": "India" }
        },
        {
          "@type": "City",
          "name": "Faridabad",
          "containedInPlace": { "@type": "State", "name": "Haryana" }
        },
        {
          "@type": "City",
          "name": "Ghaziabad",
          "containedInPlace": { "@type": "State", "name": "Uttar Pradesh" }
        },
        {
          "@type": "City",
          "name": "Jaipur",
          "containedInPlace": { "@type": "State", "name": "Rajasthan" }
        },
        {
          "@type": "City",
          "name": "Chandigarh",
          "containedInPlace": { "@type": "Country", "name": "India" }
        }
      ],
      "sameAs": [
        "https://www.instagram.com/cleubautomation",
        "https://www.linkedin.com/company/cleub-automation",
        "https://twitter.com/cleubautomation",
        "https://www.facebook.com/cleubautomation"
      ],
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": "+91-9667603999",
          "contactType": "Sales",
          "areaServed": "IN",
          "availableLanguage": ["English", "Hindi"]
        },
        {
          "@type": "ContactPoint",
          "email": "support@cleub.com",
          "contactType": "Customer Service",
          "availableLanguage": ["English", "Hindi"]
        }
      ],
      "address": [
        {
          "@type": "PostalAddress",
          "streetAddress": "M/S Cleub Automation Private Limited, Cabin A Academic Block Second Floor, Shri Mata Vaishno Devi University",
          "addressLocality": "Katra",
          "addressRegion": "Jammu and Kashmir",
          "postalCode": "182320",
          "addressCountry": "IN"
        },
        {
          "@type": "PostalAddress",
          "streetAddress": "F1-406, Unitech Unihomes, Sector 117",
          "addressLocality": "Noida",
          "addressRegion": "Uttar Pradesh",
          "postalCode": "201304",
          "addressCountry": "IN"
        },
        {
          "@type": "PostalAddress",
          "streetAddress": "78 Akashneem Marg, DLF Phase 2 (Second Floor)",
          "addressLocality": "Gurgaon",
          "addressRegion": "Haryana",
          "addressCountry": "IN"
        },
        {
          "@type": "PostalAddress",
          "streetAddress": "M-50, Block M, Saket (Basement)",
          "addressLocality": "New Delhi",
          "postalCode": "110017",
          "addressCountry": "IN"
        }
      ],
      "priceRange": "₹₹₹₹",
      "hasCredential": {
        "@type": "EducationalOccupationalCredential",
        "credentialCategory": "Professional Certification",
        "name": "KNX Certified"
      },
      "knowsAbout": [
        "Home Automation",
        "KNX Systems",
        "Smart Lighting",
        "Home Theater",
        "Security Systems",
        "Control4",
        "Crestron",
        "Savant",
        "DALI Lighting",
        "Motorized Curtains"
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "4000",
        "bestRating": "5"
      }
    };

    const serviceSchema = {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": serviceType || "Home Automation",
      "name": serviceName || "Premium Home Automation",
      "description": serviceDescription || "KNX-certified intelligent home automation solutions for luxury homes in Delhi NCR. Budgets from ₹1L to ₹50L+.",
      "provider": {
        "@type": "Organization",
        "name": "Cleub Automation",
        "url": "https://www.cleub.com"
      },
      "areaServed": [
        { "@type": "City", "name": "Gurgaon" },
        { "@type": "City", "name": "Noida" },
        { "@type": "City", "name": "New Delhi" },
        { "@type": "City", "name": "Faridabad" },
        { "@type": "City", "name": "Ghaziabad" },
        { "@type": "City", "name": "Jaipur" },
        { "@type": "City", "name": "Chandigarh" }
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Home Automation Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Security & Surveillance",
              "description": "24/7 intelligent monitoring with AI-powered analytics for ultra-luxury estates"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Lighting & Switches",
              "description": "Bespoke smart lighting systems with adaptive control and energy optimization"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Audio-Video Theatres",
              "description": "Cinema-grade home theater systems with pristine acoustics and immersive experiences"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Home Automation",
              "description": "Seamless intelligent home control systems with voice and app integration"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Digital Locks",
              "description": "Biometric and smart access control for uncompromising security"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Networking",
              "description": "Robust enterprise-grade connectivity infrastructure for smart estates"
            }
          }
        ]
      }
    };

    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": articleTitle,
      "description": articleDescription,
      "image": articleImage,
      "datePublished": articleDatePublished,
      "dateModified": articleDateModified || articleDatePublished,
      "wordCount": articleWordCount,
      "keywords": articleKeywords?.join(', '),
      "url": articleUrl,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": articleUrl
      },
      "author": {
        "@type": "Organization",
        "name": articleAuthor,
        "url": "https://www.cleub.com",
        "logo": "https://www.cleub.com/logo.png"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Cleub Automation",
        "url": "https://www.cleub.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.cleub.com/logo.png"
        }
      },
      "about": {
        "@type": "Thing",
        "name": "Home Automation",
        "description": "Smart home automation systems for luxury residences in Delhi NCR"
      },
      "isPartOf": {
        "@type": "Blog",
        "name": "Cleub Automation Blog",
        "url": "https://www.cleub.com/blog"
      }
    };

    let schema;
    if (type === 'organization') {
      schema = organizationSchema;
    } else if (type === 'article') {
      schema = articleSchema;
    } else {
      schema = serviceSchema;
    }

    // Remove existing schema script if present
    const existingScript = document.querySelector(`script[data-schema-type="${type}"]`);
    if (existingScript) {
      existingScript.remove();
    }

    // Add new schema script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema-type', type);
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      const scriptToRemove = document.querySelector(`script[data-schema-type="${type}"]`);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [type, serviceName, serviceType, serviceDescription, articleTitle, articleDescription, articleDatePublished, articleDateModified, articleAuthor, articleImage, articleUrl, articleWordCount, articleKeywords]);

  return null;
};

export default SeoSchema;
