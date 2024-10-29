"use client";
import { useEffect, useState } from "react";
import { useMapStore } from "./store/mapStore";
import styles from "./WeatherLayerComponent.module.css";

const WeatherLayerComponent = () => {
  const { mapRef, controllerRef } = useMapStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sliderValue, setSliderValue] = useState(0); // assuming max value is 1
  const [currentTime, setCurrentTime] = useState("");

  // Format time to 12-hour format with AM/PM
  const formatDate = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true // Use 12-hour format
    });
  };

  const generateTimeLabels = (startDate: Date, endDate: Date) => {
    const labels: string[] = [];
    const start = startDate.getTime();
    const end = endDate.getTime();
    const oneHour = 60 * 60 * 1000; // One hour in milliseconds

    // Ensure the end time is within 6 hours of the start time
    const adjustedEnd = start + (6 * oneHour);

    // Generate labels for every hour within the 6-hour window
    for (let time = start; time <= Math.min(end, adjustedEnd); time += oneHour) {
      const label = formatDate(new Date(time));
      // Only add the label if it is not already included
      if (!labels.includes(label)) {
        labels.push(label);
      }
    }
    return labels;
  };

  useEffect(() => {
    if (controllerRef) {
      controllerRef.addWeatherLayer("radar");

      const controller = controllerRef;

      // Update the slider and current time label
      const updateTimelineLabel = () => {
        setSliderValue(controller.timeline.position);
        setCurrentTime(formatDate(controller.timeline.currentDate));
      };

      // Loading indicators
      controller.on("load:start", () => setLoading(true));
      controller.on("load:complete", () => setLoading(false));

      // Timeline event listeners
      controller.timeline.on(
        "advance",
        ({ position, date }: { position: number; date: Date }) => {
          setSliderValue(position);
          setCurrentTime(formatDate(date));
        }
      );
      controller.timeline.on("range:change", () => {
        updateTimelineLabel();
      });

      return () => {
        // Cleanup event listeners
        controller.timeline.off("advance");
        controller.timeline.off("range:change");
        controller.off("load:start");
        controller.off("load:complete");
      };
    }
  }, [controllerRef]);

  const handlePlayPause = () => {
    if (isPlaying) {
      controllerRef.timeline.stop();
    } else {
      controllerRef.timeline.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setSliderValue(value);
    controllerRef.timeline.goTo(value);
    controllerRef.timeline.pause(); // Pause when user manually changes the slider
  };

  // Generate time labels only when the component mounts or timeline changes
  const timeLabels = generateTimeLabels(new Date(controllerRef?.timeline.startDate), new Date(controllerRef?.timeline.endDate));

  return (
    <div>
      <div id="map" style={{ width: "100%", height: "400px" }}></div>
      <div
        id="controls"
        style={{ position: "absolute", top: "10px", left: "10px", zIndex: 1 }}
        className={styles.controls}
      >
        <button className={styles.btnPlay} onClick={handlePlayPause}>
          {isPlaying ? "Stop" : "Play"}
        </button>
        <div className={styles.divider}></div>
        <div className={styles.sliderContainer}>
          {/* Render static time labels every hour */}
          <div className={styles.timeLabels}>
            {timeLabels.map((label, index) => (
              <div key={index} className={styles.timeLabel}>
                {label}
              </div>
            ))}
          </div>
          <input
            id="timeline-slider"
            type="range"
            min="0"
            max="1"
            value={sliderValue}
            step="0.01"
            onChange={handleSliderChange}
            className={styles.timelineSlider}
          />
          <div className={styles.timeDisplay}>{currentTime}</div>
        </div>
        {loading && (
          <div className={styles.loader}>
            <div className={styles.ring}>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherLayerComponent;
