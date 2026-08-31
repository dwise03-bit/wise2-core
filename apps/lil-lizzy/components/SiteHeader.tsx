'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';
import { Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { BrandWordmark } from '@/components/ui';
import { LIZZY_NAV } from '@/lib/brand-tokens';
import { PRODUCTS } from '@/lib/catalog';
import { useCart } from '@/contexts/CartContext';

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, notice } = useCart();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return PRODUCTS.filter((item) => `${item.name} ${item.blurb}`.toLowerCase().includes(q)).slice(0, 5);
  }, [query]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    setSearchOpen(false);
    setOpen(false);
    router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-lizzy-pink/20 bg-lizzy-ink/80 pt-[var(--safe-top)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="shrink-0" onClick={() => setOpen(false)}>
          <BrandWordmark size="sm" />
        </Link>
        <nav className="hidden flex-1 items-center justify-center gap-4 lg:flex">
          {LIZZY_NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[11px] font-bold uppercase tracking-[0.16em] transition ${
                  active ? 'text-lizzy-yellow' : 'text-white/70 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white/80 hover:text-lizzy-cyan"
          >
            <Search className="h-4 w-4" />
          </button>
          <Link
            href="/parents"
            aria-label="Parent account"
            className="hidden h-10 w-10 place-items-center rounded-full border border-white/10 text-white/80 hover:text-lizzy-cyan sm:grid"
          >
            <User className="h-4 w-4" />
          </Link>
          <Link
            href="/cart"
            aria-label="Shopping bag"
            className="relative grid h-10 w-10 place-items-center rounded-full border border-lizzy-pink/40 text-lizzy-pink"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-lizzy-pink px-1 text-[10px] font-bold text-white">
              {cartCount}
            </span>
          </Link>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {searchOpen ? (
        <div className="border-t border-white/10 bg-lizzy-deep/95 px-4 py-3 sm:px-6">
          <form onSubmit={submitSearch} className="mx-auto flex max-w-6xl gap-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tags, accessories, packs..."
              className="w-full rounded-full border border-lizzy-cyan/30 bg-lizzy-ink px-4 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-lizzy-cyan"
            />
            <button type="submit" className="rounded-full bg-lizzy-cyan px-4 py-2 text-xs font-bold uppercase tracking-wider text-lizzy-ink">
              Go
            </button>
          </form>
          {results.length > 0 ? (
            <ul className="mx-auto mt-3 max-w-6xl space-y-1">
              {results.map((item) => (
                <li key={item.id}>
                  <Link
                    href="/shop"
                    onClick={() => setSearchOpen(false)}
                    className="block rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/5"
                  >
                    {item.name} · ${item.price}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      {open ? (
        <nav className="grid gap-1 border-t border-white/10 bg-lizzy-deep px-4 py-3 lg:hidden">
          {LIZZY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-sm font-bold uppercase tracking-wider text-white/80 hover:bg-white/5"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
      {notice ? (
        <p className="bg-lizzy-pink px-4 py-1.5 text-center text-xs font-bold uppercase tracking-wider text-white">{notice}</p>
      ) : null}
    </header>
  );
}
