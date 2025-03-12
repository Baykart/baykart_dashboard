import { supabase } from './supabase';
import { WeatherData } from '../types/supabase';

export interface WeatherDataInput {
  location: string;
  region: string;
  temperature_high: number;
  temperature_low: number;
  condition: string;
  forecast_date: string;
  humidity?: number;
  precipitation?: number;
  wind_speed?: number;
}

// Get weather data for a specific location
export const getWeatherByLocation = async (location: string): Promise<WeatherData[]> => {
  const { data, error } = await supabase
    .from('weather_data')
    .select('*')
    .eq('location', location)
    .order('forecast_date', { ascending: true });

  if (error) {
    console.error(`Error fetching weather data for location ${location}:`, error);
    throw error;
  }

  return data || [];
};

// Get weather data for a specific region
export const getWeatherByRegion = async (region: string): Promise<WeatherData[]> => {
  const { data, error } = await supabase
    .from('weather_data')
    .select('*')
    .eq('region', region)
    .order('forecast_date', { ascending: true });

  if (error) {
    console.error(`Error fetching weather data for region ${region}:`, error);
    throw error;
  }

  return data || [];
};

// Get weather data for a specific date
export const getWeatherByDate = async (date: string): Promise<WeatherData[]> => {
  const { data, error } = await supabase
    .from('weather_data')
    .select('*')
    .eq('forecast_date', date)
    .order('location');

  if (error) {
    console.error(`Error fetching weather data for date ${date}:`, error);
    throw error;
  }

  return data || [];
};

// Get weather forecast for a location (next 7 days)
export const getWeatherForecast = async (location: string): Promise<WeatherData[]> => {
  const today = new Date();
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(today.getDate() + 7);
  
  const { data, error } = await supabase
    .from('weather_data')
    .select('*')
    .eq('location', location)
    .gte('forecast_date', today.toISOString().split('T')[0])
    .lte('forecast_date', sevenDaysLater.toISOString().split('T')[0])
    .order('forecast_date', { ascending: true });

  if (error) {
    console.error(`Error fetching weather forecast for location ${location}:`, error);
    throw error;
  }

  return data || [];
};

// Get a single weather data entry by ID
export const getWeatherById = async (id: string): Promise<WeatherData | null> => {
  const { data, error } = await supabase
    .from('weather_data')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching weather data with ID ${id}:`, error);
    throw error;
  }

  return data;
};

// Create a new weather data entry
export const createWeatherData = async (weatherData: WeatherDataInput): Promise<WeatherData> => {
  const { data, error } = await supabase
    .from('weather_data')
    .insert([weatherData])
    .select()
    .single();

  if (error) {
    console.error('Error creating weather data:', error);
    throw error;
  }

  return data;
};

// Update an existing weather data entry
export const updateWeatherData = async (id: string, weatherData: Partial<WeatherDataInput>): Promise<WeatherData> => {
  const { data, error } = await supabase
    .from('weather_data')
    .update(weatherData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating weather data with ID ${id}:`, error);
    throw error;
  }

  return data;
};

// Delete a weather data entry
export const deleteWeatherData = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('weather_data')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting weather data with ID ${id}:`, error);
    throw error;
  }
};

// Bulk insert weather data (for batch updates from external API)
export const bulkInsertWeatherData = async (weatherDataArray: WeatherDataInput[]): Promise<void> => {
  const { error } = await supabase
    .from('weather_data')
    .insert(weatherDataArray);

  if (error) {
    console.error('Error bulk inserting weather data:', error);
    throw error;
  }
}; 