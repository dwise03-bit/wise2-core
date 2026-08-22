'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);

  const handleShopNow = () => router.push('/#products');
  const handleLearnMore = () => router.push('/#about');
  const handleContactMe = () => router.push('/#contact');
  const handleShopCollections = () => router.push('/#products');

  const handleAddToCart = (productName: string, price: string | number) => {
    const priceNum = typeof price === 'string' ? parseFloat(price.replace('$', '')) : price;
    const newItem = { id: Math.random(), name: productName, price: priceNum, quantity: 1 };
    const updated = [...cart, newItem];
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));

    const proceed = confirm(`✅ ${productName} ($${priceNum.toFixed(2)}) added to cart!\n\nProceed to checkout?`);
    if (proceed) {
      router.push('/checkout');
    }
  };

  return (
    <>
      <Header />
      <main className="flex flex-col flex-1" style={{ background: '#FFFFFF' }}>
        {/* HERO - CC Photo + Value Prop */}
        <section style={{
          background: 'linear-gradient(135deg, #F3E8FF 0%, #FFFFFF 100%)',
          padding: '4rem 2rem',
          overflow: 'hidden'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4rem',
            alignItems: 'center'
          }}>
            {/* Left: CC Photo */}
            <div style={{ textAlign: 'center' }}>
              <img
                src="/images/cc-photo.webp"
                alt="CC - Founder of CC Craft & Create Studio"
                style={{
                  width: '100%',
                  maxWidth: '450px',
                  borderRadius: '20px',
                  border: '4px solid #D4AF37',
                  boxShadow: '0 20px 60px rgba(109, 45, 189, 0.15)',
                  objectFit: 'contain',
                  objectPosition: 'center'
                }}
              />
            </div>

            {/* Right: Value Prop */}
            <div>
              <h1 style={{
                fontSize: '3.5rem',
                fontFamily: 'Lora',
                fontWeight: '700',
                color: '#6D2DBD',
                marginBottom: '1rem',
                lineHeight: '1.2'
              }}>
                Celebrate Every Moment
              </h1>

              <p style={{
                fontSize: '1.3rem',
                color: '#D4AF37',
                fontWeight: '600',
                marginBottom: '1.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Custom Personalized Gifts & Favors
              </p>

              <p style={{
                fontSize: '1.1rem',
                color: '#29233D',
                lineHeight: '1.8',
                marginBottom: '2rem'
              }}>
                From birthdays to memorials, I create custom products that transform special occasions into unforgettable memories. Every detail is crafted with love and precision.
              </p>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={handleShopNow} style={{
                  background: '#6D2DBD',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '700',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(109, 45, 189, 0.3)',
                  transition: 'all 0.3s ease'
                }} onMouseOver={(e) => {
                  e.currentTarget.style.background = '#8B5A9E';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }} onMouseOut={(e) => {
                  e.currentTarget.style.background = '#6D2DBD';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  Shop Now
                </button>
                <button onClick={handleLearnMore} style={{
                  background: 'white',
                  color: '#6D2DBD',
                  border: '2px solid #6D2DBD',
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '700',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }} onMouseOver={(e) => {
                  e.currentTarget.style.background = '#F3E8FF';
                }} onMouseOut={(e) => {
                  e.currentTarget.style.background = 'white';
                }}>
                  Learn More
                </button>
              </div>

              {/* Trust Signals */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1.5rem',
                paddingTop: '2rem',
                borderTop: '2px solid #D4AF37'
              }}>
                <div>
                  <p style={{
                    fontSize: '1.8rem',
                    fontWeight: '700',
                    color: '#6D2DBD',
                    margin: '0 0 0.5rem 0'
                  }}>500+</p>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#29233D',
                    margin: 0,
                    fontWeight: '600'
                  }}>Happy Customers</p>
                </div>
                <div>
                  <p style={{
                    fontSize: '1.8rem',
                    fontWeight: '700',
                    color: '#6D2DBD',
                    margin: '0 0 0.5rem 0'
                  }}>7+ Years</p>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#29233D',
                    margin: 0,
                    fontWeight: '600'
                  }}>Crafting Joy</p>
                </div>
                <div>
                  <p style={{
                    fontSize: '1.8rem',
                    fontWeight: '700',
                    color: '#6D2DBD',
                    margin: '0 0 0.5rem 0'
                  }}>100%</p>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#29233D',
                    margin: 0,
                    fontWeight: '600'
                  }}>Handmade Care</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED PRODUCTS */}
        <section style={{
          background: 'white',
          padding: '4rem 2rem',
          borderTop: '1px solid #E8D5F2'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '3rem'
            }}>
              <p style={{
                fontSize: '0.9rem',
                color: '#D4AF37',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                margin: '0 0 0.5rem 0'
              }}>Featured</p>
              <h2 style={{
                fontSize: '2.5rem',
                fontFamily: 'Lora',
                fontWeight: '700',
                color: '#29233D',
                margin: 0
              }}>Best-Selling Collections</h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '2rem'
            }}>
              {[
                { name: 'Graduation Combo', image: '/images/product-graduation.webp', price: '$34.99', desc: 'Celebrate achievements with custom graduation gifts' },
                { name: 'Nurse Appreciation Set', image: '/images/product-nurse.webp', price: '$28.99', desc: 'Honor healthcare heroes with personalized appreciation gifts' },
                { name: 'Memorial Keepsake Box', image: '/images/product-memorial.webp', price: '$44.99', desc: 'Preserve cherished memories with elegant memorial items' },
                { name: 'Holiday Cheer Pack', image: '/images/product-holiday.webp', price: '$39.99', desc: 'Spread joy with custom holiday-themed collections' }
              ].map((product, i) => (
                <div key={i} style={{
                  background: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid #E8D5F2',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
                }} onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(109, 45, 189, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-5px)';
                }} onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '320px',
                      objectFit: 'contain',
                      objectPosition: 'top',
                      background: '#F3E8FF'
                    }}
                  />
                  <div style={{
                    padding: '2rem'
                  }}>
                    <h3 style={{
                      fontSize: '1.3rem',
                      fontFamily: 'Lora',
                      fontWeight: '700',
                      color: '#29233D',
                      margin: '0 0 0.5rem 0'
                    }}>{product.name}</h3>
                    <p style={{
                      fontSize: '0.95rem',
                      color: '#666',
                      marginBottom: '1rem',
                      lineHeight: '1.5'
                    }}>{product.desc}</p>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: '#D4AF37'
                      }}>{product.price}</span>
                      <button onClick={() => handleAddToCart(product.name, product.price)} style={{
                        background: '#6D2DBD',
                        color: 'white',
                        border: 'none',
                        padding: '0.7rem 1.5rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        transition: 'all 0.3s ease'
                      }} onMouseOver={(e) => {
                        e.currentTarget.style.background = '#8B5A9E';
                      }} onMouseOut={(e) => {
                        e.currentTarget.style.background = '#6D2DBD';
                      }}>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY CHOOSE CC */}
        <section style={{
          background: 'linear-gradient(135deg, #6D2DBD 0%, #8B5A9E 100%)',
          color: 'white',
          padding: '4rem 2rem'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '3rem'
            }}>
              <h2 style={{
                fontSize: '2.5rem',
                fontFamily: 'Lora',
                fontWeight: '700',
                margin: '0 0 1rem 0'
              }}>Why Choose CC Craft & Create?</h2>
              <p style={{
                fontSize: '1.1rem',
                color: '#E8D5F2',
                margin: 0,
                lineHeight: '1.6'
              }}>Professional custom products made with care, quality, and attention to every detail</p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '2rem'
            }}>
              {[
                { icon: '✨', title: 'Custom Designs', desc: 'Every product personalized just for you' },
                { icon: '⭐', title: 'Premium Quality', desc: 'High-grade materials & professional printing' },
                { icon: '❤️', title: 'Made with Love', desc: 'Handcrafted with passion & attention' },
                { icon: '🚚', title: 'Fast Delivery', desc: 'Quick turnaround on custom orders' }
              ].map((item, i) => (
                <div key={i} style={{
                  textAlign: 'center',
                  padding: '1.5rem'
                }}>
                  <p style={{
                    fontSize: '2.5rem',
                    margin: '0 0 1rem 0'
                  }}>{item.icon}</p>
                  <h3 style={{
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    margin: '0 0 0.5rem 0'
                  }}>{item.title}</h3>
                  <p style={{
                    fontSize: '0.95rem',
                    color: '#E8D5F2',
                    margin: 0,
                    lineHeight: '1.5'
                  }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* OUR PROCESS */}
        <section style={{
          background: 'white',
          padding: '4rem 2rem',
          borderTop: '1px solid #E8D5F2'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '3rem'
            }}>
              <p style={{
                fontSize: '0.9rem',
                color: '#D4AF37',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                margin: '0 0 0.5rem 0'
              }}>How It Works</p>
              <h2 style={{
                fontSize: '2.5rem',
                fontFamily: 'Lora',
                fontWeight: '700',
                color: '#29233D',
                margin: 0
              }}>Simple, Simple Process</h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '2rem'
            }}>
              {[
                { title: 'You Dream It', emoji: '💭', desc: 'Tell us your vision' },
                { title: 'We Design It', emoji: '✏️', desc: 'Custom design mockup' },
                { title: 'We Create It', emoji: '🛠️', desc: 'Handcrafted with care' },
                { title: 'You Enjoy It', emoji: '❤️', desc: 'Delivered & loved' }
              ].map((item, i) => (
                <div key={i} style={{
                  textAlign: 'center'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #D4AF37, #E5C158)',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    fontSize: '2rem',
                    boxShadow: '0 10px 30px rgba(212, 175, 55, 0.3)',
                    color: 'white'
                  }}>
                    {item.emoji}
                  </div>
                  <h3 style={{
                    fontSize: '1.2rem',
                    fontFamily: 'Lora',
                    fontWeight: '700',
                    color: '#29233D',
                    margin: '0 0 0.5rem 0'
                  }}>{item.title}</h3>
                  <p style={{
                    fontSize: '0.95rem',
                    color: '#666',
                    margin: 0
                  }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRODUCT CATEGORIES */}
        <section style={{
          background: '#F3E8FF',
          padding: '4rem 2rem'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '3rem'
            }}>
              <h2 style={{
                fontSize: '2.5rem',
                fontFamily: 'Lora',
                fontWeight: '700',
                color: '#29233D',
                margin: 0
              }}>Shop by Occasion</h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1.5rem'
            }}>
              {[
                { emoji: '🎂', name: 'Birthdays' },
                { emoji: '👶', name: 'Baby Showers' },
                { emoji: '🎓', name: 'Graduations' },
                { emoji: '🕯️', name: 'Memorials' },
                { emoji: '🎄', name: 'Holidays' },
                { emoji: '⚕️', name: 'Appreciation' },
                { emoji: '💼', name: 'Business' },
                { emoji: '👥', name: 'Community' }
              ].map((item, i) => (
                <div key={i} style={{
                  background: 'white',
                  padding: '2rem',
                  borderRadius: '12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '1px solid #E8D5F2'
                }} onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(109, 45, 189, 0.1)';
                }} onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <p style={{
                    fontSize: '2.5rem',
                    margin: '0 0 0.5rem 0'
                  }}>{item.emoji}</p>
                  <p style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#29233D',
                    margin: 0
                  }}>{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section style={{
          background: 'linear-gradient(135deg, #29233D 0%, #6D2DBD 100%)',
          color: 'white',
          padding: '4rem 2rem',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontFamily: 'Lora',
              fontWeight: '700',
              margin: '0 0 1rem 0'
            }}>Ready to Create Something Special?</h2>
            <p style={{
              fontSize: '1.2rem',
              color: '#E8D5F2',
              marginBottom: '2rem',
              lineHeight: '1.6'
            }}>Get in touch today and let's turn your vision into a beautiful, personalized product.</p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center'
            }}>
              <button onClick={handleContactMe} style={{
                background: '#D4AF37',
                color: '#29233D',
                border: 'none',
                padding: '1rem 2.5rem',
                fontSize: '1rem',
                fontWeight: '700',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }} onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }} onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}>
                Contact Me
              </button>
              <button onClick={handleShopCollections} style={{
                background: 'transparent',
                color: 'white',
                border: '2px solid #D4AF37',
                padding: '1rem 2.5rem',
                fontSize: '1rem',
                fontWeight: '700',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }} onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)';
              }} onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}>
                Shop Collections
              </button>
            </div>
          </div>
        </section>

        {/* SPECIALTIES */}
        <section style={{
          background: 'white',
          padding: '4rem 2rem',
          borderTop: '1px solid #E8D5F2'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '3rem'
            }}>
              <h2 style={{
                fontSize: '2.5rem',
                fontFamily: 'Lora',
                fontWeight: '700',
                color: '#29233D',
                margin: 0
              }}>What We Specialize In</h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '2rem',
              background: 'linear-gradient(135deg, #F3E8FF, #FFFFFF)',
              padding: '2rem',
              borderRadius: '12px',
              border: '1px solid #E8D5F2'
            }}>
              {[
                'Custom Party Packages',
                'Personalized Drink Labels',
                'Chip Bags & Candy Wrappers',
                'Water Bottle Labels',
                'Memorial & Keepsake Items',
                'Business & Brand Products',
                'Gift Boxes & Packaging',
                'Custom T-Shirts & Apparel'
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <span style={{
                    color: '#D4AF37',
                    fontSize: '1.5rem',
                    fontWeight: '700'
                  }}>✓</span>
                  <span style={{
                    fontSize: '1rem',
                    color: '#29233D',
                    fontWeight: '600'
                  }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <section style={{
          background: '#29233D',
          color: 'white',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '1.1rem',
            fontWeight: '500',
            letterSpacing: '0.1em'
          }}>
            ❤️ CRAFTED LOCALLY. ❤️ MADE WITH LOVE. ❤️ CREATED JUST FOR YOU. ❤️
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
