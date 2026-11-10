'use client';

import { createClient } from '@/utils/supabase/client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useState } from 'react';
import { AlertCircle } from 'lucide-react';

function LoginContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const [loginError, setLoginError] = useState('');

  const handleGoogleLogin = async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) { setLoginError('Add the Supabase credentials to enable sign-in.'); return; }
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // This tells Supabase where to send the user after a successful login
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    });
    if (error) setLoginError('Nie udało się rozpocząć logowania. Spróbuj ponownie.');
  };

  return (
    <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-brand-brown/10 overflow-hidden border-2 border-brand-green/10 transition-all">
      <div className="p-8 sm:p-10">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-brand-green mx-auto mb-5 flex items-center justify-center shadow-lg shadow-brand-green/30">
            <svg fill="none" height="24" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="m12 14 4-4"></path>
              <path d="M3.34 19a10 10 0 1 1 17.32 0"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-[var(--font-display)] font-bold tracking-tight text-brand-dark-brown mb-2">
            Witaj ponownie
          </h1>
          <p className="text-brand-brown/60 text-sm">
            Zaloguj się na swoje konto lub utwórz nowe.
          </p>
        </div>

        {(message || loginError) && (
          <div className="p-4 mb-6 rounded-2xl flex items-start gap-3 text-sm font-medium bg-red-50 text-red-600 border border-red-200">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{loginError || message}</p>
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 border-2 border-brand-brown/10 bg-white hover:bg-brand-beige text-brand-dark-brown rounded-2xl font-bold shadow-sm transition-all hover:border-brand-green/20 hover:shadow-md"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
            <path d="M1 1h22v22H1z" fill="none" />
          </svg>
          Kontynuuj przez Google
        </button>


      </div>
      <div className="px-8 py-5 bg-brand-dark-beige/50 border-t-2 border-brand-green/5 text-center">
        <p className="text-[11px] text-brand-brown/50">
          Logując się, akceptujesz nasz <Link href="/regulamin" className="underline hover:text-brand-green">Regulamin</Link> oraz <Link href="/polityka-prywatnosci" className="underline hover:text-brand-green">Politykę Prywatności</Link>.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-brand-beige overflow-hidden">
      {/* Background decoration elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-brand-green/15 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-brand-yellow/15 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[60%] bg-brand-blue/10 blur-[120px] rounded-full" />
      </div>

      {/* Dot pattern overlay */}
      <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />

      <div className="relative z-10 w-full flex justify-center">
        <Suspense fallback={<div className="w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin"></div>}>
          <LoginContent />
        </Suspense>
      </div>
    </div>
  );
}
