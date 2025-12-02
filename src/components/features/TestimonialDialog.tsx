import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Quote, MapPin, Calendar, Check } from "lucide-react";

interface TestimonialCase {
  clientName: string;
  propertyType: string;
  location: string;
  date: string;
  quote: string;
  projectDetails: string;
  features: string[];
  results: string[];
  videoUrl?: string;
}

interface TestimonialDialogProps {
  testimonial: TestimonialCase;
}

export default function TestimonialDialog({ testimonial }: TestimonialDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {/* Card Trigger - Portrait 9:16 with Center Content */}
        <div 
          className="group relative cursor-pointer bg-[#0A0A0A] border border-[#1A1A1A] overflow-hidden transition-all duration-700 hover:-translate-y-2"
          style={{ aspectRatio: '9/16' }}
        >
          {/* Video Background - Subtle on hover */}
          {testimonial.videoUrl && (
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-1000">
              <video 
                className="w-full h-full object-cover"
                autoPlay 
                muted 
                loop 
                playsInline
              >
                <source src={testimonial.videoUrl} type="video/mp4" />
              </video>
            </div>
          )}

          {/* Content - Centered Vertically & Horizontally */}
          <div className="relative h-full flex flex-col items-center justify-center text-center p-8 lg:p-12">
            {/* Quote Icon */}
            <Quote className="w-6 h-6 text-[#F5F5F3]/10 mb-8" />
            
            {/* Client Quote */}
            <blockquote className="text-[#F5F5F3] text-base lg:text-lg leading-relaxed tracking-wide mb-8 font-serif italic max-w-[90%]">
              "{testimonial.quote}"
            </blockquote>
            
            {/* Client Name */}
            <p className="text-[8px] tracking-[0.35em] uppercase text-[#F5F5F3]/40 mb-6">
              {testimonial.clientName}
            </p>

            {/* Location & Date */}
            <div className="flex items-center justify-center gap-6 text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/30">
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                <span>{testimonial.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                <span>{testimonial.date}</span>
              </div>
            </div>

            {/* Hover Indicator - Centered */}
            <div className="mt-8 h-[1px] w-0 bg-[#F5F5F3]/20 group-hover:w-16 transition-all duration-700 mx-auto" />
          </div>
        </div>
      </DialogTrigger>
      
      {/* Dialog Content - 40/60 Asymmetric Split */}
      <DialogContent className="max-w-[95vw] lg:max-w-[1400px] h-[90vh] bg-[#0A0A0A] border-[#1A1A1A] p-0 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 h-full overflow-auto">
          
          {/* Left - Video (40%) */}
          <div className="lg:col-span-5 relative bg-[#0A0A0A] min-h-[300px] lg:min-h-full">
            {testimonial.videoUrl ? (
              <video 
                className="w-full h-full object-cover sticky top-0"
                autoPlay 
                muted 
                loop 
                playsInline
              >
                <source src={testimonial.videoUrl} type="video/mp4" />
              </video>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] flex items-center justify-center">
                <Quote className="w-24 h-24 text-[#F5F5F3]/5" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0A0A0A]/40" />
          </div>

          {/* Right - Content (60%) */}
          <div className="lg:col-span-7 bg-[#0A0A0A] p-8 lg:p-16 overflow-y-auto">
            
            {/* Header */}
            <div className="mb-12">
              <p className="text-[8px] tracking-[0.4em] uppercase text-[#F5F5F3]/30 mb-4">
                Case Study
              </p>
              <h2 className="font-serif text-[clamp(2.5rem,5vw,5rem)] leading-[0.92] text-[#F5F5F3] tracking-tight mb-6">
                {testimonial.propertyType}
              </h2>
              
              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-6 text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/40">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  <span>{testimonial.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span>{testimonial.date}</span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-[1px] bg-[#1A1A1A] mb-12" />

            {/* Project Overview */}
            <div className="mb-16">
              <h3 className="text-[9px] tracking-[0.35em] uppercase text-[#F5F5F3]/40 mb-4">
                Project Overview
              </h3>
              <p className="text-[#F5F5F3]/70 text-sm leading-loose tracking-wide max-w-[600px]">
                {testimonial.projectDetails}
              </p>
            </div>

            {/* Key Features */}
            <div className="mb-16">
              <h3 className="text-[9px] tracking-[0.35em] uppercase text-[#F5F5F3]/40 mb-6">
                Key Features Implemented
              </h3>
              <div className="grid grid-cols-2 gap-1 max-w-[600px]">
                {testimonial.features.map((feature, index) => (
                  <div 
                    key={index} 
                    className="bg-[#0A0A0A] border border-[#1A1A1A] p-4 hover:border-[#F5F5F3]/10 transition-colors duration-500"
                  >
                    <p className="text-[10px] tracking-[0.25em] uppercase text-[#F5F5F3]/60">
                      {feature}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Results & Impact */}
            <div className="mb-16">
              <h3 className="text-[9px] tracking-[0.35em] uppercase text-[#F5F5F3]/40 mb-6">
                Results & Impact
              </h3>
              <div className="space-y-4 max-w-[600px]">
                {testimonial.results.map((result, index) => (
                  <div key={index} className="flex items-start gap-4 group">
                    <Check className="w-4 h-4 text-[#F5F5F3]/20 mt-0.5 flex-shrink-0 group-hover:text-[#F5F5F3]/40 transition-colors duration-500" />
                    <p className="text-[#F5F5F3]/60 text-sm leading-relaxed tracking-wide">
                      {result}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Quote */}
            <div className="border-t border-[#1A1A1A] pt-12">
              <blockquote className="max-w-[600px]">
                <Quote className="w-8 h-8 text-[#F5F5F3]/10 mb-6" />
                <p className="font-serif text-[#F5F5F3]/80 text-xl lg:text-2xl leading-relaxed italic tracking-wide mb-6">
                  "{testimonial.quote}"
                </p>
                <footer className="text-[8px] tracking-[0.35em] uppercase text-[#F5F5F3]/30">
                  — {testimonial.clientName}
                </footer>
              </blockquote>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}