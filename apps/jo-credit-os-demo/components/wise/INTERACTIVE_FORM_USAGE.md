# Interactive Intake Form - Usage Guide

## Overview
The `InteractiveIntakeForm` component provides an enhanced, step-by-step intake experience with real-time validation, progress tracking, and interactive feedback.

## Features

### 1. **Step-Based Progression**
- Form broken into 4 logical steps:
  - Step 1: Contact Info (name, email, phone)
  - Step 2: Business Details (company, website, services)
  - Step 3: Project Details (budget, start date, description)
  - Step 4: Materials (file upload)

### 2. **Real-Time Validation**
- Field validation as user types
- Visual feedback: red error states, green success states
- Error messages appear inline below each field
- Submit button disabled until all required fields are valid

### 3. **Progress Indicators**
- Animated progress bar showing completion percentage
- Step indicators (dots) for each form section
- Current step number and title displayed
- Completed steps are clickable to go back

### 4. **Interactive Feedback**
- Green checkmarks on completed fields
- Color-coded border states:
  - Green when focused
  - Green/50% opacity when completed
  - Green/20% opacity normal state
  - Red when error
- Smooth animations and transitions

### 5. **Field Completion Tracking**
- Visual indicator of which fields are done
- Help text appears on focus to guide users
- Required field indicators (*)

### 6. **Smart Field Behavior**
- Auto-detection of field types (email, date, phone, etc.)
- Select dropdowns for services and budget
- Textarea for project description
- File upload with drag-and-drop support
- Proper input masking and validation

## Integration

### Basic Usage
```tsx
import { InteractiveIntakeForm } from '@/components/wise/InteractiveIntakeForm';

export default function IntakePage() {
  const handleSubmit = (data) => {
    console.log('Form submitted:', data);
    // Handle form submission (API call, etc)
  };

  return (
    <div className="min-h-screen bg-wise-bg-primary p-8">
      <InteractiveIntakeForm onSubmit={handleSubmit} />
    </div>
  );
}
```

### Props
| Prop | Type | Description |
|------|------|-------------|
| `onSubmit` | `(data: FormData) => void` | Optional callback on form submission (overrides default API call) |

### FormData Structure
```typescript
interface FormData {
  name: string;              // Full name (required)
  business: string;          // Company/business name (required)
  email: string;             // Email address (required)
  phone: string;             // Phone number (required)
  website: string;           // Portfolio/website (optional)
  services: string;          // Selected service (required)
  budget: string;            // Selected budget range (required)
  file: File | null;         // Upload materials (optional)
  description: string;       // Project vision (required)
  startDate: string;         // Desired start date (required)
}
```

## API Endpoint
By default, the form POSTs to `/api/intake` with the FormData.

To use a custom handler, pass the `onSubmit` prop:
```tsx
<InteractiveIntakeForm onSubmit={async (data) => {
  const response = await fetch('/api/custom-intake', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  // Handle response
}} />
```

## Styling & Design

### WISE² Design System
- **Colors**: Dark theme with green accents (#22c55e)
- **Background**: wise-bg-primary (#050505), wise-bg-secondary (#101010)
- **Text**: wise-text-primary (light), wise-text-muted (secondary)
- **Borders**: Green gradient with 20%-50% opacity

### CSS Variables Used
- `--wise-bg-primary` - Main background
- `--wise-bg-secondary` - Input/container background
- `--wise-text-primary` - Main text
- `--wise-text-muted` - Secondary text
- `--wise-accent-green` - Primary accent color

### Customization
All styling uses Tailwind + CSS variables, so you can customize by:
1. Adjusting Tailwind classes (e.g., change grid columns)
2. Modifying CSS variables in your global styles
3. Adding additional Tailwind overrides

## Validation Rules

### Email
- Required
- Must be valid email format (user@domain.com)

### Phone
- Required
- Must contain at least 7 digits
- Supports +, -, (), and spaces

### Name
- Required
- Minimum 2 characters

### Business
- Required
- Any non-empty string

### Service
- Required
- Must select from provided options

### Budget
- Required
- Must select from provided options

### Start Date
- Required
- Date format (YYYY-MM-DD)

### Description
- Required
- Minimum 10 characters

### File
- Optional
- Max 5MB per file
- Supported: PDF, DOC, DOCX, JPG, PNG, GIF

## Success State

After successful submission:
1. Form displays success message (animated checkmark)
2. Auto-hides after 3 seconds
3. Form resets to initial state
4. Progress returns to Step 1

## Error Handling

### Field-Level Errors
- Inline error messages appear below field
- Field border turns red
- Red ring on focus

### Submit-Level Errors
- Error message displayed at bottom
- Submit button shows error state
- User can correct and resubmit

## Accessibility

- Semantic HTML (form, labels, inputs)
- Proper label associations
- Error messages linked to fields
- Focus indicators for keyboard navigation
- Keyboard support for all inputs and buttons

## Dependencies

- React 18+
- Next.js 13+ (or compatible React router)
- Tailwind CSS
- WISE² design system CSS variables

## Replacing Old Form

To replace the existing `IntakeForm.tsx`:

1. **In page/route that uses the form:**
   ```tsx
   // Old
   import { IntakeForm } from '@/components/wise/IntakeForm';
   
   // New
   import { InteractiveIntakeForm } from '@/components/wise/InteractiveIntakeForm';
   ```

2. **Update the component reference:**
   ```tsx
   // Old
   <IntakeForm />
   
   // New
   <InteractiveIntakeForm onSubmit={handleSubmit} />
   ```

## Performance Notes

- Form validation is real-time (no debounce)
- No external dependencies (pure React)
- Optimized re-renders with proper state management
- CSS animations use GPU acceleration
- File upload handled client-side

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Fully responsive

## Future Enhancements

Potential improvements:
- [ ] Multi-file upload with preview thumbnails
- [ ] Conditional fields based on service selection
- [ ] Autosave progress to localStorage
- [ ] Address autocomplete
- [ ] Company lookup (Clearbit/Hunter integration)
- [ ] Smart phone number formatting
- [ ] PDF file preview
