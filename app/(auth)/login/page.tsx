'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (error) throw error;
        
        alert('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-3 sm:p-4 transition-colors">
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-20">
        <Logo />
      </div>
      <Card className="w-full max-w-md dark:bg-slate-900 dark:border-slate-800">
        <CardHeader className="space-y-1 p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-center dark:text-white">
            {isSignUp ? 'Create account' : 'Welcome back'}
          </CardTitle>
          <CardDescription className="text-center text-xs sm:text-sm dark:text-gray-400">
            {isSignUp
              ? 'Enter your email to create account'
              : 'Enter your credentials'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleAuth} className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="email" className="text-xs sm:text-sm dark:text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="text-sm h-9 sm:h-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-gray-500"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs sm:text-sm dark:text-gray-300">Password</Label>
                {!isSignUp && (
                  <Link href="/forgot-password" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    Forgot?
                  </Link>
                )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
                className="text-sm h-9 sm:h-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-gray-500"
              />
            </div>

            {error && (
              <div className="p-2.5 sm:p-3 text-xs sm:text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-9 sm:h-10 text-sm sm:text-base"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>

            <div className="text-center text-xs sm:text-sm">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-600 dark:text-blue-400 hover:underline"
                disabled={isLoading}
              >
                {isSignUp
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
