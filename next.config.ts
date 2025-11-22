import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pics.avs.io",
      },
      {
        protocol: "https",
        hostname: "cdn.flightradar24.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.jetphotos.com",
      }
    ],
  },
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/live_departures',
          destination: '/api/live-departures',
        },
        {
          source: '/api/search_flights',
          destination: '/api/search-flights',
        },
        {
          source: '/api/flight_details',
          destination: '/api/flights/[id]',
        },
        {
          source: '/api/flight_service',
          destination: '/api/flights',
        }
      ];
    }
    return [];
  },
};

export default nextConfig;
