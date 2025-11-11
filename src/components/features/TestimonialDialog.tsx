import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Quote, Home, Calendar, Star, ChevronRight } from "lucide-react";

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
        <Card className="bg-slate-900/70 border border-slate-800 shadow-xl hover:shadow-2xl transition-all cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Quote className="w-5 h-5 text-teal-400 flex-shrink-0" />
              <div>
                <div className="text-slate-100">{testimonial.quote}</div>
                <div className="text-xs text-slate-400 mt-2">— {testimonial.clientName}</div>
                <div className="mt-3 text-xs text-teal-400 flex items-center">
                  View Case Study <ChevronRight className="w-3 h-3 ml-1" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">Case Study: {testimonial.propertyType}</DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-4 mt-2 text-slate-400">
              <div className="flex items-center gap-1">
                <Home className="w-4 h-4" />
                <span>{testimonial.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{testimonial.date}</span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {testimonial.videoUrl && (
            <div className="rounded-lg overflow-hidden">
              <video className="w-full h-[240px] object-cover" autoPlay muted loop playsInline>
                <source src={testimonial.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          <div>
            <h4 className="text-white font-medium mb-2">Project Overview</h4>
            <p className="text-slate-300 text-sm">{testimonial.projectDetails}</p>
          </div>

          <div>
            <h4 className="text-white font-medium mb-2">Key Features Implemented</h4>
            <div className="flex flex-wrap gap-2">
              {testimonial.features.map((feature, index) => (
                <Badge key={index} variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-700">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-2">Results & Impact</h4>
            <div className="space-y-2">
              {testimonial.results.map((result, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <Star className="w-4 h-4 text-teal-400 mt-0.5" />
                  <span className="text-slate-300">{result}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4">
            <blockquote className="text-slate-300 italic">
              "{testimonial.quote}"
              <footer className="text-slate-400 text-sm mt-2">— {testimonial.clientName}</footer>
            </blockquote>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}