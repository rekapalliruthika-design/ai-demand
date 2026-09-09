/**
 * External Environmental & Event Integration Interfaces
 * 
 * As per SahakarGig Production Architecture:
 * We do not mock or fabricate live weather/events.
 * When external providers are disconnected, they return null/inactive
 * without corrupting the deterministic statistical forecast.
 */

export interface WeatherCondition {
  temperatureCelsius: number;
  condition: 'Clear' | 'Rainy' | 'Thunderstorm' | 'Heavy Rain' | 'Cloudy' | 'Hot';
  precipitationProbability: number;
  advisoryAlert?: string;
}

export interface LocalEvent {
  id: string;
  name: string;
  zone: string;
  category: 'Festival' | 'Public Holiday' | 'Sports' | 'Civic Event';
  expectedFootfallImpact: 'High' | 'Medium' | 'Low';
  startDate: string;
  endDate: string;
}

export interface IWeatherProvider {
  isConnected(): boolean;
  getCurrentWeather(location: string): Promise<WeatherCondition | null>;
  getWeatherForecast(location: string, daysAhead: number): Promise<WeatherCondition[] | null>;
}

export interface IEventProvider {
  isConnected(): boolean;
  getActiveEvents(location: string): Promise<LocalEvent[]>;
}

/**
 * Default disconnected provider
 * Ensures zero fake live weather data is injected into production analytics
 */
export class DisconnectedWeatherProvider implements IWeatherProvider {
  public isConnected(): boolean {
    return false;
  }

  public async getCurrentWeather(_location: string): Promise<WeatherCondition | null> {
    return null;
  }

  public async getWeatherForecast(_location: string, _daysAhead: number): Promise<WeatherCondition[] | null> {
    return null;
  }
}

export class DisconnectedEventProvider implements IEventProvider {
  public isConnected(): boolean {
    return false;
  }

  public async getActiveEvents(_location: string): Promise<LocalEvent[]> {
    return [];
  }
}

export const defaultWeatherProvider = new DisconnectedWeatherProvider();
export const defaultEventProvider = new DisconnectedEventProvider();
