import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { Compass, Home, BookOpen, Newspaper, HeartHandshake, Phone, Search } from 'lucide-react';
import { SEO } from '../components/common/SEO';

export const NotFoundPage: React.FC = () => {
  const quickLinks = [
    {
      title: 'Our Programs',
      description: 'Explore the 5 core strategic intervention pillars.',
      href: '/programs',
      icon: <BookOpen className="w-5 h-5 text-forest-700" />
    },
    {
      title: 'News & Updates',
      description: 'Read verified reports and grassroots stories.',
      href: '/news',
      icon: <Newspaper className="w-5 h-5 text-forest-700" />
    },
    {
      title: 'Get Involved',
      description: 'Discover volunteer and partnership opportunities.',
      href: '/get-involved',
      icon: <HeartHandshake className="w-5 h-5 text-forest-700" />
    },
    {
      title: 'Contact Secretariat',
      description: 'Speak directly with our leadership and field team.',
      href: '/contact',
      icon: <Phone className="w-5 h-5 text-forest-700" />
    }
  ];

  return (
    <div className="py-16 sm:py-24 text-center">
      <SEO
        title="404: Page Not Found"
        description="The requested page could not be found. Explore Mwancha Senior Community programs, news, and community initiatives."
      />
      <Container size="md">
        <div className="bg-white rounded-3xl p-8 sm:p-14 border border-warm-200 shadow-card max-w-2xl mx-auto space-y-8">
          <div className="w-16 h-16 rounded-2xl bg-forest-100 text-forest-800 flex items-center justify-center mx-auto shadow-inner">
            <Compass className="w-8 h-8" />
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold text-forest-800 uppercase tracking-widest bg-forest-50 px-3.5 py-1 rounded-full border border-forest-200 inline-block">
              Error 404 &bull; Page Not Found
            </span>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 font-display">
              We Couldn't Find That Page
            </h1>

            <p className="text-base text-charcoal-600 leading-relaxed max-w-lg mx-auto">
              The page you are looking for may have been moved, renamed, or is temporarily unavailable. Let us help guide you back to our community initiatives.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button to="/" variant="primary" size="md" icon={<Home className="w-4 h-4" />}>
              Return to Home
            </Button>
            <Button to="/search" variant="outline" size="md" icon={<Search className="w-4 h-4" />}>
              Search the Website
            </Button>
          </div>

          {/* Quick Helpful Directory */}
          <div className="pt-6 border-t border-warm-200 text-left space-y-3">
            <h2 className="text-xs font-bold text-charcoal-500 uppercase tracking-wider text-center">
              Popular Destinations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="p-3.5 rounded-xl border border-warm-200 hover:border-forest-400 bg-warm-50/50 hover:bg-forest-50/50 transition-all flex items-start gap-3 group"
                >
                  <div className="p-2 rounded-lg bg-white border border-warm-200 shadow-2xs group-hover:bg-forest-100 transition-colors">
                    {link.icon}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-bold text-charcoal-900 group-hover:text-forest-900 block">
                      {link.title}
                    </span>
                    <span className="text-xs text-charcoal-600 leading-snug block mt-0.5">
                      {link.description}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-4 text-xs text-charcoal-500">
            <span>Looking for something specific? </span>
            <Link to="/contact" className="text-forest-800 font-bold hover:underline">
              Contact our Secretariat Desk
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};
