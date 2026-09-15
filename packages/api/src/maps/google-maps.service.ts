import { Injectable, Logger } from '@nestjs/common';

interface Location {
  latitude: number;
  longitude: number;
}

interface Route {
  distance: number; // meters
  duration: number; // seconds
  polyline: string;
  steps: RouteStep[];
}

interface RouteStep {
  distance: number;
  duration: number;
  instruction: string;
}

interface GeocodeResult {
  latitude: number;
  longitude: number;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
}

@Injectable()
export class GoogleMapsService {
  private readonly logger = new Logger('GoogleMapsService');
  private apiKey = process.env.GOOGLE_MAPS_API_KEY;
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api';

  /**
   * Get directions between two locations
   * @param origin Start location (latitude,longitude or address)
   * @param destination End location
   * @param options Routing options (mode, departure_time, etc.)
   */
  async getDirections(
    origin: string | Location,
    destination: string | Location,
    options?: {
      mode?: 'driving' | 'walking' | 'bicycling' | 'transit';
      departureTime?: number;
      avoidTolls?: boolean;
      avoidHighways?: boolean;
    }
  ): Promise<Route> {
    if (!this.apiKey) {
      this.logger.error('GOOGLE_MAPS_API_KEY not configured');
      throw new Error('Google Maps API not configured');
    }

    const originStr = typeof origin === 'string' ? origin : `${origin.latitude},${origin.longitude}`;
    const destinationStr = typeof destination === 'string' ? destination : `${destination.latitude},${destination.longitude}`;

    const params = new URLSearchParams({
      origin: originStr,
      destination: destinationStr,
      key: this.apiKey,
      mode: options?.mode || 'driving',
    });

    if (options?.departureTime) {
      params.append('departure_time', options.departureTime.toString());
    }
    if (options?.avoidTolls) {
      params.append('avoid', 'tolls');
    }
    if (options?.avoidHighways) {
      params.append('avoid', 'highways');
    }

    try {
      const response = await fetch(`${this.baseUrl}/directions/json?${params}`);
      const data: any = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Directions API error: ${data.status} - ${data.error_message || ''}`);
      }

      const route = data.routes[0];
      const leg = route.legs[0];

      return {
        distance: leg.distance.value,
        duration: leg.duration.value,
        polyline: route.overview_polyline.points,
        steps: leg.steps.map((step: any) => ({
          distance: step.distance.value,
          duration: step.duration.value,
          instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
        })),
      };
    } catch (error) {
      this.logger.error(`Failed to get directions: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Calculate distance matrix between multiple origins and destinations
   */
  async getDistanceMatrix(
    origins: string[] | Location[],
    destinations: string[] | Location[]
  ): Promise<{ distance: number; duration: number }[][]> {
    if (!this.apiKey) {
      throw new Error('Google Maps API not configured');
    }

    const originsStr = origins.map(o => (typeof o === 'string' ? o : `${o.latitude},${o.longitude}`)).join('|');
    const destinationsStr = destinations.map(d => (typeof d === 'string' ? d : `${d.latitude},${d.longitude}`)).join('|');

    const params = new URLSearchParams({
      origins: originsStr,
      destinations: destinationsStr,
      key: this.apiKey,
      mode: 'driving',
    });

    try {
      const response = await fetch(`${this.baseUrl}/distancematrix/json?${params}`);
      const data: any = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Distance Matrix API error: ${data.status}`);
      }

      return data.rows.map((row: any) =>
        row.elements.map((element: any) => ({
          distance: element.distance.value,
          duration: element.duration.value,
        }))
      );
    } catch (error) {
      this.logger.error(`Failed to get distance matrix: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Geocode an address to latitude/longitude
   */
  async geocodeAddress(address: string): Promise<GeocodeResult> {
    if (!this.apiKey) {
      throw new Error('Google Maps API not configured');
    }

    const params = new URLSearchParams({
      address,
      key: this.apiKey,
    });

    try {
      const response = await fetch(`${this.baseUrl}/geocode/json?${params}`);
      const data: any = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Geocoding API error: ${data.status}`);
      }

      const result = data.results[0];
      const geometry = result.geometry.location;
      const addressComponents: any = {};

      result.address_components.forEach((component: any) => {
        if (component.types.includes('locality')) {
          addressComponents.city = component.long_name;
        }
        if (component.types.includes('administrative_area_level_1')) {
          addressComponents.state = component.short_name;
        }
        if (component.types.includes('postal_code')) {
          addressComponents.zip = component.long_name;
        }
      });

      return {
        latitude: geometry.lat,
        longitude: geometry.lng,
        address: result.formatted_address,
        city: addressComponents.city,
        state: addressComponents.state,
        zip: addressComponents.zip,
      };
    } catch (error) {
      this.logger.error(`Failed to geocode address: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocodeLocation(latitude: number, longitude: number): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Google Maps API not configured');
    }

    const params = new URLSearchParams({
      latlng: `${latitude},${longitude}`,
      key: this.apiKey,
    });

    try {
      const response = await fetch(`${this.baseUrl}/geocode/json?${params}`);
      const data: any = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Reverse Geocoding API error: ${data.status}`);
      }

      return data.results[0].formatted_address;
    } catch (error) {
      this.logger.error(`Failed to reverse geocode: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Find nearby places (hospitals, gas stations, etc.)
   */
  async findNearbyPlaces(
    location: Location | string,
    type: string,
    radius: number = 5000
  ): Promise<{ name: string; location: Location; distance?: number }[]> {
    if (!this.apiKey) {
      throw new Error('Google Maps API not configured');
    }

    const locationStr = typeof location === 'string' ? location : `${location.latitude},${location.longitude}`;

    const params = new URLSearchParams({
      location: locationStr,
      type,
      radius: radius.toString(),
      key: this.apiKey,
    });

    try {
      const response = await fetch(`${this.baseUrl}/place/nearbysearch/json?${params}`);
      const data: any = await response.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Nearby Search API error: ${data.status}`);
      }

      return data.results.map((result: any) => ({
        name: result.name,
        location: {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
        },
      }));
    } catch (error) {
      this.logger.error(`Failed to find nearby places: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Calculate travel time for real-time ETAs
   */
  async calculateETA(from: Location | string, to: Location | string): Promise<{ distance: number; duration: number }> {
    const directions = await this.getDirections(from, to);
    return {
      distance: directions.distance,
      duration: directions.duration,
    };
  }

  /**
   * Optimize route for multiple stops (TSP-style)
   * Note: This uses simple greedy nearest-neighbor; consider using Google OR-Tools for true optimization
   */
  async optimizeRoute(
    origin: Location | string,
    stops: (Location | string)[],
    returnToOrigin: boolean = true
  ): Promise<{ route: (Location | string)[]; totalDistance: number; totalDuration: number }> {
    const all: (Location | string)[] = [origin, ...stops];
    if (returnToOrigin) {
      all.push(origin);
    }

    try {
      const matrix = await this.getDistanceMatrix(all as any, all as any);

      // Simple greedy nearest-neighbor TSP
      const visited = new Set<number>();
      let current = 0;
      visited.add(0);

      const route = [origin];
      let totalDistance = 0;
      let totalDuration = 0;

      for (let i = 1; i < stops.length + 1; i++) {
        let nearest = -1;
        let nearestDistance = Infinity;

        for (let j = 0; j < matrix[current].length; j++) {
          if (!visited.has(j) && matrix[current][j].distance < nearestDistance) {
            nearestDistance = matrix[current][j].distance;
            nearest = j;
          }
        }

        if (nearest === -1) break;

        visited.add(nearest);
        totalDistance += matrix[current][nearest].distance;
        totalDuration += matrix[current][nearest].duration;
        route.push(all[nearest]);
        current = nearest;
      }

      return {
        route,
        totalDistance,
        totalDuration,
      };
    } catch (error) {
      this.logger.error(`Failed to optimize route: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
