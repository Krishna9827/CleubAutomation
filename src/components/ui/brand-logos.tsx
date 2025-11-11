interface BrandLogoProps {
  src: string;
  alt: string;
  size?: string;
}

function BrandLogo({ src, alt, size = "h-12" }: BrandLogoProps) {
  return (
    <div className={`${size} flex items-center justify-center p-4`}>
      <img
        src={src}
        alt={alt}
        className="h-full w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
      />
    </div>
  );
}

export function BrandLogos() {
  const brands = [
    { name: "Lutron", size: "h-12" },
    { name: "Control4", size: "h-14" },
    { name: "Savant", size: "h-12" },
    { name: "Crestron", size: "h-16" },
    { name: "RTI", size: "h-10" },
    { name: "Bose", size: "h-14" },
  ];

  return (
    <div className="py-12">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent">
          Trusted Brands
        </h3>
      </div>
      
      <div className="relative w-full overflow-hidden bg-transparent">
        <div className="flex space-x-8 animate-[scroll_20s_linear_infinite]">
          {[...brands, ...brands].map((brand, index) => (
            <BrandLogo
              key={`${brand.name}-${index}`}
              src={`/images/brands/${brand.name.toLowerCase()}.png`}
              alt={brand.name}
              size={brand.size}
            />
          ))}
        </div>
      </div>
    </div>
  );
}