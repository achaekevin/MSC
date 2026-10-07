import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Heart, ArrowRight, Phone, Lock, Shield } from 'lucide-react';
import { Logo } from '../common/Logo';
import { Button } from '../ui/Button';
import { MSC_ORGANIZATION } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';

export const Footer: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && (user?.role === 'SUPER_ADMIN' || user?.role === 'CONTENT_ADMIN');
  const currentYear = new Date().getFullYear();

  // Filter only social links that actually have URLs configured
  const configuredSocials = Object.entries(MSC_ORGANIZATION.socialLinks).filter(
    ([, url]) => Boolean(url && url.trim().length > 0)
  );

  return (
    <footer className="bg-forest-950 text-warm-100 border-t border-forest-900" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>

      {/* Strategic Call to Action Band */}
      <div className="border-b border-forest-850 bg-forest-900/60 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <span className="text-earth-400 font-semibold text-xs uppercase tracking-wider block mb-1">
                Upholding Elder Rights & Dignity
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-warm-50 font-display">
                Partner with us to create a safer, dignified world for older citizens.
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button to="/donate" variant="secondary" size="md" icon={<Heart className="w-4 h-4 fill-white" />}>
                Donate Now
              </Button>
              <Button to="/partner" variant="outline" size="md" className="border-forest-600 text-warm-100 hover:bg-forest-800">
                Partner With Us
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Organization Bio & Logo */}
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="light" size="lg" />
            <p className="text-sm text-forest-200/90 leading-relaxed max-w-sm">
              Mwancha Senior Community (formerly Mwancha Home for the Elderly, founded in 2016) is a community-based organization dedicated to advancing the rights, welfare, and wellbeing of older persons in Kenya through holistic care and grassroots mobilization.
            </p>
            <div className="pt-2 text-xs text-forest-300">
              <p className="font-semibold text-warm-50">Stated Vision:</p>
              <p className="italic mt-1">"{MSC_ORGANIZATION.vision}"</p>
            </div>

            {/* Social media links rendered ONLY when configured */}
            {configuredSocials.length > 0 && (
              <div className="pt-2">
                <span className="text-xs uppercase tracking-wider text-forest-400 font-semibold block mb-2">
                  Follow Our Updates
                </span>
                <div className="flex gap-3">
                  {configuredSocials.map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-forest-800 text-warm-100 hover:bg-earth-600 transition-colors flex items-center justify-center text-xs capitalize"
                    >
                      {platform.slice(0, 2)}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Core Navigation Links */}
          <div>
            <h4 className="text-sm font-bold text-warm-50 uppercase tracking-wider mb-4 border-b border-forest-800 pb-2">
              Organization
            </h4>
            <ul className="space-y-2.5 text-sm text-forest-200">
              <li>
                <Link to="/about" className="hover:text-earth-300 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-forest-500" />
                  <span>About MSC</span>
                </Link>
              </li>
              <li>
                <Link to="/about/story" className="hover:text-earth-300 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-forest-500" />
                  <span>Our Story</span>
                </Link>
              </li>
              <li>
                <Link to="/about/mission" className="hover:text-earth-300 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-forest-500" />
                  <span>Mission & Core Values</span>
                </Link>
              </li>
              <li>
                <Link to="/about/structure" className="hover:text-earth-300 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-forest-500" />
                  <span>Organizational Hierarchy</span>
                </Link>
              </li>
              <li>
                <Link to="/team" className="hover:text-earth-300 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-forest-500" />
                  <span>Our Team & Volunteers</span>
                </Link>
              </li>
              <li>
                <Link to="/impact" className="hover:text-earth-300 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-forest-500" />
                  <span>Measurable Impact</span>
                </Link>
              </li>
              <li>
                <Link to="/stories" className="hover:text-earth-300 transition-colors flex items-center gap-1.5 font-medium text-emerald-400">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Stories of Impact</span>
                </Link>
              </li>
              <li>
                <Link
                  to={isAdmin ? "/admin/dashboard" : "/admin/login"}
                  className="hover:text-earth-300 transition-colors flex items-center gap-1.5 text-forest-300 font-medium"
                >
                  {isAdmin ? (
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span>{isAdmin ? 'Admin Dashboard' : 'Staff & Admin Portal'}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Core Program Areas */}
          <div>
            <h4 className="text-sm font-bold text-warm-50 uppercase tracking-wider mb-4 border-b border-forest-800 pb-2">
              Programs
            </h4>
            <ul className="space-y-2.5 text-sm text-forest-200">
              <li>
                <Link to="/programs/case-management" className="hover:text-earth-300 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-forest-500" />
                  <span>Case Management</span>
                </Link>
              </li>
              <li>
                <Link to="/programs/psychosocial-support" className="hover:text-earth-300 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-forest-500" />
                  <span>Psychosocial Support</span>
                </Link>
              </li>
              <li>
                <Link to="/programs/advocacy-sensitization" className="hover:text-earth-300 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-forest-500" />
                  <span>Advocacy & Sensitization</span>
                </Link>
              </li>
              <li>
                <Link to="/programs/systems-strengthening" className="hover:text-earth-300 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-forest-500" />
                  <span>Systems Strengthening</span>
                </Link>
              </li>
              <li>
                <Link to="/programs/meal" className="hover:text-earth-300 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-forest-500" />
                  <span>MEAL & Accountability</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Official Contact & Secretariat */}
          <div>
            <h4 className="text-sm font-bold text-warm-50 uppercase tracking-wider mb-4 border-b border-forest-800 pb-2">
              Contact MSC
            </h4>
            <ul className="space-y-3 text-sm text-forest-200">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-earth-400 mt-1 flex-shrink-0" />
                <span>
                  {MSC_ORGANIZATION.postalAddress}<br />
                  {MSC_ORGANIZATION.county}, {MSC_ORGANIZATION.country}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-earth-400 mt-1 flex-shrink-0" />
                <a
                  href={`mailto:${MSC_ORGANIZATION.email}`}
                  className="hover:text-earth-300 underline underline-offset-2 break-all"
                >
                  {MSC_ORGANIZATION.email}
                </a>
              </li>
              {MSC_ORGANIZATION.phone && (
                <li className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-earth-400 mt-1 flex-shrink-0" />
                  <a
                    href={`tel:${MSC_ORGANIZATION.phone.replace(/[^0-9+]/g, '')}`}
                    className="hover:text-earth-300 underline underline-offset-2"
                  >
                    {MSC_ORGANIZATION.phone}
                  </a>
                </li>
              )}
            </ul>

            <div className="mt-6 pt-4 border-t border-forest-800/80">
              <Link
                to="/volunteer"
                className="text-xs text-earth-300 hover:text-earth-200 font-semibold block mb-2"
              >
                &rarr; Join 40 Ward Volunteers
              </Link>
              <Link
                to="/partner"
                className="text-xs text-earth-300 hover:text-earth-200 font-semibold block"
              >
                &rarr; Institutional Partnerships
              </Link>
            </div>
          </div>
        </div>

        {/* Legal & Compliance Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-forest-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-forest-400">
          <p>
            &copy; {currentYear} {MSC_ORGANIZATION.name}. All rights reserved. Registered community-based organization in Kenya.
          </p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link to="/privacy" className="hover:text-forest-200 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-forest-200 transition-colors">
              Terms of Use
            </Link>
            <Link to="/contact" className="hover:text-forest-200 transition-colors">
              Contact Desk
            </Link>
            <Link
              to={isAdmin ? "/admin/dashboard" : "/admin/login"}
              className="hover:text-forest-200 transition-colors flex items-center gap-1 text-forest-300 font-medium"
            >
              {isAdmin ? (
                <Shield className="w-3 h-3 text-emerald-400" />
              ) : (
                <Lock className="w-3 h-3 text-emerald-400" />
              )}
              <span>{isAdmin ? 'Admin Dashboard' : 'Admin Sign In'}</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
