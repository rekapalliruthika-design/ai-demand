import { DemandRecord } from '../types';

export const COOPERATIVE_AREAS = [
  { id: 'area-a', name: 'Area A - Indiranagar', lat: 12.9716, lng: 77.6412, zone: 'East Hub' },
  { id: 'area-b', name: 'Area B - Koramangala', lat: 12.9352, lng: 77.6245, zone: 'South-East Hub' },
  { id: 'area-c', name: 'Area C - Whitefield', lat: 12.9698, lng: 77.7499, zone: 'Tech Corridor Hub' },
  { id: 'area-d', name: 'Area D - HSR Layout', lat: 12.9121, lng: 77.6446, zone: 'South Hub' },
  { id: 'area-e', name: 'Area E - Jayanagar', lat: 12.9250, lng: 77.5938, zone: 'Central-South Hub' },
  { id: 'area-f', name: 'Area F - Malleshwaram', lat: 13.0031, lng: 77.5643, zone: 'North-West Hub' }
];

export const SERVICE_CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Cleaning',
  'Carpentry',
  'Painting',
  'Appliance Repair',
  'Gardening',
  'Masonry',
  'Driving/Transport'
];

/**
 * 60+ Realistic historical demand records spanning recent weeks
 * Includes variations in day of week, monsoon/weather effects, festival season demand,
 * completed vs cancelled requests, and response times.
 */
export const MOCK_DEMAND_HISTORY: DemandRecord[] = [
  // Area A - Plumbing (Consistently high demand in older residential piping & rainy weather)
  { id: 'hist-01', date: '2026-08-10', dayOfWeek: 'Mon', service: 'Plumbing', location: 'Area A - Indiranagar', requests: 28, completed: 25, cancelled: 3, avgResponseTimeMinutes: 24, isHolidayOrWeekend: false, weatherCondition: 'Rainy' },
  { id: 'hist-02', date: '2026-08-11', dayOfWeek: 'Tue', service: 'Plumbing', location: 'Area A - Indiranagar', requests: 26, completed: 24, cancelled: 2, avgResponseTimeMinutes: 22, isHolidayOrWeekend: false, weatherCondition: 'Cloudy' },
  { id: 'hist-03', date: '2026-08-12', dayOfWeek: 'Wed', service: 'Plumbing', location: 'Area A - Indiranagar', requests: 30, completed: 27, cancelled: 3, avgResponseTimeMinutes: 28, isHolidayOrWeekend: false, weatherCondition: 'Thunderstorm' },
  { id: 'hist-04', date: '2026-08-13', dayOfWeek: 'Thu', service: 'Plumbing', location: 'Area A - Indiranagar', requests: 29, completed: 26, cancelled: 3, avgResponseTimeMinutes: 26, isHolidayOrWeekend: false, weatherCondition: 'Rainy' },
  { id: 'hist-05', date: '2026-08-14', dayOfWeek: 'Fri', service: 'Plumbing', location: 'Area A - Indiranagar', requests: 33, completed: 30, cancelled: 3, avgResponseTimeMinutes: 21, isHolidayOrWeekend: false, weatherCondition: 'Clear' },
  { id: 'hist-06', date: '2026-08-15', dayOfWeek: 'Sat', service: 'Plumbing', location: 'Area A - Indiranagar', requests: 38, completed: 34, cancelled: 4, avgResponseTimeMinutes: 19, isHolidayOrWeekend: true, weatherCondition: 'Clear' },
  { id: 'hist-07', date: '2026-08-16', dayOfWeek: 'Sun', service: 'Plumbing', location: 'Area A - Indiranagar', requests: 36, completed: 32, cancelled: 4, avgResponseTimeMinutes: 20, isHolidayOrWeekend: true, weatherCondition: 'Light Rain' },
  
  // Area A - Recent Week (Shows 32+ projected demand trend)
  { id: 'hist-08', date: '2026-08-17', dayOfWeek: 'Mon', service: 'Plumbing', location: 'Area A - Indiranagar', requests: 31, completed: 28, cancelled: 3, avgResponseTimeMinutes: 23, isHolidayOrWeekend: false, weatherCondition: 'Rainy' },
  { id: 'hist-09', date: '2026-08-18', dayOfWeek: 'Tue', service: 'Plumbing', location: 'Area A - Indiranagar', requests: 29, completed: 27, cancelled: 2, avgResponseTimeMinutes: 20, isHolidayOrWeekend: false, weatherCondition: 'Rainy' },
  { id: 'hist-10', date: '2026-08-19', dayOfWeek: 'Wed', service: 'Plumbing', location: 'Area A - Indiranagar', requests: 34, completed: 30, cancelled: 4, avgResponseTimeMinutes: 25, isHolidayOrWeekend: false, weatherCondition: 'Heavy Rain' },
  { id: 'hist-11', date: '2026-08-20', dayOfWeek: 'Thu', service: 'Plumbing', location: 'Area A - Indiranagar', requests: 32, completed: 29, cancelled: 3, avgResponseTimeMinutes: 22, isHolidayOrWeekend: false, weatherCondition: 'Rainy' },
  { id: 'hist-12', date: '2026-08-21', dayOfWeek: 'Fri', service: 'Plumbing', location: 'Area A - Indiranagar', requests: 35, completed: 32, cancelled: 3, avgResponseTimeMinutes: 20, isHolidayOrWeekend: false, weatherCondition: 'Cloudy' },
  { id: 'hist-13', date: '2026-08-22', dayOfWeek: 'Sat', service: 'Plumbing', location: 'Area A - Indiranagar', requests: 41, completed: 37, cancelled: 4, avgResponseTimeMinutes: 18, isHolidayOrWeekend: true, weatherCondition: 'Clear' },
  { id: 'hist-14', date: '2026-08-23', dayOfWeek: 'Sun', service: 'Plumbing', location: 'Area A - Indiranagar', requests: 39, completed: 35, cancelled: 4, avgResponseTimeMinutes: 19, isHolidayOrWeekend: true, weatherCondition: 'Cloudy' },

  // Area B - Electrical (Surging due to monsoon power trippings and AC servicing)
  { id: 'hist-15', date: '2026-08-10', dayOfWeek: 'Mon', service: 'Electrical', location: 'Area B - Koramangala', requests: 22, completed: 20, cancelled: 2, avgResponseTimeMinutes: 25, isHolidayOrWeekend: false, weatherCondition: 'Rainy' },
  { id: 'hist-16', date: '2026-08-11', dayOfWeek: 'Tue', service: 'Electrical', location: 'Area B - Koramangala', requests: 24, completed: 22, cancelled: 2, avgResponseTimeMinutes: 22, isHolidayOrWeekend: false, weatherCondition: 'Cloudy' },
  { id: 'hist-17', date: '2026-08-12', dayOfWeek: 'Wed', service: 'Electrical', location: 'Area B - Koramangala', requests: 26, completed: 24, cancelled: 2, avgResponseTimeMinutes: 24, isHolidayOrWeekend: false, weatherCondition: 'Thunderstorm' },
  { id: 'hist-18', date: '2026-08-13', dayOfWeek: 'Thu', service: 'Electrical', location: 'Area B - Koramangala', requests: 25, completed: 23, cancelled: 2, avgResponseTimeMinutes: 21, isHolidayOrWeekend: false, weatherCondition: 'Clear' },
  { id: 'hist-19', date: '2026-08-14', dayOfWeek: 'Fri', service: 'Electrical', location: 'Area B - Koramangala', requests: 28, completed: 25, cancelled: 3, avgResponseTimeMinutes: 23, isHolidayOrWeekend: false, weatherCondition: 'Clear' },
  { id: 'hist-20', date: '2026-08-15', dayOfWeek: 'Sat', service: 'Electrical', location: 'Area B - Koramangala', requests: 32, completed: 29, cancelled: 3, avgResponseTimeMinutes: 18, isHolidayOrWeekend: true, weatherCondition: 'Clear' },
  { id: 'hist-21', date: '2026-08-16', dayOfWeek: 'Sun', service: 'Electrical', location: 'Area B - Koramangala', requests: 30, completed: 28, cancelled: 2, avgResponseTimeMinutes: 19, isHolidayOrWeekend: true, weatherCondition: 'Clear' },
  { id: 'hist-22', date: '2026-08-17', dayOfWeek: 'Mon', service: 'Electrical', location: 'Area B - Koramangala', requests: 25, completed: 23, cancelled: 2, avgResponseTimeMinutes: 22, isHolidayOrWeekend: false, weatherCondition: 'Rainy' },
  { id: 'hist-23', date: '2026-08-18', dayOfWeek: 'Tue', service: 'Electrical', location: 'Area B - Koramangala', requests: 27, completed: 25, cancelled: 2, avgResponseTimeMinutes: 20, isHolidayOrWeekend: false, weatherCondition: 'Cloudy' },
  { id: 'hist-24', date: '2026-08-19', dayOfWeek: 'Wed', service: 'Electrical', location: 'Area B - Koramangala', requests: 29, completed: 26, cancelled: 3, avgResponseTimeMinutes: 23, isHolidayOrWeekend: false, weatherCondition: 'Thunderstorm' },

  // Area C - Cleaning (High weekend spike in Tech Hub apartment complexes)
  { id: 'hist-25', date: '2026-08-10', dayOfWeek: 'Mon', service: 'Cleaning', location: 'Area C - Whitefield', requests: 14, completed: 13, cancelled: 1, avgResponseTimeMinutes: 30, isHolidayOrWeekend: false, weatherCondition: 'Clear' },
  { id: 'hist-26', date: '2026-08-11', dayOfWeek: 'Tue', service: 'Cleaning', location: 'Area C - Whitefield', requests: 15, completed: 14, cancelled: 1, avgResponseTimeMinutes: 28, isHolidayOrWeekend: false, weatherCondition: 'Clear' },
  { id: 'hist-27', date: '2026-08-12', dayOfWeek: 'Wed', service: 'Cleaning', location: 'Area C - Whitefield', requests: 16, completed: 15, cancelled: 1, avgResponseTimeMinutes: 26, isHolidayOrWeekend: false, weatherCondition: 'Cloudy' },
  { id: 'hist-28', date: '2026-08-13', dayOfWeek: 'Thu', service: 'Cleaning', location: 'Area C - Whitefield', requests: 18, completed: 16, cancelled: 2, avgResponseTimeMinutes: 27, isHolidayOrWeekend: false, weatherCondition: 'Clear' },
  { id: 'hist-29', date: '2026-08-14', dayOfWeek: 'Fri', service: 'Cleaning', location: 'Area C - Whitefield', requests: 22, completed: 20, cancelled: 2, avgResponseTimeMinutes: 24, isHolidayOrWeekend: false, weatherCondition: 'Clear' },
  { id: 'hist-30', date: '2026-08-15', dayOfWeek: 'Sat', service: 'Cleaning', location: 'Area C - Whitefield', requests: 28, completed: 25, cancelled: 3, avgResponseTimeMinutes: 21, isHolidayOrWeekend: true, weatherCondition: 'Clear' },
  { id: 'hist-31', date: '2026-08-16', dayOfWeek: 'Sun', service: 'Cleaning', location: 'Area C - Whitefield', requests: 26, completed: 24, cancelled: 2, avgResponseTimeMinutes: 22, isHolidayOrWeekend: true, weatherCondition: 'Clear' },
  { id: 'hist-32', date: '2026-08-17', dayOfWeek: 'Mon', service: 'Cleaning', location: 'Area C - Whitefield', requests: 17, completed: 15, cancelled: 2, avgResponseTimeMinutes: 29, isHolidayOrWeekend: false, weatherCondition: 'Clear' },
  { id: 'hist-33', date: '2026-08-18', dayOfWeek: 'Tue', service: 'Cleaning', location: 'Area C - Whitefield', requests: 18, completed: 17, cancelled: 1, avgResponseTimeMinutes: 25, isHolidayOrWeekend: false, weatherCondition: 'Clear' },
  { id: 'hist-34', date: '2026-08-19', dayOfWeek: 'Wed', service: 'Cleaning', location: 'Area C - Whitefield', requests: 21, completed: 19, cancelled: 2, avgResponseTimeMinutes: 26, isHolidayOrWeekend: false, weatherCondition: 'Clear' },

  // Area D - Carpentry (Steady residential demand, furniture fitting)
  { id: 'hist-35', date: '2026-08-10', dayOfWeek: 'Mon', service: 'Carpentry', location: 'Area D - HSR Layout', requests: 12, completed: 11, cancelled: 1, avgResponseTimeMinutes: 35, isHolidayOrWeekend: false, weatherCondition: 'Clear' },
  { id: 'hist-36', date: '2026-08-11', dayOfWeek: 'Tue', service: 'Carpentry', location: 'Area D - HSR Layout', requests: 14, completed: 13, cancelled: 1, avgResponseTimeMinutes: 32, isHolidayOrWeekend: false, weatherCondition: 'Clear' },
  { id: 'hist-37', date: '2026-08-12', dayOfWeek: 'Wed', service: 'Carpentry', location: 'Area D - HSR Layout', requests: 13, completed: 12, cancelled: 1, avgResponseTimeMinutes: 33, isHolidayOrWeekend: false, weatherCondition: 'Cloudy' },
  { id: 'hist-38', date: '2026-08-13', dayOfWeek: 'Thu', service: 'Carpentry', location: 'Area D - HSR Layout', requests: 15, completed: 14, cancelled: 1, avgResponseTimeMinutes: 30, isHolidayOrWeekend: false, weatherCondition: 'Clear' },
  { id: 'hist-39', date: '2026-08-14', dayOfWeek: 'Fri', service: 'Carpentry', location: 'Area D - HSR Layout', requests: 17, completed: 15, cancelled: 2, avgResponseTimeMinutes: 31, isHolidayOrWeekend: false, weatherCondition: 'Clear' },
  { id: 'hist-40', date: '2026-08-15', dayOfWeek: 'Sat', service: 'Carpentry', location: 'Area D - HSR Layout', requests: 19, completed: 17, cancelled: 2, avgResponseTimeMinutes: 28, isHolidayOrWeekend: true, weatherCondition: 'Clear' },
  { id: 'hist-41', date: '2026-08-16', dayOfWeek: 'Sun', service: 'Carpentry', location: 'Area D - HSR Layout', requests: 16, completed: 15, cancelled: 1, avgResponseTimeMinutes: 29, isHolidayOrWeekend: true, weatherCondition: 'Clear' },
  { id: 'hist-42', date: '2026-08-17', dayOfWeek: 'Mon', service: 'Carpentry', location: 'Area D - HSR Layout', requests: 13, completed: 12, cancelled: 1, avgResponseTimeMinutes: 34, isHolidayOrWeekend: false, weatherCondition: 'Clear' },
  { id: 'hist-43', date: '2026-08-18', dayOfWeek: 'Tue', service: 'Carpentry', location: 'Area D - HSR Layout', requests: 15, completed: 14, cancelled: 1, avgResponseTimeMinutes: 30, isHolidayOrWeekend: false, weatherCondition: 'Clear' },

  // Area E - Painting & Gardening
  { id: 'hist-44', date: '2026-08-12', dayOfWeek: 'Wed', service: 'Painting', location: 'Area E - Jayanagar', requests: 9, completed: 8, cancelled: 1, avgResponseTimeMinutes: 40, isHolidayOrWeekend: false, weatherCondition: 'Clear' },
  { id: 'hist-45', date: '2026-08-13', dayOfWeek: 'Thu', service: 'Painting', location: 'Area E - Jayanagar', requests: 11, completed: 10, cancelled: 1, avgResponseTimeMinutes: 38, isHolidayOrWeekend: false, weatherCondition: 'Clear' },
  { id: 'hist-46', date: '2026-08-14', dayOfWeek: 'Fri', service: 'Painting', location: 'Area E - Jayanagar', requests: 12, completed: 11, cancelled: 1, avgResponseTimeMinutes: 36, isHolidayOrWeekend: false, weatherCondition: 'Clear' },
  { id: 'hist-47', date: '2026-08-15', dayOfWeek: 'Sat', service: 'Painting', location: 'Area E - Jayanagar', requests: 15, completed: 13, cancelled: 2, avgResponseTimeMinutes: 32, isHolidayOrWeekend: true, weatherCondition: 'Clear' },
  { id: 'hist-48', date: '2026-08-16', dayOfWeek: 'Sun', service: 'Gardening', location: 'Area E - Jayanagar', requests: 14, completed: 13, cancelled: 1, avgResponseTimeMinutes: 28, isHolidayOrWeekend: true, weatherCondition: 'Clear' },
  { id: 'hist-49', date: '2026-08-17', dayOfWeek: 'Mon', service: 'Gardening', location: 'Area E - Jayanagar', requests: 10, completed: 9, cancelled: 1, avgResponseTimeMinutes: 30, isHolidayOrWeekend: false, weatherCondition: 'Cloudy' },

  // Area F - Appliance Repair (AC, Microwave, Refrigerator)
  { id: 'hist-50', date: '2026-08-12', dayOfWeek: 'Wed', service: 'Appliance Repair', location: 'Area F - Malleshwaram', requests: 14, completed: 13, cancelled: 1, avgResponseTimeMinutes: 28, isHolidayOrWeekend: false, weatherCondition: 'Warm' },
  { id: 'hist-51', date: '2026-08-13', dayOfWeek: 'Thu', service: 'Appliance Repair', location: 'Area F - Malleshwaram', requests: 16, completed: 15, cancelled: 1, avgResponseTimeMinutes: 25, isHolidayOrWeekend: false, weatherCondition: 'Warm' },
  { id: 'hist-52', date: '2026-08-14', dayOfWeek: 'Fri', service: 'Appliance Repair', location: 'Area F - Malleshwaram', requests: 18, completed: 16, cancelled: 2, avgResponseTimeMinutes: 24, isHolidayOrWeekend: false, weatherCondition: 'Warm' },
  { id: 'hist-53', date: '2026-08-15', dayOfWeek: 'Sat', service: 'Appliance Repair', location: 'Area F - Malleshwaram', requests: 22, completed: 20, cancelled: 2, avgResponseTimeMinutes: 20, isHolidayOrWeekend: true, weatherCondition: 'Warm' },
  { id: 'hist-54', date: '2026-08-16', dayOfWeek: 'Sun', service: 'Appliance Repair', location: 'Area F - Malleshwaram', requests: 20, completed: 18, cancelled: 2, avgResponseTimeMinutes: 21, isHolidayOrWeekend: true, weatherCondition: 'Warm' },
  { id: 'hist-55', date: '2026-08-17', dayOfWeek: 'Mon', service: 'Appliance Repair', location: 'Area F - Malleshwaram', requests: 16, completed: 15, cancelled: 1, avgResponseTimeMinutes: 25, isHolidayOrWeekend: false, weatherCondition: 'Warm' },

  // Additional multi-location records
  { id: 'hist-56', date: '2026-08-17', dayOfWeek: 'Mon', service: 'Masonry', location: 'Area A - Indiranagar', requests: 8, completed: 7, cancelled: 1, avgResponseTimeMinutes: 45, isHolidayOrWeekend: false, weatherCondition: 'Clear' },
  { id: 'hist-57', date: '2026-08-18', dayOfWeek: 'Tue', service: 'Masonry', location: 'Area A - Indiranagar', requests: 9, completed: 8, cancelled: 1, avgResponseTimeMinutes: 40, isHolidayOrWeekend: false, weatherCondition: 'Clear' },
  { id: 'hist-58', date: '2026-08-17', dayOfWeek: 'Mon', service: 'Driving/Transport', location: 'Area B - Koramangala', requests: 19, completed: 18, cancelled: 1, avgResponseTimeMinutes: 18, isHolidayOrWeekend: false, weatherCondition: 'Clear' },
  { id: 'hist-59', date: '2026-08-18', dayOfWeek: 'Tue', service: 'Driving/Transport', location: 'Area B - Koramangala', requests: 21, completed: 20, cancelled: 1, avgResponseTimeMinutes: 17, isHolidayOrWeekend: false, weatherCondition: 'Clear' },
  { id: 'hist-60', date: '2026-08-19', dayOfWeek: 'Wed', service: 'Driving/Transport', location: 'Area B - Koramangala', requests: 22, completed: 20, cancelled: 2, avgResponseTimeMinutes: 19, isHolidayOrWeekend: false, weatherCondition: 'Clear' },
  { id: 'hist-61', date: '2026-08-20', dayOfWeek: 'Thu', service: 'Plumbing', location: 'Area B - Koramangala', requests: 18, completed: 17, cancelled: 1, avgResponseTimeMinutes: 22, isHolidayOrWeekend: false, weatherCondition: 'Rainy' },
  { id: 'hist-62', date: '2026-08-21', dayOfWeek: 'Fri', service: 'Electrical', location: 'Area A - Indiranagar', requests: 20, completed: 19, cancelled: 1, avgResponseTimeMinutes: 21, isHolidayOrWeekend: false, weatherCondition: 'Clear' }
];
