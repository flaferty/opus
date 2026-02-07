import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';

export default function StartPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 sm:p-6 relative">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gray-900 to-transparent pointer-events-none" />
      
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-20">
        <Logo />
      </div>

      <div className="text-center max-w-2xl mx-auto w-full relative z-10 mt-12 sm:mt-0">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
            OPUS
          </h1>``
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
            Job Application Tracking System
          </h2>
          <div className="w-16 h-1 bg-white mx-auto mb-4" />
          <p className="text-sm sm:text-base text-gray-300">
            Organize your job search with an elegant Kanban board
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center mb-16 sm:mb-20">
          <Link href="/login">
            <Button className="h-8 sm:h-9 px-6 sm:px-8 text-xs sm:text-sm font-medium bg-white text-black hover:bg-gray-200 transition-colors">
              Sign In
            </Button>
          </Link>
          <Link href="/login">
            <Button 
              className="h-8 sm:h-9 px-6 sm:px-8 text-xs sm:text-sm font-medium bg-gray-800 text-white hover:bg-gray-700 transition-colors border border-gray-600"
            >
              Sign Up
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 md:gap-6">
          <div className="p-6 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors hover:bg-gray-950">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3">Simple & Intuitive</h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Clean interface designed to get out of your way. Track applications in seconds.
            </p>
          </div>

          <div className="p-6 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors hover:bg-gray-950">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3">Stay Organized</h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Visual Kanban board keeps your pipeline clear. See progress at a glance.
            </p>
          </div>

          <div className="p-6 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors hover:bg-gray-950">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3">Always in Sync</h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Cloud-based. Access your data from any device, anytime you need it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
