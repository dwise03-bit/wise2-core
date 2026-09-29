/**
 * WISE² Sound Labs - Editable Content Configuration
 * Edit prices, packages, FAQs, deliverables, and audiences here
 */

export const soundLabsPackages = [
  {
    id: 'starter',
    name: 'Starter Package',
    priceRange: '$99–$199',
    description: 'Perfect for creators and small businesses',
    icon: '🎵',
    benefits: [
      '30–60 second theme song',
      'Intro/outro version',
      'Commercial license',
      'Two revisions',
      'High-quality MP3/WAV',
    ],
    details: [
      'Original composition tailored to your brand',
      'Professional mixing and mastering',
      '2 rounds of feedback and revisions',
      'Commercial-use rights included',
      '5-7 business days delivery',
    ],
    cta: 'Start With Starter',
    highlighted: false,
  },
  {
    id: 'business',
    name: 'Business Package',
    priceRange: '$399–$799',
    description: 'For growing businesses and brands',
    icon: '🎼',
    benefits: [
      'Full 2–3 minute song',
      'Instrumental version',
      'Social-media edits',
      'TikTok/Reels version',
      'Phone-hold or ad version',
      'Commercial-use license',
    ],
    details: [
      'Custom composition with multiple edits',
      'Full arrangement with vocals/instruments',
      'Social media optimized cuts (15s, 30s, 60s)',
      'Professional mixing, mastering, and delivery',
      'Up to 3 revisions',
      '7-10 business days delivery',
    ],
    cta: 'Grow With Business',
    highlighted: false,
  },
  {
    id: 'premium',
    name: 'Premium Package',
    priceRange: '$1,000–$5,000+',
    description: 'Enterprise-level impact',
    icon: '👑',
    benefits: [
      'Custom song and discovery interview',
      'Multiple genres or versions',
      'Sonic logo/audio brand',
      'Music video or AI-assisted video',
      'TV, radio, or event edits',
      'Brand launch package',
      'Exclusive licensing',
    ],
    details: [
      'In-depth creative direction consultation',
      'Custom composition with full arrangement',
      'Audio brand identity development',
      'Video content creation (music video or cinematic)',
      'All social and broadcast formats',
      'Exclusive or custom licensing terms',
      'Priority support and revisions',
      '2-3 weeks full production',
    ],
    cta: 'Command With Premium',
    highlighted: true,
  },
  {
    id: 'subscription',
    name: 'Monthly Subscription',
    priceRange: '$99–$299/month',
    description: 'Ongoing music and content needs',
    icon: '♾️',
    benefits: [
      'Monthly music/content allowance',
      'Holiday or event songs',
      'Social content pack',
      'Ads and Reels edits',
      'Priority support',
      'Flexible cancellation',
    ],
    details: [
      'Scalable monthly production allowance',
      'Unlimited revisions within scope',
      'Custom songs for seasonal campaigns',
      'Content pack refreshed monthly',
      'Direct communication with producer',
      'Cancel anytime (monthly terms)',
      'Best for consistent creators',
    ],
    cta: 'Subscribe Monthly',
    highlighted: false,
  },
]

export const soundLabsDeliverables = [
  { title: 'Original Song', description: 'Fully produced composition', icon: '🎵' },
  { title: 'Lyric Video', description: 'Professional lyric visualization', icon: '📹' },
  { title: 'Cover Artwork', description: 'Album/single cover design', icon: '🎨' },
  { title: 'Music Video', description: 'Video or AI-assisted production', icon: '🎬' },
  { title: 'Social Pack', description: 'Reels, TikTok, story cuts', icon: '📱' },
  { title: 'Commercial License', description: 'Use rights for business', icon: '✓' },
  { title: 'Sonic Logo', description: 'Audio brand signature', icon: '🔔' },
  { title: 'Distribution Support', description: 'Optional streaming launch help', icon: '🚀' },
]

export const soundLabsAudiences = [
  { label: 'Creators', description: 'Solo artists, YouTubers, podcasters', icon: '🎤' },
  { label: 'Businesses', description: 'E-commerce, SaaS, service brands', icon: '💼' },
  { label: 'Gun Ranges & Instructors', description: 'Professional training facilities', icon: '🎯' },
  { label: 'Clothing Brands', description: 'Fashion and apparel companies', icon: '👕' },
  { label: 'Real Estate', description: 'Property and listing marketing', icon: '🏠' },
  { label: 'Fitness Professionals', description: 'Gyms, trainers, wellness brands', icon: '💪' },
  { label: 'Podcasts & Shows', description: 'Audio and video productions', icon: '🎙️' },
  { label: 'Construction & Trades', description: 'Professional services marketing', icon: '🔧' },
  { label: 'Weddings & Events', description: 'Celebration and milestone content', icon: '💍' },
]

