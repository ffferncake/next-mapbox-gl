"use client";
import { useEffect, useState } from "react";
import { useMapStore } from "./store/mapStore";

const WeatherLayerComponent = () => {
  const { mapRef, controllerRef } = useMapStore();
  const [layerAdded, setLayerAdded] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  // Function to add the weather layer
  const addLayer = () => {
    if (controllerRef && mapRef && !layerAdded) {
      controllerRef.addWeatherLayer("temperatures", {
        // Your weather layer configuration
      });
      console.log("Weather layer added.");
      setLayerAdded(true);
    }
  };

  // Function to remove the weather layer
  const removeLayerAndLegend = () => {
    if (controllerRef && layerAdded) {
      controllerRef.removeWeatherLayer("temperatures");
      console.log("Weather layer removed.");
      setLayerAdded(false);
    } else {
      console.log("Layer has not been added yet or is already removed.");
    }
  };

  // Function to update the timeline to a specific date
  const updateTimeline = (date:any) => {
    if (controllerRef && controllerRef.timeline && date) {
      const targetDate = new Date(date);
      controllerRef.timeline.goTo(targetDate.getTime() / 1000);
      console.log(`Timeline moved to ${targetDate}`);
    }
  };

  // Play and Pause Timeline
  const playTimeline = () => {
    if (controllerRef && controllerRef.timeline) {
      if (isPlaying) {
        controllerRef.timeline.stop();
        setIsPlaying(false);
      } else {
        controllerRef.timeline.play();
        setIsPlaying(true);
      }
    }
  };

  const pauseTimeline = () => {
    if (controllerRef && controllerRef.timeline) {
      controllerRef.timeline.pause();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (controllerRef) {
      controllerRef.on("load:start", () => {
        setLoading(true);
      });
      controllerRef.on("load:complete", () => {
        setLoading(false);
      });
    }

    return () => {
      if (controllerRef && layerAdded) {
        controllerRef.removeWeatherLayer("temperatures");
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

        <div style={{ marginTop: "20px" }}>
          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <button onClick={() => updateTimeline(startDate)}>
            Go to Start Date
          </button>

          <label>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button onClick={() => updateTimeline(endDate)}>
            Go to End Date
          </button>
        </div>

        <div style={{ marginTop: "10px" }}>
          <button onClick={playTimeline}>{isPlaying ? "Stop" : "Play"}</button>
          <button onClick={pauseTimeline} disabled={!isPlaying}>
            Pause
          </button>
        </div>

        <div id="controls" style={{ marginTop: "10px" }}>
          {loading && (
            <div className="loader">
              <div className="ring">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>
          )}
          <input
            id="timeline-slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            onInput={(e:any) => {
              const value = e.target.value;
              controllerRef.timeline.goTo(value);
            }}
          />
          <div className="time">0.0</div>
        </div>
      </div>
    </div>
  );
};

export default WeatherLayerComponent;
