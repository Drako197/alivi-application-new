import React, { useState } from 'react'
import Icon from './Icon'

interface FooterProps {
  className?: string
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const currentYear = new Date().getFullYear()
  const appVersion = '1.0.0' // This could be dynamically loaded from package.json

  const handleLinkClick = (url: string) => {
    // For now, we'll just log the click. In a real app, these would navigate to actual pages
    console.log(`Navigating to: ${url}`)
  }

  return (
    <footer className={`app-footer bg-gray-900 dark:bg-gray-950 text-white ${className}`}>
      {/* Main Footer Content */}
      <div className="footer-main max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="footer-content grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Information */}
          <div className="footer-section footer-company">
            <div className="footer-section-header mb-4">
              <h3 className="footer-section-title text-lg font-semibold text-white mb-2">
                Alivi Health
              </h3>
              <p className="footer-section-description text-gray-300 text-sm">
                Medical Intelligence & Learning Assistant for Healthcare Professionals
              </p>
            </div>
            
            <div className="footer-contact-info space-y-2">
              <div className="footer-contact-item flex items-center space-x-2">
                <Icon name="mail" size={16} className="text-blue-400" />
                <span className="footer-contact-text text-sm text-gray-300">
                  support@alivihealth.com
                </span>
              </div>
              <div className="footer-contact-item flex items-center space-x-2">
                <Icon name="phone" size={16} className="text-blue-400" />
                <span className="footer-contact-text text-sm text-gray-300">
                  1-800-ALIVI-01
                </span>
              </div>
              <div className="footer-contact-item flex items-center space-x-2">
                <Icon name="map-pin" size={16} className="text-blue-400" />
                <span className="footer-contact-text text-sm text-gray-300">
                  Healthcare Technology Solutions
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section footer-links">
            <h4 className="footer-section-title text-lg font-semibold text-white mb-4">
              Quick Links
            </h4>
            <ul className="footer-links-list space-y-2">
              <li>
                <button 
                  onClick={() => handleLinkClick('/reports')}
                  className="footer-link text-sm text-gray-300 hover:text-blue-400 transition-colors"
                >
                  Reports & Analytics
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/analytics')}
                  className="footer-link text-sm text-gray-300 hover:text-blue-400 transition-colors"
                >
                  Strategic Analytics
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/hedis')}
                  className="footer-link text-sm text-gray-300 hover:text-blue-400 transition-colors"
                >
                  HEDIS Management
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/pic')}
                  className="footer-link text-sm text-gray-300 hover:text-blue-400 transition-colors"
                >
                  PIC Actions
                </button>
              </li>
            </ul>
          </div>

