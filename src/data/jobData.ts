import { Job } from '../types';

export const INITIAL_JOBS: Job[] = [
  // Primary Scenario Active Job
  {
    id: 'job-scenario-01',
    title: 'Emergency Main Pipe Burst & Valve Rupture',
    service: 'Plumbing',
    category: 'Plumbing & Water Systems',
    requiredSkills: ['Plumbing'],
    latitude: 12.9716, // Center of Area A - Indiranagar (100 Feet Rd)
    longitude: 77.6412,
    location: 'Area A - Indiranagar',
    customerName: 'Smt. Shanti Murthy',
    customerPhone: '+91 98440 33219',
    scheduledTime: 'Today, Immediate (Within 1 hr)',
    status: 'pending',
    estimatedValue: 750,
    urgency: 'high',
    createdAt: '2026-09-08T06:05:00.000Z'
  },
  {
    id: 'job-02',
    title: 'Main MCB Tripping & Short Circuit Inspection',
    service: 'Electrical',
    category: 'Electrical & Power',
    requiredSkills: ['Electrical'],
    latitude: 12.9352,
    longitude: 77.6245,
    location: 'Area B - Koramangala',
    customerName: 'Rajesh Nair',
    customerPhone: '+91 97410 88214',
    scheduledTime: 'Today, 2:00 PM',
    status: 'pending',
    estimatedValue: 600,
    urgency: 'medium',
    createdAt: '2026-09-08T05:30:00.000Z'
  },
  {
    id: 'job-03',
    title: 'Full 3BHK Post-Tenant Deep Cleaning',
    service: 'Cleaning',
    category: 'Home & Sanitation',
    requiredSkills: ['Cleaning'],
    latitude: 12.9698,
    longitude: 77.7499,
    location: 'Area C - Whitefield',
    customerName: 'Ananya Deshmukh',
    customerPhone: '+91 98860 11928',
    scheduledTime: 'Tomorrow, 9:30 AM',
    status: 'pending',
    estimatedValue: 1800,
    urgency: 'standard',
    createdAt: '2026-09-08T04:45:00.000Z'
  },
  {
    id: 'job-04',
    title: 'Teak Dining Chair Repair & Lock Replacement',
    service: 'Carpentry',
    category: 'Carpentry & Woodwork',
    requiredSkills: ['Carpentry'],
    latitude: 12.9121,
    longitude: 77.6446,
    location: 'Area D - HSR Layout',
    customerName: 'Prof. Venkatraman',
    customerPhone: '+91 94481 66520',
    scheduledTime: 'Today, 4:30 PM',
    status: 'pending',
    estimatedValue: 950,
    urgency: 'medium',
    createdAt: '2026-09-08T05:15:00.000Z'
  }
];
