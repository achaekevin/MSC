import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { Compass, Home, ArrowRight, Heart } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="py-20 sm:py-28 text-center">
      <Container size="sm">
        <div className="bg-white rounded-3xl p-8 sm:p-14 border border-warm-200 shadow-card max-w-xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-forest-100 text-forest-800 flex items-center justify-center mx-auto">
            <Compass className="w-8 h-8" />
          </div>

          <span className="text-xs font-bold text-forest-800 uppercase tracking-widest bg-forest-50 px-3 py-1 rounded-full border border-forest-200 inline-block">
            Error 404 &bull; Page Not Found
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 font-display">
            We Couldn't Find That Page
          </h1>

          <p className="text-base text-charcoal-600 leading-relaxed max-w-md mx-auto">
            The page you are looking for may have been moved, renamed, or is temporarily unavailable. Let us help guide you back to our community initiatives.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button to="/" variant="primary" size="md" icon={<Home className="w-4 h-4" />}>
              Return to Home
            </Button>
            <Button to="/programs" variant="outline" size="md">
              View Programs
            </Button>
          </div>

          <div className="pt-6 border-t border-warm-100 text-xs text-charcoal-500">
            <span>Need assistance? </span>
            <Link to="/contact" className="text-forest-800 font-bold hover:underline">
              Contact our Secretariat Desk
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};
