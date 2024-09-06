"use client";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "@aerisweather/mapsgl/dist/mapsgl.css";
import { useMapStore } from "./store/mapStore"; // Zustand store for global map management
import WeatherLayerComponent from "./WeatherLayerComponent"; // Import the new component

const MapComponent = () => {
  const mapRef = useRef(null);
  const controllerRef = useRef<any>(null);
  const { setMap, setController } = useMapStore(); // Zustand setters

  useEffect(() => {
    const mapboxgl = require("mapbox-gl");
    const mapsgl = require("@aerisweather/mapsgl");

    mapboxgl.accessToken =
      "pk.eyJ1Ijoic2lyaXRvZWkiLCJhIjoiY2wxNHN4YjJwMDl4bjNsbzdmdnZ4OGg5bCJ9.xS2LGqPIbk3pUibim5g1mA";

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/light-v9",
      center: [10.33207, 47.60621],
      zoom: 3,
      projection: "mercator",
    });

    const account = new mapsgl.Account(
      "7iOMMin2RrTNIZYn1q9JM",
      "ERiP8vXlA7TyFc6HuiTpRFXqTyTjWw4r0TqajvKb"
    );

    const controller = new mapsgl.MapboxMapController(map, {
      account,
    });
    controllerRef.current = controller;

    controller.on("load", () => {
      setMap(map);
      setController(controller);
    });

    const layers = ["wind-dir"];
    const frameCount = 100; // Number of animation steps
    let currentFrame = 0; // To track the current animation frame
    const startMinutes = 0;
    const endMinutes = 3600;
    const interval = (endMinutes - startMinutes) / frameCount;

const updateLayer = () => {
  const timeOffset = startMinutes + interval * currentFrame;
  const windLayerURL = `https://maps1.aerisapi.com/7iOMMin2RrTNIZYn1q9JM_ERiP8vXlA7TyFc6HuiTpRFXqTyTjWw4r0TqajvKb/wind-dir/{z}/{x}/{y}/${timeOffset}min.png`;

  const nextLayerId = currentFrame % 2 === 0 ? "aerisWeatherLayer1" : "aerisWeatherLayer2";
  const prevLayerId = currentFrame % 2 === 0 ? "aerisWeatherLayer2" : "aerisWeatherLayer1";

  if (map.getSource(nextLayerId)) {
    map.removeLayer(nextLayerId);
    map.removeSource(nextLayerId);
  }

  map.addSource(nextLayerId, {
    type: "raster",
    tiles: [windLayerURL],
    tileSize: 256,
  });

  map.addLayer({
    id: nextLayerId,
    type: "raster",
    source: nextLayerId,
    paint: {
      "raster-opacity": 0,
    },
  });

  // Fade out the old layer and fade in the new one
  map.setPaintProperty(nextLayerId, "raster-opacity", 0.8);
  map.setPaintProperty(prevLayerId, "raster-opacity", 0);
};


    // Update the animation frame every second (or any interval you want)
    const animationInterval = setInterval(() => {
      currentFrame = (currentFrame + 1) % frameCount; // Cycle through frames
      updateLayer();
    }, 1000); // 1-second interval between frames

    // Cleanup on component unmount
    return () => {
      if (controllerRef.current) {
        controllerRef.current.removeLegendControl();
        if (controllerRef.current.hasWeatherLayer("wind-particles")) {
          controllerRef.current.removeWeatherLayer("wind-particles");
        }
      }
      clearInterval(animationInterval); // Stop animation
    };
  }, [setMap, setController]);

  return (
    <div>
      <div ref={mapRef} style={{ height: "100vh", width: "100%" }}></div>
      <WeatherLayerComponent />
    </div>
  );
};

export default dynamic(() => Promise.resolve(MapComponent), { ssr: false });
