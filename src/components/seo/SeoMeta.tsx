import { useEffect } from 'react';

interface SeoMetaProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
}

const SeoMeta = ({
  title = "Cleub Automation - Bespoke Luxury Home Automation & Smart Living",
  description = "Seamless intelligent home automation, AI-driven security systems, and premium audio-visual theatres for discerning clients. Experience effortless luxury with Cleub's bespoke smart home solutions.",
  keywords = "luxury home automation, smart home systems, intelligent security, premium home theater, AI-driven automation, bespoke lighting control, smart access systems, ultra-luxury estates, high-net-worth home automation",
  ogImage = "https://cleubautomation.com/og-image.jpg",
  ogType = "website",
  canonicalUrl = "https://cleubautomation.com"
}: SeoMetaProps) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    // Primary Meta Tags
    updateMetaTag('title', title);
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Open Graph
    updateMetaTag('og:type', ogType, true);
    updateMetaTag('og:url', canonicalUrl, true);
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:site_name', 'Cleub Automation', true);
    updateMetaTag('og:locale', 'en_US', true);

    // Twitter
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:url', canonicalUrl);
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage);
    updateMetaTag('twitter:site', '@cleubautomation');
    updateMetaTag('twitter:creator', '@cleubautomation');
  }, [title, description, keywords, ogImage, ogType, canonicalUrl]);

  return null;
};

export default SeoMeta;

// Preset configurations for different pages
export const seoPresets = {
  home: {
    title: "Cleub Automation - Bespoke Luxury Home Automation & Intelligent Living",
    description: "Seamless AI-driven home automation, intelligent security, and premium audio-visual experiences for ultra-luxury estates. Effortless life, engineered beyond doubt.",
    keywords: "luxury home automation, smart home premium, intelligent security, bespoke home theater, AI automation, ultra-luxury estates",
    canonicalUrl: "https://cleubautomation.com"
  },
  security: {
    title: "Security & Surveillance - 24/7 Intelligent Monitoring | Cleub Automation",
    description: "AI-powered security systems with intelligent analytics for ultra-luxury estates. Bespoke surveillance solutions ensuring absolute discretion and protection.",
    keywords: "luxury home security, AI surveillance, intelligent monitoring, smart security systems, ultra-luxury estate security",
    canonicalUrl: "https://cleubautomation.com/services/security-surveillance"
  },
  lighting: {
    title: "Smart Lighting & Switches - Adaptive Control Systems | Cleub Automation",
    description: "Bespoke intelligent lighting with seamless adaptive control. Premium smart switches for effortless ambiance in luxury estates.",
    keywords: "smart lighting luxury, intelligent switches, adaptive lighting control, premium home lighting, bespoke lighting automation",
    canonicalUrl: "https://cleubautomation.com/services/lighting-switches"
  },
  theater: {
    title: "Audio-Video Theatres - Cinema-Grade Home Entertainment | Cleub Automation",
    description: "Pristine cinema-grade home theater systems with immersive acoustics. Bespoke audio-visual experiences for discerning clients.",
    keywords: "luxury home theater, cinema-grade systems, premium audio-visual, immersive home entertainment, bespoke theater design",
    canonicalUrl: "https://cleubautomation.com/services/audio-video-theatres"
  },
  automation: {
    title: "Home Automation - Seamless Intelligent Control | Cleub Automation",
    description: "Comprehensive intelligent home automation with voice and app integration. Effortless control for ultra-luxury estates.",
    keywords: "home automation luxury, intelligent control systems, voice-controlled homes, seamless automation, premium smart homes",
    canonicalUrl: "https://cleubautomation.com/services/automation"
  },
  inquiry: {
    title: "Expert Consultation - Bespoke Smart Home Solutions | Cleub Automation",
    description: "Schedule your white-glove consultation for bespoke home automation. Expert advisory and premium product sourcing for discerning clients.",
    keywords: "home automation consultation, luxury smart home expert, bespoke automation design, premium home advisory",
    canonicalUrl: "https://cleubautomation.com/inquiry"
  },
  about: {
    title: "About Cleub - Leading Luxury Home Automation Experts",
    description: "Pioneers in AI-driven home automation with 8+ years of excellence. Delivering seamless intelligent living for ultra-luxury estates across India and beyond.",
    keywords: "home automation experts, luxury automation company, smart home pioneers, Cleub Automation about",
    canonicalUrl: "https://cleubautomation.com/about"
  }
};
