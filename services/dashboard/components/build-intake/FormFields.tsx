'use client';

import { useId } from 'react';

function FormInput({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-[#00D9FF] mb-2">
        {label} {required && '*'}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 rounded bg-black/30 border-2 border-[#00D9FF]/30 text-white placeholder-gray-500 focus:border-[#00D9FF] focus:outline-none transition"
      />
    </div>
  );
}

function FormTextarea({
  label,
  name,
  placeholder,
  value,
  onChange,
  required,
}: {
  label: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-[#00D9FF] mb-2">
        {label} {required && '*'}
      </label>
      <textarea
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        rows={4}
        className="w-full px-4 py-3 rounded bg-black/30 border-2 border-[#00D9FF]/30 text-white placeholder-gray-500 focus:border-[#00D9FF] focus:outline-none transition"
      />
    </div>
  );
}

function FormSelect({
  label,
  name,
  options,
  value,
  onChange,
  required,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-[#00D9FF] mb-2">
        {label} {required && '*'}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 rounded bg-black/30 border-2 border-[#00D9FF]/30 text-white focus:border-[#00D9FF] focus:outline-none transition"
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

const Step1 = ({ formData, onInputChange }: any) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-[#00D9FF]">Project Essentials</h2>
    <FormInput
      label="Full Name"
      name="fullName"
      placeholder="Your name"
      value={formData.fullName}
      onChange={onInputChange}
      required
    />
    <FormInput
      label="Email"
      name="email"
      type="email"
      placeholder="your@email.com"
      value={formData.email}
      onChange={onInputChange}
      required
    />
    <FormInput
      label="Company Name"
      name="companyName"
      placeholder="Your company"
      value={formData.companyName}
      onChange={onInputChange}
      required
    />
    <FormSelect
      label="What do you need?"
      name="projectType"
      value={formData.projectType}
      onChange={onInputChange}
      required
      options={[
        { value: 'website', label: 'Website' },
        { value: 'app', label: 'Mobile App' },
        { value: 'saas', label: 'SaaS Platform' },
        { value: 'integration', label: 'API Integration' },
        { value: 'other', label: 'Other' },
      ]}
    />
    <FormTextarea
      label="Project Description"
      name="projectDescription"
      placeholder="Tell us about your project in detail..."
      value={formData.projectDescription}
      onChange={onInputChange}
      required
    />
  </div>
);

const Step2 = ({ formData, onInputChange }: any) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-[#FF4D4D]">Additional Details</h2>
    <FormSelect
      label="Preferred Timeline"
      name="preferredTimeline"
      value={formData.preferredTimeline}
      onChange={onInputChange}
      options={[
        { value: 'urgent', label: 'ASAP (1-2 weeks)' },
        { value: 'fast', label: 'Fast (1 month)' },
        { value: 'standard', label: 'Standard (2-3 months)' },
        { value: 'flexible', label: 'Flexible' },
      ]}
    />
    <FormSelect
      label="Budget Range"
      name="budgetRange"
      value={formData.budgetRange}
      onChange={onInputChange}
      options={[
        { value: 'under-10k', label: 'Under $10k' },
        { value: '10-50k', label: '$10k - $50k' },
        { value: '50-100k', label: '$50k - $100k' },
        { value: 'over-100k', label: 'Over $100k' },
      ]}
    />
    <FormInput
      label="Phone"
      name="phone"
      type="tel"
      placeholder="+1 (555) 000-0000"
      value={formData.phone}
      onChange={onInputChange}
    />
    <FormInput
      label="Website"
      name="website"
      type="url"
      placeholder="https://yoursite.com"
      value={formData.website}
      onChange={onInputChange}
    />
    <FormTextarea
      label="Additional Notes"
      name="additionalInfo"
      placeholder="Anything else we should know?"
      value={formData.additionalInfo}
      onChange={onInputChange}
    />
  </div>
);

export default { Step1, Step2 };
