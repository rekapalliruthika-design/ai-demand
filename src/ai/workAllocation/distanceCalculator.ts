/**
 * Distance Calculator using the Great-Circle Haversine Formula
 * Computes deterministic distance in kilometers between two geographic coordinates.
 * 
 * Later this can be replaced with a real maps/geolocation service (e.g. Google Maps Distance Matrix API)
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Round to 1 decimal place
  return Math.round(distance * 10) / 10;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Normalizes distance to a 0-100 score.
 * Close proximity (<= 1km) gets ~95-100.
 * Moderate proximity (2-3km) gets ~80-90.
 * Long distance (> 12km) approaches 0.
 */
export function calculateDistanceScore(distanceKm: number, maxRadiusKm: number = 15): number {
  if (distanceKm <= 0.5) return 100;
  if (distanceKm >= maxRadiusKm) return 10;

  // Linear decay with sweet spot in first 5km
  const score = Math.max(10, Math.round(100 - (distanceKm / maxRadiusKm) * 85));
  return score;
}
