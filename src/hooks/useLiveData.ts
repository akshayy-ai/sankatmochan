"use client";

import { useState, useEffect } from "react";

/** Geocoded address for a lat,lng */
export type GeoResult = {
  display: string;
  short: string;
  district: string;
  state: string;
  city: string;
  area: string;
  postcode: string;
  country: string;
};

/** Current weather at a lat,lng */
export type WeatherResult = {
  temp_c: string;
  feels_like_c: string;
  condition: string;
  emoji: string;
  humidity: string;
  wind_kmph: string;
  wind_dir: string;
  precip_mm: string;
  visibility_km: string;
  uv_index: string;
  nearest_area: string;
  region: string;
  observation_time: string;
};

// In-memory cache to avoid refetching on tab switches
const geoCache: Record<string, GeoResult> = {};
const weatherCache: Record<string, WeatherResult> = {};

export function useGeocode(coords: string) {
  const [data, setData] = useState<GeoResult | null>(geoCache[coords] || null);
  const [loading, setLoading] = useState(!geoCache[coords]);

  useEffect(() => {
    if (geoCache[coords]) {
      setData(geoCache[coords]);
      setLoading(false);
      return;
    }

    const [lat, lng] = coords.split(",").map((s) => s.trim());
    if (!lat || !lng) return;

    let cancelled = false;
    setLoading(true);

    fetch(`/api/geocode?lat=${lat}&lng=${lng}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (!d.error) {
          geoCache[coords] = d;
          setData(d);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [coords]);

  return { geo: data, geoLoading: loading };
}

export function useWeather(coords: string) {
  const [data, setData] = useState<WeatherResult | null>(weatherCache[coords] || null);
  const [loading, setLoading] = useState(!weatherCache[coords]);

  useEffect(() => {
    if (weatherCache[coords]) {
      setData(weatherCache[coords]);
      setLoading(false);
      return;
    }

    const [lat, lng] = coords.split(",").map((s) => s.trim());
    if (!lat || !lng) return;

    let cancelled = false;
    setLoading(true);

    fetch(`/api/weather?lat=${lat}&lng=${lng}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (!d.error) {
          weatherCache[coords] = d;
          setData(d);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [coords]);

  return { weather: data, weatherLoading: loading };
}
