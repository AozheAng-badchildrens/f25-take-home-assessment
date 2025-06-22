"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function WeatherInfo() {
  const [inputId, setInputId] = useState("");
  const [weatherData, setWeatherData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async () => {
    if (!inputId.trim()) {
      setError("Please enter a valid ID.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/weather/${inputId}`);
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.detail || "Error! Unable to fetch weather data!");
      setWeatherData(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const WeatherField = ({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) => (
    <div className="text-sm">
      <Label className="text-muted-foreground mr-1">{label}:</Label>
      <span className="font-medium">{value}</span>
    </div>
  );

  return (
    <Card className="w-full max-w-xl mt-6 mx-auto">
      <CardHeader>
        <CardTitle>Look Up Weather Data by ID</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter weather ID"
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
          />
          <Button onClick={fetchWeather} disabled={loading}>
            {loading ? "Loading..." : "Fetch"}
          </Button>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {weatherData && (
          <div className="mt-4 space-y-2">
            <WeatherField label="Date" value={weatherData.date} />
            <WeatherField label="Location" value={weatherData.location} />
            <WeatherField label="Notes" value={weatherData.notes || "None"} />

            {weatherData.weather?.current && (
              <>
                <WeatherField
                  label="Temp"
                  value={`${weatherData.weather.current.temperature} °C`}
                />
                <WeatherField
                  label="Condition"
                  value={weatherData.weather.current.weather_descriptions?.join(
                    ", "
                  )}
                />
                <WeatherField
                  label="Feels Like"
                  value={`${weatherData.weather.current.feelslike} °C`}
                />
                <WeatherField
                  label="Humidity"
                  value={`${weatherData.weather.current.humidity}%`}
                />
                <WeatherField
                  label="Wind"
                  value={`${weatherData.weather.current.wind_speed} km/h ${weatherData.weather.current.wind_dir}`}
                />
                {weatherData.weather.current.weather_icons?.[0] && (
                  <img
                    src={weatherData.weather.current.weather_icons[0]}
                    alt="Weather Icon"
                    className="h-12 mt-2"
                  />
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default WeatherInfo;