          {/* Support & Resources */}
          <div className="footer-section footer-support">
            <h4 className="footer-section-title text-lg font-semibold text-white mb-4">
              Support & Resources
            </h4>
            <ul className="footer-links-list space-y-2">
              <li>
                <button 
                  onClick={() => handleLinkClick('/help')}
                  className="footer-link text-sm text-gray-300 hover:text-blue-400 transition-colors"
                >
                  Help Center
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/documentation')}
                  className="footer-link text-sm text-gray-300 hover:text-blue-400 transition-colors"
                >
                  User Documentation
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/training')}
                  className="footer-link text-sm text-gray-300 hover:text-blue-400 transition-colors"
                >
                  Training Resources
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/status')}
                  className="footer-link text-sm text-gray-300 hover:text-blue-400 transition-colors"
                >
                  System Status
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/contact')}
                  className="footer-link text-sm text-gray-300 hover:text-blue-400 transition-colors"
                >
                  Contact Support
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div className="footer-section footer-legal">
            <h4 className="footer-section-title text-lg font-semibold text-white mb-4">
              Legal & Compliance
            </h4>
            <ul className="footer-links-list space-y-2">
              <li>
                <button 
                  onClick={() => handleLinkClick('/privacy')}
                  className="footer-link text-sm text-gray-300 hover:text-blue-400 transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/terms')}
                  className="footer-link text-sm text-gray-300 hover:text-blue-400 transition-colors"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/hipaa')}
                  className="footer-link text-sm text-gray-300 hover:text-blue-400 transition-colors"
                >
                  HIPAA Compliance
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/security')}
                  className="footer-link text-sm text-gray-300 hover:text-blue-400 transition-colors"
                >
                  Data Security
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('/cookies')}
                  className="footer-link text-sm text-gray-300 hover:text-blue-400 transition-colors"
                >
                  Cookie Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Mobile Expandable Section */}
        <div className="footer-mobile-expandable md:hidden mt-6">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="footer-mobile-toggle w-full flex items-center justify-between py-3 px-4 bg-gray-800 dark:bg-gray-900 rounded-lg"
          >
            <span className="footer-mobile-toggle-text text-sm font-medium text-white">
              More Information
            </span>
            <Icon 
              name={isExpanded ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              className="text-gray-400" 
            />
          </button>
          
          {isExpanded && (
            <div className="footer-mobile-content mt-4 space-y-4">
              <div className="footer-mobile-section">
                <h5 className="footer-mobile-section-title text-sm font-semibold text-white mb-2">
                  Support
                </h5>
                <div className="footer-mobile-links space-y-1">
                  <button className="footer-mobile-link block text-xs text-gray-300 hover:text-blue-400 transition-colors">
                    Help Center
                  </button>
                  <button className="footer-mobile-link block text-xs text-gray-300 hover:text-blue-400 transition-colors">
                    Contact Support
                  </button>
                  <button className="footer-mobile-link block text-xs text-gray-300 hover:text-blue-400 transition-colors">
                    System Status
                  </button>
                </div>
              </div>
              
              <div className="footer-mobile-section">
                <h5 className="footer-mobile-section-title text-sm font-semibold text-white mb-2">
                  Legal
                </h5>
                <div className="footer-mobile-links space-y-1">
                  <button className="footer-mobile-link block text-xs text-gray-300 hover:text-blue-400 transition-colors">
                    Privacy Policy
                  </button>
                  <button className="footer-mobile-link block text-xs text-gray-300 hover:text-blue-400 transition-colors">
                    Terms of Service
                  </button>
                  <button className="footer-mobile-link block text-xs text-gray-300 hover:text-blue-400 transition-colors">
                    HIPAA Compliance
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom border-t border-gray-800 dark:border-gray-700">
        <div className="footer-bottom-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="footer-bottom-main flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            
            {/* Copyright & Version */}
            <div className="footer-copyright-section">
              <p className="footer-copyright text-sm text-gray-400">
                © {currentYear} Alivi Health. All rights reserved.
              </p>
              <p className="footer-version text-xs text-gray-500 mt-1">
                Version {appVersion} • Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            {/* Compliance Badges */}
            <div className="footer-compliance-badges flex items-center space-x-4">
              <div className="footer-compliance-badge flex items-center space-x-2">
                <Icon name="shield-check" size={16} className="text-green-400" />
                <span className="footer-compliance-text text-xs text-gray-400">
                  HIPAA Compliant
                </span>
              </div>
              <div className="footer-compliance-badge flex items-center space-x-2">
                <Icon name="lock" size={16} className="text-blue-400" />
                <span className="footer-compliance-text text-xs text-gray-400">
                  SOC 2 Type II
                </span>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="footer-social-links flex items-center space-x-4">
              <button 
                onClick={() => handleLinkClick('https://linkedin.com/company/alivi-health')}
                className="footer-social-link p-2 bg-gray-800 dark:bg-gray-900 rounded-lg hover:bg-gray-700 transition-colors"
                aria-label="LinkedIn"
              >
                <Icon name="linkedin" size={16} className="text-gray-400 hover:text-blue-400" />
              </button>
              <button 
                onClick={() => handleLinkClick('https://twitter.com/alivihealth')}
                className="footer-social-link p-2 bg-gray-800 dark:bg-gray-900 rounded-lg hover:bg-gray-700 transition-colors"
                aria-label="Twitter"
              >
                <Icon name="twitter" size={16} className="text-gray-400 hover:text-blue-400" />
              </button>
              <button 
                onClick={() => handleLinkClick('https://github.com/alivi-health')}
                className="footer-social-link p-2 bg-gray-800 dark:bg-gray-900 rounded-lg hover:bg-gray-700 transition-colors"
                aria-label="GitHub"
              >
                <Icon name="github" size={16} className="text-gray-400 hover:text-blue-400" />
              </button>
            </div>
          </div>

          {/* Additional Legal Notice */}
          <div className="footer-legal-notice mt-4 pt-4 border-t border-gray-800 dark:border-gray-700">
            <p className="footer-legal-text text-xs text-gray-500 text-center">
              This application is designed for healthcare professionals and contains protected health information. 
              All data is encrypted and stored in compliance with HIPAA regulations. 
              Unauthorized access is prohibited and may result in legal action.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
