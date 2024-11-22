'use client';

import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from './ui/button';

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="w-full">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            X Video Downloader
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="ml-4"
          >
            <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
        
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
          Download high-quality videos and photos from X (formerly Twitter) with ease. 
          Just paste the tweet URL and we&apos;ll handle the rest.
        </p>

        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <span className="mr-2">✓</span>
            <span>High Quality</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">✓</span>
            <span>Multiple Videos</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">✓</span>
            <span>No Watermark</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">✓</span>
            <span>Free Forever</span>
          </div>
        </div>
      </div>
    </header>
  );
}