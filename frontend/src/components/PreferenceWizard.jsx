import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, Check, DollarSign, Star, Sliders } from 'lucide-react';

export default function PreferenceWizard({ options, initialProfile = {}, onClose, onSubmit }) {
  const [step, setStep] = useState(1);
  const totalSteps = 10;

  // Wizard state initialized with any existing profile
  const [gender, setGender] = useState(initialProfile.gender || 'men');
  const [categories, setCategories] = useState(initialProfile.categories || []);
  const [sizes, setSizes] = useState(initialProfile.clothing_size ? [initialProfile.clothing_size] : []);
  const [colors, setColors] = useState(initialProfile.favorite_colors || []);
  const [priceMax, setPriceMax] = useState(initialProfile.budget_max || 180);
  const [styles, setStyles] = useState(initialProfile.styles || []);
  const [fits, setFits] = useState(initialProfile.fits || []);
  const [materials, setMaterials] = useState(initialProfile.materials || []);
  const [brands, setBrands] = useState(initialProfile.brands || []);
  const [inStockOnly, setInStockOnly] = useState(true);
  const [minRating, setMinRating] = useState(4.0);

  // Toggle helper
  const toggleArrayItem = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    const preferences = {
      gender,
      categories: categories.length ? categories : undefined,
      sizes: sizes.length ? sizes : undefined,
      colors: colors.length ? colors : undefined,
      styles: styles.length ? styles : undefined,
      fits: fits.length ? fits : undefined,
      materials: materials.length ? materials : undefined,
      brands: brands.length ? brands : undefined,
      price_max: Number(priceMax),
      min_rating: Number(minRating),
      in_stock_only: inStockOnly,
    };
    onSubmit(preferences);
  };

  // Available categories for selected gender
  const availableCats = options?.categories_by_gender?.[gender] || options?.categories_by_gender?.['men'] || [];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'var(--bg-overlay)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '1rem',
    }}>
      <div className="glass" style={{
        width: '100%',
        maxWidth: '720px',
        maxHeight: '90vh',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-gold)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold)', fontSize: '0.8rem', fontWeight: 600 }}>
              <Sparkles size={14} />
              <span>STEP {step} OF {totalSteps}</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 600 }}>
              {step === 1 && "Who are you shopping for?"}
              {step === 2 && "Which categories are you looking for?"}
              {step === 3 && "Select your standard size(s)"}
              {step === 4 && "Choose your preferred colors"}
              {step === 5 && "What is your maximum budget per piece?"}
              {step === 6 && "What is your style aesthetic?"}
              {step === 7 && "Preferred silhouette & fit?"}
              {step === 8 && "Preferred fabrics & materials?"}
              {step === 9 && "Favorite boutique brands?"}
              {step === 10 && "Quality & availability filters"}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-secondary)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.06)' }}>
          <div style={{
            width: `${(step / totalSteps) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #dfba73, #eed39c)',
            transition: 'width 0.3s ease',
          }} />
        </div>

        {/* Content Body */}
        <div style={{
          padding: '1.75rem',
          overflowY: 'auto',
          flex: 1,
        }}>
          {/* Step 1: Gender */}
          {step === 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
              {['men', 'women', 'unisex', 'kids'].map(g => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  style={{
                    padding: '2rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: gender === g ? '2px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                    background: gender === g ? 'var(--accent-gold-dim)' : 'var(--bg-secondary)',
                    color: gender === g ? 'var(--text-gold)' : 'var(--text-primary)',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    fontSize: '1.1rem',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Categories */}
          {step === 2 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
              {availableCats.map(cat => {
                const active = categories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleArrayItem(categories, setCategories, cat)}
                    style={{
                      padding: '0.9rem',
                      borderRadius: 'var(--radius-sm)',
                      border: active ? '1.5px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                      background: active ? 'var(--accent-gold-dim)' : 'var(--bg-secondary)',
                      color: active ? 'var(--text-gold)' : 'var(--text-primary)',
                      textTransform: 'capitalize',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{cat.replace('-', ' ')}</span>
                    {active && <Check size={16} />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 3: Sizes */}
          {step === 3 && (
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Select sizes you frequently wear (clothing or shoes):
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                {(gender === 'kids'
                  ? ['4Y', '6Y', '8Y', '10Y', '12Y', '14Y']
                  : ['XS', 'S', 'M', 'L', 'XL', 'XXL', '38', '39', '40', '41', '42', '43', '44', '45', 'One Size']
                ).map(sz => {
                  const active = sizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      onClick={() => toggleArrayItem(sizes, setSizes, sz)}
                      style={{
                        padding: '0.6rem 1.2rem',
                        borderRadius: 'var(--radius-sm)',
                        border: active ? '1.5px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                        background: active ? 'var(--accent-gold-dim)' : 'var(--bg-secondary)',
                        color: active ? 'var(--text-gold)' : 'var(--text-primary)',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                      }}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Colors */}
          {step === 4 && (
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Pick colors you enjoy wearing:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                {(options?.colors || [
                  { name: 'black', hex: '#1c1c1e' },
                  { name: 'white', hex: '#f4f2ec' },
                  { name: 'navy', hex: '#1f2a44' },
                  { name: 'grey', hex: '#8a8d91' },
                  { name: 'beige', hex: '#d8c8a8' },
                  { name: 'brown', hex: '#6b4a2f' },
                  { name: 'olive', hex: '#6b7044' },
                  { name: 'burgundy', hex: '#6d1f2e' },
                  { name: 'blue', hex: '#3a6ea5' },
                ]).map(c => {
                  const active = colors.includes(c.name);
                  return (
                    <button
                      key={c.name}
                      onClick={() => toggleArrayItem(colors, setColors, c.name)}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        border: active ? '1.5px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                        background: active ? 'var(--accent-gold-dim)' : 'var(--bg-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                      }}
                    >
                      <span style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: c.hex,
                        border: '1px solid rgba(255,255,255,0.2)',
                      }} />
                      <span style={{
                        textTransform: 'capitalize',
                        fontSize: '0.88rem',
                        color: active ? 'var(--text-gold)' : 'var(--text-primary)',
                      }}>
                        {c.name.replace('-', ' ')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 5: Price Max */}
          {step === 5 && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '1.5rem' }}>
                ${priceMax}
              </div>
              <input
                type="range"
                min="30"
                max="260"
                step="5"
                value={priceMax}
                onChange={e => setPriceMax(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: '480px',
                  accentColor: 'var(--accent-gold)',
                  cursor: 'pointer',
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                maxWidth: '480px',
                margin: '0.5rem auto 0',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
              }}>
                <span>$30</span>
                <span>$140</span>
                <span>$260+</span>
              </div>
            </div>
          )}

          {/* Step 6: Styles */}
          {step === 6 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem' }}>
              {['casual', 'formal', 'sporty', 'streetwear', 'classic'].map(st => {
                const active = styles.includes(st);
                return (
                  <button
                    key={st}
                    onClick={() => toggleArrayItem(styles, setStyles, st)}
                    style={{
                      padding: '1.25rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: active ? '1.5px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                      background: active ? 'var(--accent-gold-dim)' : 'var(--bg-secondary)',
                      color: active ? 'var(--text-gold)' : 'var(--text-primary)',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      fontSize: '0.95rem',
                    }}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 7: Fits */}
          {step === 7 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem' }}>
              {['slim', 'regular', 'oversized'].map(f => {
                const active = fits.includes(f);
                return (
                  <button
                    key={f}
                    onClick={() => toggleArrayItem(fits, setFits, f)}
                    style={{
                      padding: '1.25rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: active ? '1.5px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                      background: active ? 'var(--accent-gold-dim)' : 'var(--bg-secondary)',
                      color: active ? 'var(--text-gold)' : 'var(--text-primary)',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      fontSize: '0.95rem',
                    }}
                  >
                    {f} Fit
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 8: Materials */}
          {step === 8 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
              {['cotton', 'linen', 'wool', 'denim', 'leather', 'polyester'].map(m => {
                const active = materials.includes(m);
                return (
                  <button
                    key={m}
                    onClick={() => toggleArrayItem(materials, setMaterials, m)}
                    style={{
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: active ? '1.5px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                      background: active ? 'var(--accent-gold-dim)' : 'var(--bg-secondary)',
                      color: active ? 'var(--text-gold)' : 'var(--text-primary)',
                      textTransform: 'capitalize',
                      fontSize: '0.9rem',
                    }}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 9: Brands */}
          {step === 9 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' }}>
              {(options?.brands || [
                'Nordvik', 'Atelier Nine', 'UrbanThread', 'Pulse Athletics',
                'Maison Lune', 'Indigo Lab', 'Terra Loom', 'Stride',
              ]).map(b => {
                const active = brands.includes(b);
                return (
                  <button
                    key={b}
                    onClick={() => toggleArrayItem(brands, setBrands, b)}
                    style={{
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: active ? '1.5px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                      background: active ? 'var(--accent-gold-dim)' : 'var(--bg-secondary)',
                      color: active ? 'var(--text-gold)' : 'var(--text-primary)',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 10: Ratings & Stock */}
          {step === 10 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '440px', margin: '0 auto' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
              }}>
                <span style={{ fontWeight: 500 }}>Only Show In-Stock Items</span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={e => setInStockOnly(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-gold)' }}
                />
              </label>

              <div style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 500 }}>Minimum Rating</span>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{minRating} Stars</span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="4.8"
                  step="0.1"
                  value={minRating}
                  onChange={e => setMinRating(e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--accent-gold)' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {step > 1 ? (
            <button
              onClick={handleBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                padding: '0.5rem 1rem',
              }}
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
          ) : <div />}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleSubmit}
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                padding: '0.6rem 1rem',
              }}
            >
              Skip to styling
            </button>

            <button
              onClick={handleNext}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.65rem 1.4rem',
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, #dfba73, #ba9243)',
                color: '#0b0c10',
                fontWeight: 600,
                fontSize: '0.9rem',
                boxShadow: 'var(--shadow-gold)',
              }}
            >
              <span>{step === totalSteps ? "Style Me" : "Continue"}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
