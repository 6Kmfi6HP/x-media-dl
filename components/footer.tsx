'use client';

import { Github, Twitter } from 'lucide-react';
import { Button } from './ui/button';

export function Footer() {
  return (
    <footer className="w-full border-t bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold mb-4">About X Video Downloader</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              A powerful tool for downloading videos and photos from X (formerly Twitter). 
              Built with modern web technologies to provide the best user experience.
            </p>
            <div className="flex space-x-4">
              <Button variant="outline" size="icon" onClick={() => window.open('https://github.com/yourusername/x-video-dl', '_blank')}>
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => window.open('https://twitter.com/yourusername', '_blank')}>
                <Twitter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Features Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>✓ High Quality Video Download</li>
              <li>✓ Multiple Video Support</li>
              <li>✓ Photo Download</li>
              <li>✓ Fast & Reliable</li>
              <li>✓ No Registration Required</li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
              <li>DMCA</li>
              <li>Contact Us</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} X Video Downloader. All rights reserved.</p>
          <p className="mt-2">
            Not affiliated with X Corp. This tool is for educational purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}