export const soundLabsFAQ = [
  {
    question: 'What do I need to get started?',
    answer:
      'Just tell us about your brand, vision, or project. We\'ll guide you through a discovery call where we learn your story, target audience, and the feeling you want to convey. The more detail you share, the better we can craft something that connects with your audience.',
  },
  {
    question: 'How long does production take?',
    answer:
      'Starter packages: 5–7 business days. Business packages: 7–10 business days. Premium packages: 2–3 weeks. Subscriptions renew monthly. Rush delivery available on request with additional fee.',
  },
  {
    question: 'How do revisions work?',
    answer:
      'Starter and Business packages include 2–3 rounds of revisions. Premium packages include unlimited revisions within the agreed scope. Revisions are changes to direction, tone, or arrangement, not entirely new songs. We\'ll confirm what\'s included in your order agreement.',
  },
  {
    question: 'Who owns the finished music?',
    answer:
      'You own the finished composition. The commercial license grants you rights to use the music in your business and marketing. Exclusive licensing is available for Premium packages; we can discuss custom ownership terms.',
  },
  {
    question: 'What does the commercial license cover?',
    answer:
      'The commercial license covers use in social media, ads, broadcast, streaming, and business marketing. It does not grant you copyright ownership or the right to redistribute the raw audio files. Specific terms and limitations are detailed in your order agreement.',
  },
  {
    question: 'Can you match a general genre or mood without copying an artist?',
    answer:
      'Absolutely. We create original compositions inspired by your reference mood or genre—never copies of existing songs. We use your references as direction (e.g., "energetic like this, but different") not as templates to recreate.',
  },
  {
    question: 'Are AI tools involved?',
    answer:
      'Yes, we use AI as part of our creative workflow: for melody ideas, arrangement exploration, and production. Every piece is then shaped by human creativity, feedback, and professional audio engineering to ensure quality and originality.',
  },
  {
    question: 'Can I request a rush delivery?',
    answer:
      'Yes. Rush fees apply based on turnaround time. Contact us for a rush quote. Premium packages and subscriptions may qualify for priority production at no extra cost.',
  },
  {
    question: 'What happens after I order?',
    answer:
      'After payment, you\'ll receive a project brief to complete (brand details, mood, references). We\'ll produce your content and send you a draft within the stated timeline. You can request revisions (within your plan). Once approved, we deliver the final files and licensing terms.',
  },
]

export const soundLabsProductionSteps = [
  {
    number: 1,
    title: 'Discovery & Brand Interview',
    description: 'We learn your story, audience, and vision in a focused conversation',
  },
  {
    number: 2,
    title: 'Concept, Lyrics & Direction',
    description: 'Outline the song concept, mood, and creative direction',
  },
  {
    number: 3,
    title: 'Production, Vocals & Mastering',
    description: 'Record, arrange, mix, and master your professional audio',
  },
  {
    number: 4,
    title: 'Visuals & Campaign Assets',
    description: 'Create video, cover art, and social media cuts',
  },
  {
    number: 5,
    title: 'Delivery, Approval & Launch',
    description: 'Final review, licensing, and launch support',
  },
]

export const soundLabsTrustFeatures = [
  { label: 'Original Music', description: 'Custom-composed every time' },
  { label: 'Commercial License Included', description: 'Use rights for your business' },
  { label: 'Professional Quality', description: 'Studio-grade mixing and mastering' },
  { label: 'Fast Turnaround', description: '5–21 days depending on package' },
  { label: 'Unlimited Revisions', description: 'Within package scope' },
  { label: 'Human-Guided Production', description: 'AI + creativity working together' },
]

export const soundLabsFormFields = [
  { name: 'name', label: 'Your Name', type: 'text', required: true },
  { name: 'business', label: 'Business/Brand Name', type: 'text', required: false },
  { name: 'email', label: 'Email Address', type: 'email', required: true },
  { name: 'phone', label: 'Phone (optional)', type: 'tel', required: false },
  { name: 'projectType', label: 'Project Type', type: 'select', required: true, options: [
    { value: '', label: 'Select a project type...' },
    { value: 'song', label: 'Original Song' },
    { value: 'jingle', label: 'Jingle or Ad Music' },
    { value: 'branding', label: 'Audio Branding' },
    { value: 'video', label: 'Music Video Content' },
    { value: 'event', label: 'Event Music' },
    { value: 'other', label: 'Something Else' },
  ] },
  { name: 'packageInterest', label: 'Package Interest', type: 'select', required: true, options: [
    { value: '', label: 'Select a package...' },
    { value: 'starter', label: 'Starter ($99–$199)' },
    { value: 'business', label: 'Business ($399–$799)' },
    { value: 'premium', label: 'Premium ($1,000–$5,000+)' },
    { value: 'subscription', label: 'Monthly Subscription ($99–$299/month)' },
    { value: 'unsure', label: 'Not sure yet' },
  ] },
  { name: 'deadline', label: 'Ideal Delivery Timeline', type: 'select', required: true, options: [
    { value: '', label: 'Select a timeline...' },
    { value: 'asap', label: 'ASAP (1–2 weeks)' },
    { value: 'normal', label: 'Normal (2–3 weeks)' },
    { value: 'flexible', label: 'Flexible (3+ weeks)' },
  ] },
  { name: 'budget', label: 'Budget Range', type: 'select', required: false, options: [
    { value: '', label: 'Select a range...' },
    { value: 'under500', label: 'Under $500' },
    { value: '500to1000', label: '$500–$1,000' },
    { value: '1000plus', label: '$1,000+' },
  ] },
  { name: 'direction', label: 'Creative Direction / Mood', type: 'textarea', required: true, placeholder: 'Describe the vibe, genre, or mood you want. Share any references or inspirations.' },
  { name: 'references', label: 'Reference Links (optional)', type: 'text', placeholder: 'URLs to artists, songs, brands you admire' },
  { name: 'consent', label: 'I consent to be contacted about my project', type: 'checkbox', required: true },
]
