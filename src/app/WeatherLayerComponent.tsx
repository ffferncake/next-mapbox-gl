"use client";
import { useEffect, useState } from "react";
import { useMapStore } from "./store/mapStore";

const WeatherLayerComponent = () => {
  const { mapRef, controllerRef } = useMapStore();
  const [layerAdded, setLayerAdded] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  // Function to add the weather layer
  const addLayer = () => {
    if (controllerRef && mapRef && !layerAdded) {
      controllerRef.addWeatherLayer("temperatures", {
        paint: {
          // sample: {
          //   colorscale: {
          //     normalized: true,
          //     stops: [
          //       0,
          //       "#0b0089",
          //       0.25,
          //       "#8800a8",
          //       0.5,
          //       "#cf4875",
          //       0.75,
          //       "#f99336",
          //       1,
          //       "#f0fb00",
          //     ],
          //   },
          // },
          particle: {
            count: Math.pow(256, 2), // 65536 particles
            size: 1,
            speed: 2,
            trailsFade: 0.9,
          },
        },
      });
      console.log("Weather layer added.");
      setLayerAdded(true); // Mark the layer as added
    }
  };

  // Function to remove the weather layer
  const removeLayerAndLegend = () => {
    if (controllerRef && layerAdded) {
      controllerRef.removeWeatherLayer("temperatures");
      console.log("Weather layer removed.");
      setLayerAdded(false); // Update state to indicate the layer is removed
    } else {
      console.log("Layer has not been added yet or is already removed.");
    }
  };

  // Function to update the timeline to a specific start or end date
  const updateTimeline = (date:any) => {
    if (controllerRef && controllerRef.timeline && date) {
      const targetDate = new Date(date);
      controllerRef.timeline.goTo(targetDate.getTime() / 1000); // Convert to seconds if necessary
      console.log(`Timeline moved to ${targetDate}`);
    }
  };

  // Play and Pause Timeline
  const playTimeline = () => {
    if (controllerRef && controllerRef.timeline) {
      if (isPlaying) {
        controllerRef.timeline.stop(); // Stop the timeline if it is playing
        setIsPlaying(false);
      } else {
        controllerRef.timeline.play(); // Start or resume the timeline
        setIsPlaying(true);
      }
    }
  };

  const pauseTimeline = () => {
    if (controllerRef && controllerRef.timeline) {
      controllerRef.timeline.pause();
      setIsPlaying(false); // Ensure play button can be used to resume after pause
    }
  };

  useEffect(() => {
    return () => {
      if (controllerRef && layerAdded) {
        controllerRef.removeWeatherLayer("temperatures");
        console.log("Weather layer removed during cleanup.");
      }
    };
  }, [controllerRef, layerAdded]);

  return (
    <div>
      <div style={{ position: "absolute", top: "10px", left: "10px", zIndex: 1 }}>
        <button onClick={addLayer} disabled={layerAdded}>
          Add Layer
        </button>
        <button onClick={removeLayerAndLegend} disabled={!layerAdded}>
          Remove Layer
        </button>
              {/* Date pickers for start and end dates */}
      <div style={{ marginTop: "20px" }}>
        <label>Start Date:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <button onClick={() => updateTimeline(startDate)}>Go to Start Date</button>

        <label>End Date:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button onClick={() => updateTimeline(endDate)}>Go to End Date</button>
      </div>

      {/* Timeline Play/Pause Controls */}
      <div style={{ marginTop: "10px" }}>
        <button onClick={playTimeline}>{isPlaying ? "Stop" : "Play"}</button>
        <button onClick={pauseTimeline} disabled={!isPlaying}>
          Pause
        </button>
      </div>
      </div>

    </div>
  );
};

export default WeatherLayerComponent;
