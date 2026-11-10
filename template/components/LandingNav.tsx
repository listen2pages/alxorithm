'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CreditCard, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import LandingMobileMenu from '@/app/LandingMobileMenu';
import LanguageSelector from '@/components/LanguageSelector';
import RegionalSettings from '@/components/RegionalSettings';

type Profile = {
  full_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
};

/**
 * Shared public & marketing navigation bar.
 *
 * Shown on all public marketing and legal routes (`/`, `/demo`, `/login`, `/cennik`,
 * `/polityka-prywatnosci`, `/regulamin`) for both visitors and signed-in accounts so
 * non-subscribers on `/cennik` can still switch languages, manage billing, or sign out.
 */
export default function LandingNav() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setAuthLoading(false);
      return;
    }
    const supabase = createClient();

    async function loadProfile() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError && authError.message !== 'Auth session missing!') throw authError;

        if (user) {
          const { data } = await supabase
            .from('users')
            .select('full_name, email, avatar_url')
            .eq('id', user.id)
            .single();
          setProfile(data ?? { email: user.email });
        } else {
          setProfile(null);
        }
      } catch {
        setProfile(null);
      } finally {
        setAuthLoading(false);
      }
    }

    void loadProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        void loadProfile();
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  useEffect(() => {
    setDropdownOpen(false);
  }, [pathname]);

  if (pathname?.startsWith('/home')) return null;

  const publicRoutes = ['/', '/demo', '/login', '/cennik', '/polityka-prywatnosci', '/regulamin'];
  const isPublicRoute = publicRoutes.includes(pathname ?? '');

  if (!isPublicRoute) {
    return (
      <div className="locale-utility-nav">
        <LanguageSelector />
        <RegionalSettings />
      </div>
    );
  }

  const isLoggedIn = !authLoading && !!profile;
  const isHomepage = pathname === '/';
  const initials = profile?.full_name?.[0] || profile?.email?.[0] || '?';

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  return (
    <header className="landing-nav">
      <Link
        href="/"
        className="landing-brand"
        aria-label="Jedzenie Warszawa — strona główna"
      >
        <Image
          src="/logo.png"
          alt="Logo jedzenie warszawa"
          width={40}
          height={40}
          priority
        />
        <span>
          jedzenie warszawa
          <span className="landing-brand-sub">TWÓJ LOKAL. TWOJE DANE.</span>
        </span>
      </Link>

      <nav aria-label="Nawigacja główna" className="landing-desktop-nav">
        {isHomepage && (
          <>
            <Link href="#funkcje">Możliwości</Link>
            <Link href="#jak-to-dziala">Jak to działa</Link>
          </>
        )}
        <Link href="/demo">Demo</Link>
        <Link href="/cennik">Oferta</Link>
      </nav>

      <div className="landing-nav-actions">
        <LanguageSelector />
        <RegionalSettings />
        {isLoggedIn ? (
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(v => !v)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: '1px solid #e4ddd1',
                borderRadius: '999px',
                padding: '5px 12px 5px 5px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--ink)',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#19613e')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#e4ddd1')}
            >
              {profile?.avatar_url ? (
                <div
                  style={{
                    position: 'relative',
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Avatar'}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: '#19613e',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {initials.toUpperCase()}
                </div>
              )}
              <span
                style={{
                  maxWidth: 120,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {profile?.full_name || profile?.email?.split('@')[0] || 'Konto'}
              </span>
              <ChevronDown
                size={14}
                style={{
                  transition: 'transform 0.2s',
                  transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  color: '#756b60',
                }}
              />
            </button>

            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 10px)',
                  width: 220,
                  background: '#fffdf9',
                  border: '1px solid #e4ddd1',
                  borderRadius: 14,
                  boxShadow: '0 12px 40px rgba(63,39,22,0.12)',
                  overflow: 'hidden',
                  zIndex: 200,
                }}
              >
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0ece3' }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      fontWeight: 800,
                      color: '#3f2716',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {profile?.full_name || 'Moje konto'}
                  </p>
                  <p
                    style={{
                      margin: '3px 0 0',
                      fontSize: 11,
                      color: '#756b60',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {profile?.email}
                  </p>
                </div>

                <Link
                  href="/home"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 16px',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#3f2716',
                    textDecoration: 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f0ece3')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <LayoutDashboard size={15} style={{ color: '#19613e', flexShrink: 0 }} />
                  Panel restauracji
                </Link>

                <a
                  href="/api/stripe/portal"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 16px',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#3f2716',
                    textDecoration: 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f0ece3')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <CreditCard size={15} style={{ color: '#19613e', flexShrink: 0 }} />
                  Subskrypcja i płatności
                </a>

                <div style={{ height: 1, background: '#f0ece3', margin: '0 16px' }} />

                <button
                  onClick={handleSignOut}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#c0392b',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'background 0.15s',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut size={15} style={{ flexShrink: 0 }} />
                  Wyloguj się
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link href="/login" className="landing-login">
              Zaloguj się
            </Link>
            <Link href="/cennik" className="landing-button">
              Wybierz plan <ArrowRight size={16} />
            </Link>
          </>
        )}
      </div>

      <LandingMobileMenu />
    </header>
  );
}
