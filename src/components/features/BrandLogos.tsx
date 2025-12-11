import React from 'react';
import { OrbitingCircles } from '@/components/ui/orbiting-circles';

const BrandLogos: React.FC = () => {
  const logos = [
    '/images/brand-logos/logo1.png',
    '/images/brand-logos/logo2.png',
    '/images/brand-logos/logo3.svg.png',
    '/images/brand-logos/logo4.png',
    '/images/brand-logos/logo5.png',
    '/images/brand-logos/logo6.png',
    '/images/brand-logos/logo7.png',
    '/images/brand-logos/logo8.jpg',
    '/images/brand-logos/logo9.jpg',
    '/images/brand-logos/logo10.png',
  ];

  return (
    <div className="w-full overflow-hidden bg-transparent py-20">
      <div className="relative mx-auto w-full max-w-7xl">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative size-[200px]">
            <OrbitingCircles radius={100} duration={30} delay={0} className="size-4" />
            <OrbitingCircles radius={80} duration={20} delay={2} className="size-3" reverse />
            <OrbitingCircles radius={60} duration={15} delay={4} className="size-2" />
          </div>
        </div>
        <div className="overflow-hidden">
          <style>{`
            @keyframes scroll {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-50%);
              }
            }
            .scroll-wrapper {
              display: flex;
              gap: 4rem;
              padding: 0 2rem;
              animation: scroll 20s linear infinite;
              will-change: transform;
            }
          `}</style>
          <div className="scroll-wrapper">
            {logos.concat(logos).map((logo, index) => (
              <img
                key={index}
                src={logo}
                alt={`Partner brand logo ${index + 1}`}
                className="h-24 w-auto object-contain grayscale-0 transition-all hover:grayscale flex-shrink-0"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandLogos;