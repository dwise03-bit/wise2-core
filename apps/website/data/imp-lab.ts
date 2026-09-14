export const impTracks = [
  { name: 'Learner IMP', color: '#00a8ff', role: 'Personalized learning and practice', href: '#learner' },
  { name: 'Creator IMP', color: '#8cff00', role: 'STEM, design and creative projects', href: '#creator' },
  { name: 'Guide IMP', color: '#ff3131', role: 'Mentoring, planning and future readiness', href: '#guide' },
  { name: 'Safe IMP', color: '#e23cff', role: 'Wellbeing, connection and trusted support', href: '#safe' },
  { name: 'Team IMP', color: '#ffc928', role: 'Leadership, collaboration and achievement', href: '#team' },
] as const;

export const impCourses = [
  { title: 'Start Here: Meet Your IMP', track: 'Learner', progress: 80 },
  { title: 'Build Your First AI Workflow', track: 'Creator', progress: 45 },
  { title: 'Quest XR IMP Lab', track: 'Guide', progress: 20 },
  { title: 'Digital Safety + Privacy', track: 'Safe', progress: 60 },
  { title: 'Team Challenge: Ship It', track: 'Team', progress: 10 },
] as const;

export const impEvents = [
  { day: 'MON', title: 'IMP Builder Lab', time: '4:00 PM' },
  { day: 'WED', title: 'Quest XR Lab', time: '5:30 PM' },
  { day: 'FRI', title: 'Community Showcase', time: '6:00 PM' },
] as const;
