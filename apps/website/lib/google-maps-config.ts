/**
 * Google Maps Configuration for Knight Wing Crime Radar
 * Greensboro, NC incident mapping with RTL-SDR signal visualization
 */

export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';

// Greensboro, NC coordinates
export const GREENSBORO_CENTER = {
  lat: parseFloat(process.env.NEXT_PUBLIC_MAPS_CENTER_LAT || '36.0726'),
  lng: parseFloat(process.env.NEXT_PUBLIC_MAPS_CENTER_LNG || '-79.7920'),
};

export const DEFAULT_ZOOM = parseInt(process.env.NEXT_PUBLIC_MAPS_ZOOM || '13');

/**
 * Crime Radar Watch Zones
 * Defined zones with different threat levels and monitoring priorities
 */
export const WATCH_ZONES = [
  {
    id: 'zone-1-downtown',
    name: 'Zone 1: Downtown Greensboro',
    center: { lat: 36.0726, lng: -79.7920 },
    radius: 1.2, // miles
    color: '#FF0000', // Red - High Priority
    markerColor: '#FF0000',
    threatLevel: 'HIGH',
    description: 'Downtown core, highest incident density',
  },
  {
    id: 'zone-2-north',
    name: 'Zone 2: Residential North',
    center: { lat: 36.1200, lng: -79.7920 },
    radius: 2.5,
    color: '#FF8C00', // Orange - Medium Priority
    markerColor: '#FF8C00',
    threatLevel: 'MEDIUM',
    description: 'Northern residential neighborhoods',
  },
  {
    id: 'zone-3-south',
    name: 'Zone 3: Residential South',
    center: { lat: 36.0250, lng: -79.7920 },
    radius: 2.5,
    color: '#FF8C00', // Orange - Medium Priority
    markerColor: '#FF8C00',
    threatLevel: 'MEDIUM',
    description: 'Southern residential neighborhoods',
  },
  {
    id: 'zone-4-i40',
    name: 'Zone 4: I-40 Corridor',
    center: { lat: 36.0726, lng: -79.6500 },
    radius: 1.5,
    color: '#FFFF00', // Yellow - Low-Medium Priority
    markerColor: '#FFFF00',
    threatLevel: 'LOW',
    description: 'Interstate 40 and major routes',
  },
  {
    id: 'zone-5-uncg',
    name: 'Zone 5: UNCG Campus',
    center: { lat: 36.0693, lng: -79.8193 },
    radius: 1.2,
    color: '#0000FF', // Blue - Special Monitoring
    markerColor: '#0000FF',
    threatLevel: 'ELEVATED',
    description: 'University of North Carolina at Greensboro',
  },
  {
    id: 'zone-6-commercial',
    name: 'Zone 6: Commercial District',
    center: { lat: 36.0900, lng: -79.7500 },
    radius: 2.0,
    color: '#00FF00', // Green - Standard Monitoring
    markerColor: '#00FF00',
    threatLevel: 'LOW',
    description: 'Commercial and retail areas',
  },
];

/**
 * RTL-SDR Frequency Classifications
 * Color coding for different signal types
 */
export const SIGNAL_CLASSIFICATIONS = {
  POLICE: {
    name: 'Police Radio',
    frequency: 461.1625,
    frequencyRange: { min: 461.0, max: 461.3 },
    color: '#FF0000',
    markerIcon: '🚔',
    priority: 'CRITICAL',
  },
  FIRE_EMS: {
    name: 'Fire/EMS Radio',
    frequency: 463.5,
    frequencyRange: { min: 463.0, max: 464.0 },
    color: '#FF6600',
    markerIcon: '🚒',
    priority: 'HIGH',
  },
  PUBLIC_SAFETY: {
    name: 'Public Safety',
    frequencyRange: { min: 410, max: 480 },
    color: '#FFFF00',
    markerIcon: '⚠️',
    priority: 'MEDIUM',
  },
  CELLULAR: {
    name: 'Cellular',
    frequencyRange: { min: 824, max: 1990 },
    color: '#00CCFF',
    markerIcon: '📱',
    priority: 'LOW',
  },
  FM_RADIO: {
    name: 'FM Radio',
    frequencyRange: { min: 88, max: 108 },
    color: '#00FF00',
    markerIcon: '📻',
    priority: 'LOW',
  },
  CIVILIAN: {
    name: 'Civilian/Other',
    color: '#0066FF',
    markerIcon: '📡',
    priority: 'LOW',
  },
};

