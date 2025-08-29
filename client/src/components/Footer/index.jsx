import React from "react";
import { FaInstagram, FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold mb-3 text-indigo-400">FindMySpace</h2>
            <p className="text-gray-300 max-w-xs mx-auto md:mx-0">
              Helping you find the perfect roommate, hassle-free.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-300 hover:text-white transition-colors">Home</a></li>

              <li><a href="/profile" className="text-gray-300 hover:text-white transition-colors">My Profile</a></li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="text-center md:text-right">
            <h3 className="text-lg font-semibold mb-4 text-white">Connect With Us</h3>
            <div className="flex justify-center md:justify-end space-x-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram className="w-6 h-6" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-gray-700 text-center">
          <p className="text-gray-400 text-sm">
            {new Date().getFullYear()} FindMySpace.Sanket.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
