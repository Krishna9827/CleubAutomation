import { useEffect } from 'react';

interface SeoSchemaProps {
  type: 'organization' | 'service';
  serviceName?: string;
  serviceType?: string;
  serviceDescription?: string;
}

const SeoSchema = ({ type, serviceName, serviceType, serviceDescription }: SeoSchemaProps) => {
  useEffect(() => {
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Cleub Automation",
      "alternateName": "Cleub",
      "url": "https://cleubautomation.com",
      "logo": "https://cleubautomation.com/logo.png",
      "description": "Bespoke AI-driven home automation, intelligent security systems, and seamless luxury theater experiences for discerning clients.",
      "foundingDate": "2017",
      "areaServed": {
        "@type": "Place",
        "name": ["India", "UAE", "Singapore"]
      },
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
      "description": serviceDescription || "Intelligent home automation solutions with seamless integration.",
      "provider": {
        "@type": "Organization",
        "name": "Cleub Automation",
        "url": "https://cleubautomation.com"
      },
      "areaServed": {
        "@type": "Place",
        "name": ["Global", "India", "UAE", "Singapore"]
      },
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

    const schema = type === 'organization' ? organizationSchema : serviceSchema;

    // Remove existing schema script if present
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new schema script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      const scriptToRemove = document.querySelector('script[type="application/ld+json"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [type, serviceName, serviceType, serviceDescription]);

  return null;
};

export default SeoSchema;