/**
 * Signal strength to visual representation
 */
export const SIGNAL_STRENGTH_LEVELS = {
  VERY_STRONG: { threshold: -30, label: 'Very Strong', opacity: 1.0, size: 12 },
  STRONG: { threshold: -50, label: 'Strong', opacity: 0.8, size: 10 },
  MODERATE: { threshold: -70, label: 'Moderate', opacity: 0.6, size: 8 },
  WEAK: { threshold: -90, label: 'Weak', opacity: 0.4, size: 6 },
  VERY_WEAK: { threshold: -120, label: 'Very Weak', opacity: 0.2, size: 4 },
};

/**
 * Map styling options
 */
export const MAP_STYLES = {
  DARK: [
    {
      elementType: 'geometry',
      stylers: [{ color: '#242f3e' }],
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#242f3e' }],
    },
    {
      elementType: 'labels.text.fill',
      stylers: [{ color: '#746855' }],
    },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#263c3f' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#6b9080' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#38414e' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#212a37' }],
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9ca5b3' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#746855' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#1f2835' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#f3751ff' }],
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#2f3948' }],
    },
    {
      featureType: 'transit.station',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#17263c' }],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#515c6d' }],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#17263c' }],
    },
  ],
};

/**
 * Heat map configuration for RTL-SDR signals
 */
export const HEATMAP_CONFIG = {
  radius: 30,
  blur: 15,
  maxIntensity: 100,
  dissipatingHeatmap: true,
};

/**
 * Map update intervals (milliseconds)
 */
export const UPDATE_INTERVALS = {
  SPECTRUM: 10000, // 10 seconds - spectrum data
  INCIDENTS: 10000, // 10 seconds - incident data
  SIGNALS: 5000, // 5 seconds - signal data
  ZOOM_ANIMATE: 300, // 300ms - zoom animation
};

/**
 * Historical trail configuration
 */
export const TRAIL_CONFIG = {
  maxAge: 5 * 60 * 1000, // 5 minutes
  updateInterval: 1000, // 1 second
  opacity: 0.3,
};

/**
 * Incident marker icons and colors
 */
export const INCIDENT_TYPES = {
  POLICE: { icon: '🚔', color: '#FF0000', priority: 'CRITICAL' },
  FIRE: { icon: '🚒', color: '#FF6600', priority: 'CRITICAL' },
  EMS: { icon: '🚑', color: '#FF9900', priority: 'HIGH' },
  ROBBERY: { icon: '🔓', color: '#FF0000', priority: 'CRITICAL' },
  SHOOTING: { icon: '💥', color: '#FF0000', priority: 'CRITICAL' },
  ACCIDENT: { icon: '🚗', color: '#FFCC00', priority: 'MEDIUM' },
  HAZMAT: { icon: '☣️', color: '#FF3300', priority: 'CRITICAL' },
  OTHER: { icon: '📍', color: '#CCCCCC', priority: 'LOW' },
};

/**
 * Time range presets for historical data
 */
export const TIME_RANGES = [
  { label: 'Last Hour', value: 1 * 60 * 60 * 1000 },
  { label: 'Last 6 Hours', value: 6 * 60 * 60 * 1000 },
  { label: 'Last 24 Hours', value: 24 * 60 * 60 * 1000 },
  { label: 'All Time', value: null },
];

/**
 * Export configurations for incident maps
 */
export const EXPORT_FORMATS = ['PNG', 'PDF', 'GeoJSON'];
