'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { useSoundLabModals } from './SoundLabModals';

interface FormData {
  name: string;
  brand: string;
  email: string;
  phone: string;
  whatAreWeCreating: string;
  industry: string;
  audience: string;
  genre: string;
  mood: string;
  vocalPreference: string;
  length: string;
  usage: string;
  reference: string;
  deadline: string;
  package: string;
  notes: string;
}

const EMPTY: FormData = {
  name: '',
  brand: '',
  email: '',
  phone: '',
  whatAreWeCreating: '',
  industry: '',
  audience: '',
  genre: '',
  mood: '',
  vocalPreference: '',
  length: '',
  usage: '',
  reference: '',
  deadline: '',
  package: '',
  notes: '',
};

const CREATING_OPTIONS = [
  'Business Jingle',
  'Full Song',
  'Podcast Intro/Outro',
  'Commercial / Radio Spot',
  'Sonic Logo',
  'AI Vocals',
  'Instrumental / Beat',
  'Social Media Audio',
];

const VOCAL_OPTIONS = ['No vocals (instrumental)', 'Male vocal', 'Female vocal', 'AI vocal', 'Not sure yet'];
const LENGTH_OPTIONS = ['15 seconds', '30 seconds', '60 seconds', 'Full song (2-4 min)', 'Custom'];
const PACKAGE_OPTIONS = ['STARTER', 'PRO', 'ENTERPRISE', 'Not sure yet'];

const STEPS = [
  { title: 'Contact', fields: ['name', 'brand', 'email', 'phone'] },
  { title: 'The Project', fields: ['whatAreWeCreating', 'industry', 'audience'] },
  { title: 'The Sound', fields: ['genre', 'mood', 'vocalPreference', 'length'] },
  { title: 'Details', fields: ['usage', 'reference', 'deadline', 'package', 'notes'] },
  { title: 'Review', fields: [] },
];

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block mb-4">
      <span className="block text-[11px] font-bold tracking-wide text-gray-400 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  'w-full bg-white/5 border border-white/10 rounded px-3.5 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#9AFF00]/60 transition-colors';

function PillGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          type="button"
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded text-[11px] font-semibold border transition-colors cursor-pointer ${
            value === opt
              ? 'bg-[#9AFF00] text-black border-[#9AFF00]'
              : 'border-white/15 text-gray-300 hover:border-[#9AFF00]/50'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function ProjectIntake() {
  const { intakeOpen, intakePackage, closeIntake } = useSoundLabModals();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (intakeOpen) {
      setStep(0);
      setSubmitted(false);
      setData((d) => ({ ...EMPTY, package: intakePackage ?? '' }));
    }
  }, [intakeOpen, intakePackage]);

  if (!intakeOpen) return null;

  const set = (key: keyof FormData) => (value: string) =>
    setData((d) => ({ ...d, [key]: value }));

  const isLastContentStep = step === STEPS.length - 1;
  const progressPct = ((step + 1) / STEPS.length) * 100;

  const canAdvance = () => {
    if (step === 0) return data.name.trim() && data.email.trim().includes('@');
    return true;
  };

  const handleSubmit = () => {
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeIntake}
        className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl border border-[#9AFF00]/30 bg-[#0a0a0a] shadow-[0_0_80px_rgba(0,0,0,0.8)]"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
            <p className="text-sm font-black tracking-widest">
              START MY <span className="text-[#9AFF00]">PROJECT</span>
            </p>
            <button onClick={closeIntake} className="p-1.5 text-gray-400 hover:text-white cursor-pointer" aria-label="Close">
              <X size={20} />
            </button>
          </div>

          {!submitted && (
            <div className="h-1 bg-white/5 shrink-0">
              <div
                className="h-full bg-[#9AFF00] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          )}

          <div className="overflow-y-auto px-6 py-6">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#9AFF00]/15 border border-[#9AFF00]/50 flex items-center justify-center">
                  <Check size={26} className="text-[#9AFF00]" />
                </div>
                <h3 className="text-lg font-black mb-2">Project Request Captured</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed mb-6">
                  This is a demo preview — nothing was sent to a live team yet. Once WISE² Sound
                  Lab is connected to a real intake pipeline, this summary is what your producer
                  would receive.
                </p>
                <button
                  onClick={closeIntake}
                  className="px-6 py-2.5 rounded bg-[#9AFF00] text-black text-xs font-black tracking-wide cursor-pointer"
                >
                  DONE
                </button>
              </div>
            ) : (
              <>
                <p className="text-[10px] font-bold tracking-widest text-gray-500 mb-5">
                  STEP {step + 1} OF {STEPS.length} · {STEPS[step].title.toUpperCase()}
                </p>

                {step === 0 && (
                  <>
                    <Field label="Name">
                      <input
                        className={inputClass}
                        value={data.name}
                        onChange={(e) => set('name')(e.target.value)}
                        placeholder="Your name"
                      />
                    </Field>
                    <Field label="Business / Brand">
                      <input
                        className={inputClass}
                        value={data.brand}
                        onChange={(e) => set('brand')(e.target.value)}
                        placeholder="Your brand name"
                      />
                    </Field>
                    <Field label="Email">
                      <input
                        type="email"
                        className={inputClass}
                        value={data.email}
                        onChange={(e) => set('email')(e.target.value)}
                        placeholder="you@brand.com"
                      />
                    </Field>
                    <Field label="Phone (optional)">
                      <input
                        className={inputClass}
                        value={data.phone}
                        onChange={(e) => set('phone')(e.target.value)}
                        placeholder="(555) 555-5555"
                      />
                    </Field>
                  </>
                )}

                {step === 1 && (
                  <>
                    <Field label="What are we creating?">
                      <PillGroup options={CREATING_OPTIONS} value={data.whatAreWeCreating} onChange={set('whatAreWeCreating')} />
                    </Field>
                    <Field label="Industry">
                      <input
                        className={inputClass}
                        value={data.industry}
                        onChange={(e) => set('industry')(e.target.value)}
                        placeholder="e.g. restaurant, construction, fitness"
                      />
                    </Field>
                    <Field label="Target audience">
                      <input
                        className={inputClass}
                        value={data.audience}
                        onChange={(e) => set('audience')(e.target.value)}
                        placeholder="Who are you speaking to?"
                      />
                    </Field>
                  </>
                )}

                {step === 2 && (
                  <>
                    <Field label="Genre / style">
                      <input
                        className={inputClass}
                        value={data.genre}
                        onChange={(e) => set('genre')(e.target.value)}
                        placeholder="e.g. upbeat pop, cinematic, lo-fi"
                      />
                    </Field>
                    <Field label="Mood">
                      <input
                        className={inputClass}
                        value={data.mood}
                        onChange={(e) => set('mood')(e.target.value)}
                        placeholder="e.g. energetic, warm, bold"
                      />
                    </Field>
                    <Field label="Vocal preference">
                      <PillGroup options={VOCAL_OPTIONS} value={data.vocalPreference} onChange={set('vocalPreference')} />
                    </Field>
                    <Field label="Desired length">
                      <PillGroup options={LENGTH_OPTIONS} value={data.length} onChange={set('length')} />
                    </Field>
                  </>
                )}

                {step === 3 && (
                  <>
                    <Field label="Where will the audio be used?">
                      <input
                        className={inputClass}
                        value={data.usage}
                        onChange={(e) => set('usage')(e.target.value)}
                        placeholder="e.g. TV, social media, in-store"
                      />
                    </Field>
                    <Field label="Reference / inspiration notes">
                      <textarea
                        className={`${inputClass} min-h-[70px] resize-none`}
                        value={data.reference}
                        onChange={(e) => set('reference')(e.target.value)}
                        placeholder="Links, artists, or brands you love the sound of"
                      />
                    </Field>
                    <Field label="Deadline">
                      <input
                        className={inputClass}
                        value={data.deadline}
                        onChange={(e) => set('deadline')(e.target.value)}
                        placeholder="e.g. in 2 weeks, ASAP, flexible"
                      />
                    </Field>
                    <Field label="Package">
                      <PillGroup options={PACKAGE_OPTIONS} value={data.package} onChange={set('package')} />
                    </Field>
                    <Field label="Additional instructions">
                      <textarea
                        className={`${inputClass} min-h-[70px] resize-none`}
                        value={data.notes}
                        onChange={(e) => set('notes')(e.target.value)}
                        placeholder="Anything else we should know?"
                      />
                    </Field>
                  </>
                )}

                {step === 4 && (
                  <div className="space-y-2.5">
                    {Object.entries(data)
                      .filter(([, v]) => v)
                      .map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-4 text-xs border-b border-white/5 pb-2">
                          <span className="text-gray-500 capitalize shrink-0">
                            {k.replace(/([A-Z])/g, ' $1')}
                          </span>
                          <span className="text-gray-200 text-right">{v}</span>
                        </div>
                      ))}
                    {Object.values(data).every((v) => !v) && (
                      <p className="text-xs text-gray-600">No details entered yet — go back to fill in your project.</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {!submitted && (
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-white/10 shrink-0">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded text-xs font-bold text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white cursor-pointer"
              >
                <ArrowLeft size={14} /> BACK
              </button>

              {isLastContentStep ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded bg-[#9AFF00] text-black text-xs font-black tracking-wide hover:shadow-[0_0_20px_rgba(154,255,0,0.5)] transition-shadow cursor-pointer disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> SUBMITTING
                    </>
                  ) : (
                    <>SUBMIT PROJECT</>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => canAdvance() && setStep((s) => s + 1)}
                  disabled={!canAdvance()}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded bg-[#9AFF00] text-black text-xs font-black tracking-wide disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(154,255,0,0.5)] transition-shadow cursor-pointer"
                >
                  NEXT <ArrowRight size={14} />
                </button>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
