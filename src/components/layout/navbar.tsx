'use client';

import { Gavel } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);

    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    router.push('/');
    window.dispatchEvent(new Event("storage"));
  };

  const links = [
    { label: 'Home', path: '/' },
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Gavel className="h-6 w-6 text-primary" />
          <span className="font-bold">AI Debate Judge</span>
        </Link>
        <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
          {links.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={cn(
                'transition-colors hover:text-primary',
                pathname === link.path
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center space-x-4">
          {token ? (
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          ) : (
            <>
              <Button asChild variant="outline">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
