import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProfileMenu from '@/components/ui/profile-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavLink {
  label: string;
  href: string;
  isExternal?: boolean;
}

interface SiteNavProps {
  brand: string;
  links: NavLink[];
  rightActions?: React.ReactNode;
}

const SiteNav = ({ brand, links, rightActions }: SiteNavProps) => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const onClick = (href: string, isExternal?: boolean) => {
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMenuOpen(false); // Close mobile menu after navigation
      return;
    }
    if (isExternal) {
      window.location.href = href;
      return;
    }
    navigate(href);
    setIsMenuOpen(false); // Close mobile menu after navigation
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/20 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Mobile Layout */}
        <div className="flex md:hidden items-center justify-between">
          {/* Mobile Menu Button - Top Left */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMenu}
            className="text-white hover:bg-white/10 p-2"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
          
          {/* Brand - Center */}
          <div className="text-white font-semibold tracking-wide">{brand}</div>
          
          {/* Right Actions - Top Right */}
          <div className="flex items-center gap-2">
            {!loading && user && <ProfileMenu />}
            {rightActions}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid grid-cols-3 items-center">
          <div className="text-white font-semibold tracking-wide">{brand}</div>
          
          {/* Desktop Navigation */}
          <nav className="flex items-center justify-center gap-6 text-sm">
            {links.map((l) => (
              <button
                key={l.label}
                onClick={() => onClick(l.href, l.isExternal)}
                className="text-slate-300 hover:text-white transition-colors whitespace-nowrap"
              >
                {l.label}
              </button>
            ))}
            
            {/* About Us Link */}
            <button
              onClick={() => navigate('/about')}
              className="text-slate-300 hover:text-white transition-colors whitespace-nowrap"
            >
              About Us
            </button>
            
            {/* Legal Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors whitespace-nowrap">
                Legal <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-900 border-slate-800">
                <DropdownMenuItem 
                  onClick={() => navigate('/privacy-policy')}
                  className="text-slate-300 hover:text-white cursor-pointer"
                >
                  Privacy Policy
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate('/cookie-policy')}
                  className="text-slate-300 hover:text-white cursor-pointer"
                >
                  Cookie Policy
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate('/terms')}
                  className="text-slate-300 hover:text-white cursor-pointer"
                >
                  Terms & Conditions
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
          
          {/* Right Actions */}
          <div className="flex items-center justify-end gap-2">
            {!loading && user && <ProfileMenu />}
            {rightActions}
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-white/10">
            <div className="flex flex-col gap-3 pt-4">
              {links.map((l) => (
                <button
                  key={l.label}
                  onClick={() => onClick(l.href, l.isExternal)}
                  className="text-slate-300 hover:text-white transition-colors text-left py-2 px-2 hover:bg-white/5 rounded"
                >
                  {l.label}
                </button>
              ))}
              
              {/* About Us Link - Mobile */}
              <button
                onClick={() => {
                  navigate('/about');
                  setIsMenuOpen(false);
                }}
                className="text-slate-300 hover:text-white transition-colors text-left py-2 px-2 hover:bg-white/5 rounded"
              >
                About Us
              </button>
              
              {/* Legal Links - Mobile (expanded, no dropdown) */}
              <div className="border-t border-white/5 pt-3 mt-2">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 px-2">Legal</p>
                <button
                  onClick={() => {
                    navigate('/privacy-policy');
                    setIsMenuOpen(false);
                  }}
                  className="text-slate-300 hover:text-white transition-colors text-left py-2 px-2 hover:bg-white/5 rounded w-full"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => {
                    navigate('/cookie-policy');
                    setIsMenuOpen(false);
                  }}
                  className="text-slate-300 hover:text-white transition-colors text-left py-2 px-2 hover:bg-white/5 rounded w-full"
                >
                  Cookie Policy
                </button>
                <button
                  onClick={() => {
                    navigate('/terms');
                    setIsMenuOpen(false);
                  }}
                  className="text-slate-300 hover:text-white transition-colors text-left py-2 px-2 hover:bg-white/5 rounded w-full"
                >
                  Terms & Conditions
                </button>
              </div>
              
              {/* Mobile Right Actions */}
              {rightActions && (
                <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row gap-2">
                  {rightActions}
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default SiteNav;