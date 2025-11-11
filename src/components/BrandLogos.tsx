import React from 'react';
import { OrbitingCircles } from '@/components/ui/orbiting-circles';

const BrandLogos: React.FC = () => {
  const logos = [
    '/images/brand-logos/logo1.png',
    '/images/brand-logos/logo2.png',
  ];

  return (
    <div className="w-full overflow-hidden bg-transparent py-12">
      <div className="relative mx-auto w-full max-w-7xl">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative size-[200px]">
            <OrbitingCircles radius={100} duration={30} delay={0} className="size-4" />
            <OrbitingCircles radius={80} duration={20} delay={2} className="size-3" reverse />
            <OrbitingCircles radius={60} duration={15} delay={4} className="size-2" />
          </div>
        </div>
        <div className="relative flex min-w-full animate-scroll items-center justify-around gap-8">
          {logos.concat(logos).map((logo, index) => (
            <img
              key={index}
              src={logo}
              alt={`Partner brand logo ${index + 1}`}
              className="h-12 w-auto object-contain grayscale transition-all hover:grayscale-0"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandLogos;