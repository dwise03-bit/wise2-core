'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="bg-navy min-h-screen text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-cyan/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative border-b border-cyan/30 bg-navy-dark/70 backdrop-blur-md sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer hover:text-cyan transition">
              <div className="text-3xl animate-bounce">✒️</div>
              <div className="font-script text-2xl font-bold animate-glow">Lexi's Inks</div>
            </div>
            <div className="flex gap-8 items-center">
              <Link href="#" className="text-sm hover:text-cyan transition hover:glow">HOME</Link>
              <Link href="#" className="text-sm hover:text-cyan transition">SHOP</Link>
              <Link href="/custom-order" className="text-sm hover:text-cyan transition">CUSTOM ORDERS</Link>
              <Link href="#about" className="text-sm hover:text-cyan transition">ABOUT</Link>
              <Link href="#gallery" className="text-sm hover:text-cyan transition">GALLERY</Link>
              <Link href="#" className="text-sm hover:text-cyan transition">CONTACT</Link>
              <div className="text-lg animate-pulse">📷 🎵</div>
              <Link href="/custom-order" className="px-4 py-2 bg-gradient-to-r from-blue to-cyan hover:shadow-lg hover:shadow-cyan/50 rounded-lg transition font-bold text-sm transform hover:scale-110 shadow-md">
                SHOP NOW 🛍️
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-32 px-4 overflow-hidden bg-gradient-to-b from-cyan/30 via-navy to-navy-dark">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue/20 via-transparent to-cyan/10" />
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto z-10">
          <div className="grid grid-cols-2 gap-16 items-center">
            {/* Left Side */}
            <div>
              <div className="font-script text-9xl font-bold mb-2 text-cyan leading-none animate-glow drop-shadow-lg">Lexi's</div>
              <div className="font-script text-9xl font-bold mb-12 text-cyan leading-none animate-glow drop-shadow-lg" style={{ animationDelay: '0.5s' }}>Inks</div>

              <p className="text-5xl font-bold mb-3 text-white drop-shadow-md">WRITE IT.</p>
              <p className="text-5xl font-bold mb-3 text-cyan animate-glow drop-shadow-md">LOVE IT.</p>
              <p className="text-5xl font-bold mb-12 text-cyan animate-glow drop-shadow-md" style={{ animationDelay: '0.5s' }}>EXPRESS IT.</p>

              <h2 className="text-3xl font-bold mb-3 leading-tight drop-shadow-md">
                PREMIUM HAND DECORATED PENS
              </h2>
              <p className="text-2xl text-cyan italic mb-8 drop-shadow-md">that write your story.</p>

              <p className="text-lg text-white mb-12 leading-relaxed drop-shadow-sm max-w-xl">
                Every pen is carefully handcrafted with premium beads, rhinestones, and love to bring beauty, function, and meaning to every word you write.
              </p>

              <div className="flex gap-6">
                <Link href="#gallery" className="px-8 py-4 bg-gradient-to-r from-navy to-navy-dark border-2 border-white hover:border-cyan hover:bg-white hover:text-navy hover:shadow-xl hover:shadow-white/20 rounded-lg font-bold transition transform hover:scale-110 shadow-lg">
                  🛍️ SHOP PENS
                </Link>
                <Link href="/custom-order" className="px-8 py-4 bg-gradient-to-r from-navy to-navy-dark border-2 border-cyan hover:border-white hover:bg-cyan hover:text-navy hover:shadow-xl hover:shadow-cyan/50 rounded-lg font-bold transition transform hover:scale-110 shadow-lg">
                  ✏️ CUSTOM ORDERS
                </Link>
              </div>
            </div>

            {/* Right Side - Premium Pens Display */}
            <div className="relative h-96 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan/20 via-transparent to-blue/20 rounded-3xl blur-2xl" />
              <div className="grid grid-cols-2 gap-6 h-full w-full relative z-10">
                <div className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-2xl hover:shadow-cyan/50 transition-all transform hover:scale-110">
                  <img src="https://images.unsplash.com/photo-1578926314433-8eef86b81bc2?w=300&h=400&fit=crop" alt="Premium Pink Pen" className="w-full h-full object-cover group-hover:scale-125 transition duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-cyan/20 group-hover:bg-cyan/40 transition" />
                  <div className="absolute bottom-4 left-4 text-sm font-bold drop-shadow-lg">PREMIUM</div>
                </div>
                <div className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-2xl hover:shadow-cyan/50 transition-all transform hover:scale-110" style={{ marginTop: '30px' }}>
                  <img src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&h=400&fit=crop" alt="Deluxe Gold Pen" className="w-full h-full object-cover group-hover:scale-125 transition duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-cyan/20 group-hover:bg-cyan/40 transition" />
                  <div className="absolute bottom-4 left-4 text-sm font-bold drop-shadow-lg">DELUXE</div>
                </div>
                <div className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-2xl hover:shadow-cyan/50 transition-all transform hover:scale-110" style={{ marginTop: '30px' }}>
                  <img src="https://images.unsplash.com/photo-1578926314433-8eef86b81bc2?w=300&h=400&fit=crop&q=80" alt="Luxe Blue Pen" className="w-full h-full object-cover group-hover:scale-125 transition duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-cyan/20 group-hover:bg-cyan/40 transition" />
                  <div className="absolute bottom-4 left-4 text-sm font-bold drop-shadow-lg">LUXE</div>
                </div>
                <div className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-2xl hover:shadow-cyan/50 transition-all transform hover:scale-110">
                  <img src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&h=400&fit=crop&q=85" alt="Custom Red Pen" className="w-full h-full object-cover group-hover:scale-125 transition duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-cyan/20 group-hover:bg-cyan/40 transition" />
                  <div className="absolute bottom-4 left-4 text-sm font-bold drop-shadow-lg">CUSTOM</div>
                </div>
              </div>
              <div className="absolute bottom-8 right-4 bg-gradient-to-br from-navy-800 to-navy-900 border-3 border-cyan rounded-full p-8 text-center shadow-2xl hover:shadow-cyan/50 transition animate-glow-box z-20">
                <div className="text-sm font-bold">HAND</div>
                <div className="text-sm font-bold">DECORATED</div>
                <div className="text-lg font-bold text-pink animate-pulse">❤️</div>
                <div className="text-sm font-bold">WITH LOVE</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Banner 1 */}
      <div className="relative bg-gradient-to-r from-navy via-cyan/30 to-navy py-8 px-4 text-center border-y border-cyan/30">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan/5 to-transparent" />
        <div className="relative text-4xl tracking-widest font-bold text-cyan drop-shadow-lg animate-pulse">✨ ❤️ ✨ ❤️ ✨ ❤️ ✨</div>
      </div>

      {/* Story Section */}
      <section id="about" className="relative py-32 px-4 bg-gradient-to-b from-navy via-navy-dark to-navy">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative max-w-6xl mx-auto z-10 grid grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-5xl font-bold mb-4 drop-shadow-md">
              Honoring the Life & Legacy of
            </h2>
            <h3 className="text-7xl font-script text-cyan mb-10 animate-glow drop-shadow-lg">Sheila</h3>

            <p className="text-2xl text-cyan font-bold mb-8 leading-relaxed drop-shadow-md">
              HER VISION. HER LOVE. OUR PURPOSE. ❤️
            </p>

            <p className="text-white mb-6 leading-relaxed text-lg drop-shadow-sm">
              Lexi's Inks was born from a mother's dream and a daughter's promise. My beautiful mom, Sheila, believed in creativity, hard work, and building something that would inspire others. Today, with every pen we create, we honor her vision and bring her dream to life.
            </p>

            <p className="text-cyan text-lg font-bold leading-relaxed drop-shadow-md">
              Sheila's vision • Lexi's hands • A legacy still growing.
            </p>
          </div>

          <div className="flex flex-col gap-8">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan/50 to-blue/50 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition animate-pulse" />
              <div className="relative w-full aspect-square bg-gradient-to-br from-navy-800 to-navy-700 rounded-2xl border-4 border-cyan/80 overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=500&fit=crop" alt="Sheila" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-br from-cyan/20 to-transparent" />
              </div>
              <div className="absolute top-4 right-4 text-8xl animate-drift">🦋</div>
              <div className="absolute top-16 left-4 text-6xl animate-twinkle">✨</div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-br from-blue via-cyan to-blue rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition" />
              <div className="relative bg-gradient-to-br from-blue-500 via-cyan to-blue-400 border-4 border-white rounded-2xl p-8 text-navy text-center shadow-2xl">
                <div className="text-6xl mb-4 animate-bounce">❤️</div>
                <h4 className="text-3xl font-bold mb-4 drop-shadow-md">Her Light Lives On</h4>
                <p className="mb-3 text-base font-semibold leading-relaxed drop-shadow-sm">
                  This business is more than a brand—it's a promise to keep her vision alive.
                </p>
                <p className="font-bold text-lg mb-4 drop-shadow-md">Every pen. Every order. Every smile.</p>
                <p className="text-sm italic drop-shadow-sm">All for you, Mom.</p>
                <div className="absolute -bottom-4 right-6 text-8xl animate-drift">🦋</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Banner 2 */}
      <div className="relative bg-gradient-to-r from-navy via-blue/30 to-navy py-8 px-4 text-center border-y border-cyan/30">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue/10 to-transparent" />
        <div className="relative text-4xl tracking-widest font-bold text-cyan drop-shadow-lg animate-pulse" style={{ animationDelay: '0.5s' }}>❤️ ✨ ❤️ ✨ ❤️ ✨ ❤️</div>
      </div>

      {/* Features Row */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-navy-dark to-navy">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan/5 via-transparent to-blue/5" />
        </div>
        <div className="relative max-w-7xl mx-auto z-10 grid grid-cols-6 gap-6">
          {[
            { icon: '💎', title: 'PREMIUM QUALITY', desc: 'High quality beads, rhinestones for beautiful finish' },
            { icon: '✏️', title: 'SMOOTH WRITING', desc: 'Black ink glides every time' },
            { icon: '🤲', title: 'COMFORT GRIP', desc: 'Designed for everyday use' },
            { icon: '🎁', title: 'PERFECT GIFT', desc: 'Great for any occasion' },
            { icon: '✨', title: 'HAND DECORATED', desc: 'Made with love and creativity' },
            { icon: '🛡️', title: 'MADE TO LAST', desc: 'Built to be used, loved, and shared' },
          ].map((feature, i) => (
            <div key={i} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-br from-cyan/40 to-blue/40 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition" />
              <div className="relative p-6 bg-gradient-to-br from-navy-800/80 to-navy-900/80 backdrop-blur-sm rounded-xl border border-cyan/30 hover:border-cyan/80 transition text-center group-hover:shadow-lg group-hover:shadow-cyan/30">
                <div className="text-5xl mb-4 group-hover:animate-bounce">{feature.icon}</div>
                <h4 className="font-bold text-sm mb-3 uppercase drop-shadow-md">{feature.title}</h4>
                <p className="text-xs text-cyan/80 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Decorative Banner 3 */}
      <div className="relative bg-gradient-to-r from-navy via-cyan/40 to-navy py-10 px-4 text-center border-y border-cyan/40">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan/15 to-transparent" />
        <div className="relative">
          <p className="text-5xl mb-4 text-cyan drop-shadow-lg animate-pulse">❤️ ❤️ ❤️</p>
          <h2 className="text-6xl font-bold mb-4 text-cyan animate-glow drop-shadow-lg">SHOP THE COLLECTION</h2>
          <p className="text-5xl text-cyan drop-shadow-lg animate-pulse" style={{ animationDelay: '0.5s' }}>❤️ ❤️ ❤️</p>
        </div>
      </div>

      {/* Shop Section */}
      <section id="gallery" className="relative py-32 px-4 bg-gradient-to-b from-navy-dark to-navy">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-cyan/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-blue/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto z-10">
          <div className="grid grid-cols-5 gap-8 items-start">
            {[
              { name: 'PREMIUM', price: '$18', img: 'https://images.unsplash.com/photo-1578926314433-8eef86b81bc2?w=200&h=250&fit=crop' },
              { name: 'DELUXE', price: '$22', img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&h=250&fit=crop' },
              { name: 'LUXE', price: '$26', img: 'https://images.unsplash.com/photo-1578926314433-8eef86b81bc2?w=200&h=250&fit=crop&q=80' },
              { name: 'CUSTOM', price: '$30+', img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&h=250&fit=crop&q=85' },
            ].map((product, i) => (
              <div key={i} className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-br from-cyan/50 to-blue/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition" />
                <div className="relative bg-gradient-to-br from-navy-800/60 to-navy-900/80 backdrop-blur-sm border-2 border-cyan/40 hover:border-cyan/90 rounded-2xl p-6 text-center transition group-hover:shadow-2xl group-hover:shadow-cyan/50 transform group-hover:scale-110">
                  <img src={product.img} alt={product.name} className="w-full h-40 object-cover rounded-lg mb-4 shadow-lg group-hover:shadow-cyan/50" />
                  <h3 className="text-2xl font-bold mb-3 drop-shadow-md">{product.name}</h3>
                  <p className="text-4xl font-bold text-cyan mb-5 drop-shadow-lg animate-glow">{product.price}</p>
                  <Link href="/custom-order" className="block py-3 px-4 bg-gradient-to-r from-navy to-navy-dark border-2 border-white hover:border-cyan hover:bg-white hover:text-navy hover:shadow-lg hover:shadow-white/30 rounded-lg transition font-bold transform hover:scale-105 drop-shadow-md">
                    SHOP NOW
                  </Link>
                </div>
              </div>
            ))}

            {/* Custom Orders CTA */}
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-br from-blue via-cyan to-blue rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition" />
              <div className="relative bg-gradient-to-br from-blue-500 via-blue-400 to-cyan border-4 border-white rounded-2xl p-8 text-navy text-center shadow-2xl transform group-hover:scale-105">
                <img src="https://images.unsplash.com/photo-1607883356885-dcb5dc8b5b6d?w=250&h=180&fit=crop" alt="Custom" className="w-full h-32 object-cover rounded-lg mb-4 shadow-lg" />
                <h3 className="text-2xl font-bold mb-4 drop-shadow-md">CUSTOM ORDERS</h3>
                <p className="font-bold text-base mb-5 drop-shadow-md">Make it yours.</p>
                <ul className="text-left text-xs mb-6 space-y-3 font-bold drop-shadow-sm">
                  <li>❤️ Choose your colors and theme</li>
                  <li>✨ Pick your topper</li>
                  <li>✏️ Add a name or word</li>
                  <li>🎁 Perfect for gifts, parties & events</li>
                </ul>
                <Link href="/custom-order" className="block py-3 px-4 bg-navy hover:bg-white hover:text-navy text-white rounded-lg font-bold transition transform hover:scale-110 drop-shadow-md">
                  START YOUR ORDER →
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-20 space-y-6">
            <p className="text-3xl text-cyan drop-shadow-lg">❤️ Every pen has personality.</p>
            <p className="font-script text-5xl text-cyan animate-glow drop-shadow-lg">Made to stand out.</p>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="relative py-24 px-4 bg-gradient-to-b from-navy to-navy-dark">
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-cyan/5 via-transparent to-blue/5" />
        <div className="relative max-w-7xl mx-auto z-10 grid grid-cols-4 gap-8">
          {[
            { icon: '👥', title: 'BULK & EVENT ORDERS', desc: 'Great for schools, businesses, teams & special events!' },
            { icon: '⏰', title: 'FAST TURNAROUND', desc: 'Most custom orders completed quickly & with care' },
            { icon: '🔒', title: 'SECURE PAYMENTS', desc: 'Safe checkout with Stripe, PayPal & more' },
            { icon: '❤️', title: 'SUPPORT SMALL', desc: 'Thank you for supporting handmade & helping dreams grow!' },
          ].map((badge, i) => (
            <div key={i} className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-br from-cyan/30 to-blue/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition" />
              <div className="relative p-8 bg-gradient-to-br from-navy-800/80 to-navy-900/80 backdrop-blur-sm rounded-xl border border-cyan/30 hover:border-cyan/80 transition text-center group-hover:shadow-xl group-hover:shadow-cyan/30">
                <div className="text-7xl mb-4 group-hover:animate-bounce">{badge.icon}</div>
                <h4 className="font-bold mb-3 text-lg uppercase drop-shadow-md">{badge.title}</h4>
                <p className="text-sm text-cyan/80 leading-relaxed drop-shadow-sm">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gradient-to-b from-navy-dark to-navy-900 border-t-2 border-cyan/30 py-20 px-4">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan/5 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto z-10">
          <div className="grid grid-cols-4 gap-12 mb-12">
            <div>
              <div className="font-script text-5xl font-bold mb-2 text-cyan animate-glow drop-shadow-lg">Lexi's</div>
              <div className="font-script text-5xl font-bold text-cyan mb-6 animate-glow drop-shadow-lg" style={{ animationDelay: '0.3s' }}>Inks</div>
              <p className="text-sm text-white/70 mb-4 drop-shadow-sm">WRITE IT. LOVE IT. EXPRESS IT. ❤️</p>
              <p className="text-xs text-white/50 drop-shadow-sm">In loving memory of Sheila ❤️ Forever in our hearts. Forever in our work. 🦋</p>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-cyan drop-shadow-md">LET'S CONNECT</h4>
              <p className="text-sm text-white/70 mb-4 drop-shadow-sm">Follow for new designs, drops, behind the scenes</p>
              <div className="text-2xl space-x-4 mb-3">
                <span className="hover:animate-bounce cursor-pointer">📷</span>
                <span className="hover:animate-bounce cursor-pointer">🎵</span>
                <span className="hover:animate-bounce cursor-pointer">f</span>
              </div>
              <p className="text-xs text-white/50 drop-shadow-sm">@Lexisinks</p>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-cyan drop-shadow-md">QUICK LINKS</h4>
              <ul className="text-sm space-y-3 text-white/70 drop-shadow-sm">
                <li><Link href="#" className="hover:text-cyan transition hover:drop-shadow-lg">Shop Pens</Link></li>
                <li><Link href="/custom-order" className="hover:text-cyan transition hover:drop-shadow-lg">Custom Orders</Link></li>
                <li><Link href="#about" className="hover:text-cyan transition hover:drop-shadow-lg">About Us</Link></li>
                <li><Link href="#gallery" className="hover:text-cyan transition hover:drop-shadow-lg">Gallery</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-cyan drop-shadow-md">CONTACT</h4>
              <div className="space-y-4 text-sm text-white/70 drop-shadow-sm">
                <div className="flex items-center gap-2">
                  <span>📧</span>
                  <span>lexisinks@gmail.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>In the USA 🇺🇸</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>❤️</span>
                  <span>Thank you for being part of our story!</span>
                </div>
              </div>
              <div className="mt-6 bg-white p-4 rounded-lg inline-block shadow-lg">
                <div className="text-3xl">📱</div>
                <p className="text-xs text-navy font-bold mt-2">SCAN TO SHOP</p>
              </div>
            </div>
          </div>

          <div className="border-t border-cyan/20 pt-8 text-center text-sm text-white/50 drop-shadow-sm">
            <p className="mb-3">© 2024 Lexi's Inks. All rights reserved.</p>
            <p>❤️ In loving memory of Sheila ❤️ Forever in our hearts. Forever in our work. 🦋</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
