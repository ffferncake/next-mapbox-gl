"use client";
import { useEffect, useState } from "react";
import { useMapStore } from "./store/mapStore";

const WeatherLayerComponent = () => {
  const { mapRef, controllerRef } = useMapStore();
  const [layerAdded, setLayerAdded] = useState(false);

  // Function to add the weather layer
  const addLayer = () => {
    if (controllerRef && mapRef && !layerAdded) {
      controllerRef.addWeatherLayer("wind-particles", {
        paint: {
          sample: {
            colorscale: {
              normalized: true,
              stops: [
                0,
                "#0b0089",
                0.25,
                "#8800a8",
                0.5,
                "#cf4875",
                0.75,
                "#f99336",
                1,
                "#f0fb00",
              ],
            },
          },
          particle: {
            count: Math.pow(256, 2), // 65536 particles
            size: 1,
            speed: 2,
            trailsFade: 0.9,
          },
        },
      });

      console.log("Weather layer added.");
      // console.log("Available Mapbox layers:", mapRef.getStyle().layers); // Log available layers
      setLayerAdded(true); // Mark the layer as added
    }
  };

  // Function to remove the weather layer
  const removeLayerAndLegend = () => {
    if (controllerRef && layerAdded) {
      controllerRef.removeWeatherLayer("wind-particles");
      console.log("Weather layer removed.");
      setLayerAdded(false); // Update state to indicate the layer is removed
    } else {
      console.log("Layer has not been added yet or is already removed.");
    }
  };

  // Ensure proper cleanup if the component unmounts
  useEffect(() => {
    return () => {
      if (controllerRef && layerAdded) {
        controllerRef.removeWeatherLayer("wind-particles");
        console.log("Weather layer removed during cleanup.");
      }
    };
  }, [controllerRef, layerAdded]);

  return (
    <div>
      <div
        style={{ position: "absolute", top: "10px", left: "10px", zIndex: 1 }}
      >
        <button onClick={addLayer} disabled={layerAdded}>
          Add Layer
        </button>
        <button onClick={removeLayerAndLegend} disabled={!layerAdded}>
          Remove Layer
        </button>
      </div>
    </div>
  );
};

export default WeatherLayerComponent;
