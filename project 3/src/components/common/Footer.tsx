import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-namuh-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <p className="text-gray-300 text-sm leading-relaxed">
              Fairness, Humanity and Transparency in recruitment. 
              Connecting talent with opportunities through AI-powered solutions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-namuh-teal transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-namuh-teal transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-namuh-teal transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-namuh-teal transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* For Applicants */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Für Bewerbende</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/jobs" className="text-gray-300 hover:text-namuh-teal transition-colors">
                  Stellensuche
                </Link>
              </li>
              <li>
                <Link to="/ai-hub" className="text-gray-300 hover:text-namuh-teal transition-colors">
                  KI-Tools
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-gray-300 hover:text-namuh-teal transition-colors">
                  Community
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-300 hover:text-namuh-teal transition-colors">
                  Preise
                </Link>
              </li>
            </ul>
          </div>

          {/* For Recruiters */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Für Recruiter</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/recruiter" className="text-gray-300 hover:text-namuh-teal transition-colors">
                  Stellen ausschreiben
                </Link>
              </li>
              <li>
                <Link to="/recruiter/talent-pool" className="text-gray-300 hover:text-namuh-teal transition-colors">
                  Talent Pool
                </Link>
              </li>
              <li>
                <Link to="/recruiter/analytics" className="text-gray-300 hover:text-namuh-teal transition-colors">
                  Analytics
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-300 hover:text-namuh-teal transition-colors">
                  Enterprise
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Kontakt & Support</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-namuh-teal" />
                <span className="text-gray-300">hello@namuh.de</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-namuh-teal" />
                <span className="text-gray-300">+49 (0) 123 456 789</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-namuh-teal mt-0.5" />
                <span className="text-gray-300">
                  Musterstraße 123<br />
                  10115 Berlin, Deutschland
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-300">
              © 2024 All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm">
              <Link to="/datenschutz" className="text-gray-300 hover:text-namuh-teal transition-colors">
                Datenschutz
              </Link>
              <Link to="/impressum" className="text-gray-300 hover:text-namuh-teal transition-colors">
                Impressum
              </Link>
              <Link to="/cookie-richtlinie" className="text-gray-300 hover:text-namuh-teal transition-colors">
                Cookie-Richtlinie
              </Link>
              <Link to="/kontakt" className="text-gray-300 hover:text-namuh-teal transition-colors">
                Kontakt
              </Link>
              <Link to="/mediadaten" className="text-gray-300 hover:text-namuh-teal transition-colors">
                Mediadaten
              </Link>
            </div>
          </div>
        </div>
        
        {/* Logo at the very bottom */}
        <div className="flex justify-center mt-8">
          <iframe 
            src="/Logo-min.html" 
            className="h-[230px] w-[230px] border-0" 
            title="Logo"
            style={{ background: 'transparent', filter: 'brightness(0) invert(1)' }}
          />
        </div>
      </div>
    </footer>
  );
};