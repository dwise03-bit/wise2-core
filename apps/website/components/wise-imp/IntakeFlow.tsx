'use client';

import { useState } from 'react';
import { PROJECT_CATEGORIES } from '@/lib/wise-imp/knowledge';

interface IntakeState {
  mode: 'conversational' | 'form';
  categoryId: string | null;
  step: number;
  contactName: string;
  email: string;
  phone: string;
  businessName: string;
  answers: Array<{ question: string; answer: string }>;
  submitting: boolean;
  submitted: boolean;
  submitError: string | null;
}

interface IntakeFlowProps {
  intake: IntakeState;
  onSetMode: (mode: 'conversational' | 'form') => void;
  onSetField: (field: 'contactName' | 'email' | 'phone' | 'businessName' | 'categoryId', value: string) => void;
  onAnswer: (question: string, answer: string) => void;
  onBack: () => void;
  onSetStep: (step: number) => void;
  onSubmit: (overrideAnswers?: Array<{ question: string; answer: string }>) => void;
  onClose: () => void;
}

// Conversational steps after the fixed category/contact/email/phone/business
// fields (index 0-4). One open question at a time, per the brief.
const PROJECT_QUESTIONS = [
  'What are you trying to build or solve?',
  'Do you already have anything in place (name, brand, website, team) — or starting from zero?',
];

const TOTAL_STEPS = 5 + PROJECT_QUESTIONS.length; // category, name, email, phone, business, + questions
const REVIEW_STEP = TOTAL_STEPS;

export function IntakeFlow({ intake, onSetMode, onSetField, onAnswer, onBack, onSetStep, onSubmit, onClose }: IntakeFlowProps) {
  const [draft, setDraft] = useState('');

  if (intake.submitted) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <p style={{ fontSize: 32, margin: '0 0 8px' }} aria-hidden>
          ✨
        </p>
        <p style={{ color: '#39FF14', fontWeight: 700, margin: '0 0 6px' }}>Sent to the WISE² team.</p>
        <p style={{ color: '#8D98A5', fontSize: 13, margin: '0 0 16px' }}>
          We&apos;ll follow up at {intake.email}. Thanks for walking through this with Wise Imp.
        </p>
        <button
          type="button"
          onClick={onClose}
          style={{ background: '#39FF14', color: '#050505', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, cursor: 'pointer' }}
        >
          Done
        </button>
      </div>
    );
  }

  if (intake.mode === 'form') {
    return (
      <IntakeStandardForm
        intake={intake}
        onSetField={onSetField}
        onSubmit={onSubmit}
        onSwitchMode={() => onSetMode('conversational')}
      />
    );
  }

  const progressPct = Math.min(100, Math.round((intake.step / REVIEW_STEP) * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '10px 14px 0' }}>
        <div
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}
        >
          <div style={{ height: '100%', width: `${progressPct}%`, background: '#39FF14', transition: 'width 0.2s' }} />
        </div>
        <button
          type="button"
          onClick={() => onSetMode('form')}
          style={{ background: 'none', border: 'none', color: '#8D98A5', fontSize: 11, cursor: 'pointer', padding: '6px 0' }}
        >
          Switch to standard form
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 14px 14px' }}>
        {intake.step === 0 && (
          <StepCategory
            selected={intake.categoryId}
            onSelect={(id) => {
              onSetField('categoryId', id);
              onSetStep(1);
            }}
          />
        )}
        {intake.step === 1 && (
          <StepText
            label="What's your name?"
            value={intake.contactName}
            onChange={(v) => onSetField('contactName', v)}
            onNext={() => onSetStep(2)}
            onBack={onBack}
            autoFocus
          />
        )}
        {intake.step === 2 && (
          <StepText
            label="What's your email?"
            type="email"
            value={intake.email}
            onChange={(v) => onSetField('email', v)}
            onNext={() => onSetStep(3)}
            onBack={onBack}
          />
        )}
        {intake.step === 3 && (
          <StepText
            label="Phone number? (optional)"
            value={intake.phone}
            onChange={(v) => onSetField('phone', v)}
            onNext={() => onSetStep(4)}
            onBack={onBack}
            optional
          />
        )}
        {intake.step === 4 && (
          <StepText
            label="Business or project name? (optional)"
            value={intake.businessName}
            onChange={(v) => onSetField('businessName', v)}
            onNext={() => onSetStep(5)}
            onBack={onBack}
            optional
          />
        )}
        {intake.step >= 5 && intake.step < REVIEW_STEP && (
          <StepQuestion
            key={intake.step}
            question={PROJECT_QUESTIONS[intake.step - 5]}
            value={draft}
            onChange={setDraft}
            onNext={() => {
              onAnswer(PROJECT_QUESTIONS[intake.step - 5], draft);
              setDraft('');
            }}
            onBack={onBack}
          />
        )}
        {intake.step === REVIEW_STEP && (
          <StepReview intake={intake} onEditStep={onSetStep} onBack={onBack} onSubmit={onSubmit} />
        )}
      </div>
    </div>
  );
}

