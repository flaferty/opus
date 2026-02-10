'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const signup = searchParams.get('signup');
    if (signup === 'true') {
      setIsSignUp(true);
    }
  }, [searchParams]);

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
    <main className="min-h-screen flex items-center justify-center bg-slate-950 p-3 sm:p-4">
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-20">
        <Logo />
      </div>
      <Card className="w-full max-w-md bg-slate-800 border-slate-700 relative z-10">
        <CardHeader className="space-y-1 p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-center text-white">
            {isSignUp ? 'Create account' : 'Welcome back'}
          </CardTitle>
          <CardDescription className="text-center text-xs sm:text-sm text-gray-400">
            {isSignUp
              ? 'Enter your email to create account'
              : 'Enter your credentials'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleAuth} className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="email" className="text-xs sm:text-sm text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="text-sm h-9 sm:h-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs sm:text-sm text-gray-300">Password</Label>
                {!isSignUp && (
                  <Link href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
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
                className="text-sm h-9 sm:h-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
            </div>

            {error && (
              <div className="p-2.5 sm:p-3 text-xs sm:text-sm text-red-400 bg-slate-900 border border-red-800 rounded-md">
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
                className="text-blue-400 hover:text-blue-300 transition-colors"
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
    </main>
  );
}