function fieldStyle(): React.CSSProperties {
  return {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8,
    padding: '9px 11px',
    color: '#E8ECEF',
    fontSize: 13,
    outline: 'none',
    marginTop: 8,
  };
}

function navButtons(onBack: (() => void) | null, onNext: () => void, disabled: boolean, nextLabel = 'Next') {
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#8D98A5', borderRadius: 8, padding: '7px 12px', fontSize: 12, cursor: 'pointer' }}
        >
          Back
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={disabled}
        style={{
          background: '#39FF14',
          color: '#050505',
          border: 'none',
          borderRadius: 8,
          padding: '7px 14px',
          fontWeight: 700,
          fontSize: 12,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {nextLabel}
      </button>
    </div>
  );
}

function StepCategory({ selected, onSelect }: { selected: string | null; onSelect: (id: string) => void }) {
  return (
    <div>
      <p style={{ color: '#E8ECEF', fontSize: 14, margin: '0 0 10px' }}>What kind of project is this?</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {PROJECT_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            aria-pressed={selected === c.id}
            style={{
              textAlign: 'left',
              background: selected === c.id ? 'rgba(57, 255, 20, 0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${selected === c.id ? 'rgba(57, 255, 20, 0.5)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 8,
              padding: '8px 10px',
              color: '#E8ECEF',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            <strong style={{ color: '#39FF14' }}>{c.label}</strong>
            <div style={{ color: '#8D98A5', fontSize: 11, marginTop: 2 }}>{c.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepText({
  label,
  value,
  onChange,
  onNext,
  onBack,
  type = 'text',
  optional = false,
  autoFocus = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
  type?: string;
  optional?: boolean;
  autoFocus?: boolean;
}) {
  const valid = optional || value.trim().length > 0;
  return (
    <div>
      <label style={{ color: '#E8ECEF', fontSize: 14 }}>
        {label}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={fieldStyle()}
          autoFocus={autoFocus}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && valid) onNext();
          }}
        />
      </label>
      {navButtons(onBack, onNext, !valid, optional && !value.trim() ? 'Skip' : 'Next')}
    </div>
  );
}

function StepQuestion({
  question,
  value,
  onChange,
  onNext,
  onBack,
}: {
  question: string;
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const valid = value.trim().length > 0;
  return (
    <div>
      <label style={{ color: '#E8ECEF', fontSize: 14 }}>
        {question}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          style={{ ...fieldStyle(), resize: 'vertical' }}
          autoFocus
        />
      </label>
      {navButtons(onBack, onNext, !valid)}
    </div>
  );
}

function StepReview({
  intake,
  onEditStep,
  onBack,
  onSubmit,
}: {
  intake: IntakeState;
  onEditStep: (step: number) => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const category = PROJECT_CATEGORIES.find((c) => c.id === intake.categoryId);
  return (
    <div>
      <p style={{ color: '#E8ECEF', fontSize: 14, fontWeight: 700, margin: '0 0 10px' }}>Review before sending</p>
      <ReviewRow label="Category" value={category?.label ?? '—'} onEdit={() => onEditStep(0)} />
      <ReviewRow label="Name" value={intake.contactName} onEdit={() => onEditStep(1)} />
      <ReviewRow label="Email" value={intake.email} onEdit={() => onEditStep(2)} />
      {intake.phone && <ReviewRow label="Phone" value={intake.phone} onEdit={() => onEditStep(3)} />}
      {intake.businessName && <ReviewRow label="Business" value={intake.businessName} onEdit={() => onEditStep(4)} />}
      {intake.answers.map((a, i) => (
        <ReviewRow key={i} label={a.question} value={a.answer} onEdit={() => onEditStep(5 + i)} />
      ))}
      {intake.submitError && (
        <p role="alert" style={{ color: '#FF6B6B', fontSize: 12, margin: '8px 0 0' }}>
          {intake.submitError}
        </p>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button
          type="button"
          onClick={onBack}
          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#8D98A5', borderRadius: 8, padding: '7px 12px', fontSize: 12, cursor: 'pointer' }}
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => onSubmit()}
          disabled={intake.submitting}
          style={{
            background: '#39FF14',
            color: '#050505',
            border: 'none',
            borderRadius: 8,
            padding: '7px 14px',
            fontWeight: 700,
            fontSize: 12,
            cursor: intake.submitting ? 'not-allowed' : 'pointer',
            opacity: intake.submitting ? 0.6 : 1,
          }}
        >
          {intake.submitting ? 'Sending…' : 'Confirm & send'}
        </button>
      </div>
    </div>
  );
}

function ReviewRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ color: '#8D98A5', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</div>
        <div style={{ color: '#E8ECEF', fontSize: 12, overflowWrap: 'break-word' }}>{value}</div>
      </div>
      <button type="button" onClick={onEdit} style={{ background: 'none', border: 'none', color: '#0094FF', fontSize: 11, cursor: 'pointer', flexShrink: 0 }}>
        Edit
      </button>
    </div>
  );
}

/** Plain-form fallback: no-JS-conversation-friendly, reduced-motion friendly, posts to the same endpoint. */
function IntakeStandardForm({
  intake,
  onSetField,
  onSubmit,
  onSwitchMode,
}: {
  intake: IntakeState;
  onSetField: (field: 'contactName' | 'email' | 'phone' | 'businessName' | 'categoryId', value: string) => void;
  onSubmit: (overrideAnswers?: Array<{ question: string; answer: string }>) => void;
  onSwitchMode: () => void;
}) {
  const [description, setDescription] = useState(intake.answers[0]?.answer ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit([{ question: 'What are you trying to build or solve?', answer: description }]);
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <button
        type="button"
        onClick={onSwitchMode}
        style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: '#8D98A5', fontSize: 11, cursor: 'pointer', padding: 0 }}
      >
        ← Switch to conversational
      </button>

      <label style={{ color: '#E8ECEF', fontSize: 13 }}>
        Project category
        <select value={intake.categoryId ?? ''} onChange={(e) => onSetField('categoryId', e.target.value)} required style={fieldStyle()}>
          <option value="" disabled>
            Choose one…
          </option>
          {PROJECT_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <label style={{ color: '#E8ECEF', fontSize: 13 }}>
        Name
        <input type="text" value={intake.contactName} onChange={(e) => onSetField('contactName', e.target.value)} required style={fieldStyle()} />
      </label>

      <label style={{ color: '#E8ECEF', fontSize: 13 }}>
        Email
        <input type="email" value={intake.email} onChange={(e) => onSetField('email', e.target.value)} required style={fieldStyle()} />
      </label>

      <label style={{ color: '#E8ECEF', fontSize: 13 }}>
        Phone (optional)
        <input type="text" value={intake.phone} onChange={(e) => onSetField('phone', e.target.value)} style={fieldStyle()} />
      </label>

      <label style={{ color: '#E8ECEF', fontSize: 13 }}>
        Business or project name (optional)
        <input type="text" value={intake.businessName} onChange={(e) => onSetField('businessName', e.target.value)} style={fieldStyle()} />
      </label>

      <label style={{ color: '#E8ECEF', fontSize: 13 }}>
        What are you trying to build or solve?
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required style={{ ...fieldStyle(), resize: 'vertical' }} />
      </label>

      {intake.submitError && (
        <p role="alert" style={{ color: '#FF6B6B', fontSize: 12, margin: 0 }}>
          {intake.submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={intake.submitting}
        style={{
          background: '#39FF14',
          color: '#050505',
          border: 'none',
          borderRadius: 8,
          padding: '9px 14px',
          fontWeight: 700,
          fontSize: 13,
          cursor: intake.submitting ? 'not-allowed' : 'pointer',
          opacity: intake.submitting ? 0.6 : 1,
        }}
      >
        {intake.submitting ? 'Sending…' : 'Submit'}
      </button>
    </form>
  );
}
