import React, { useState, useEffect } from "react";
import axios from "axios";
import { getUserFromToken } from "../../utils/auth";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const hours = Array.from({ length: 9 }, (_, i) => 9 + i); // 9am to 6pm

export default function Calendar() {
  const [classSchedule, setSchedule] = useState([]);
  const [sem, setSem] = useState(
    `${new Date().getMonth() <= 7 ? "Even" : "Odd"}-${new Date().getFullYear()}`
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = getUserFromToken();
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
        const url = `${BACKEND_URL}/studentView/schedule?div=${user.division}&semester=${sem}`;
        const response = await axios.get(url);
        setSchedule(response.data);
      } catch (error) {
        console.error("Error fetching schedule:", error);
      }
    };

    fetchData();
  }, [sem]);

  return (
    <div className="grid grid-cols-6 border rounded-2xl shadow gap-1 w-[60vw] h-[70vh] p-5 m-5 overflow-y-auto">
      <div className="text-sm font-semibold text-center p-2">Time</div>
      {days.map((day) => (
        <div key={day} className="text-sm font-semibold text-center p-2">
          {day}
        </div>
      ))}
      {hours.map((hour) => (
        <React.Fragment key={hour}>
          <div className="text-xs text-center p-2 border-t border-gray-200">
            {hour}:00
          </div>
          {days.map((day) => {
            const classItem = classSchedule.find(
              (cls) => cls.day === day && cls.start === hour
            );
            if (classItem) {
              const duration = classItem.end - classItem.start;
              return (
                <div
                  key={day + hour}
                  style={{ gridRow: `span ${duration}` }}
                  className="bg-indigo-100 border rounded-xl text-xs p-2"
                >
                  <div className="font-semibold">{classItem.subject}</div>
                  <div className="text-[10px] text-gray-600">{classItem.location}</div>
                </div>
              );
            }
            return <div key={day + hour} className="border-t h-12" />;
          })}
        </React.Fragment>
      ))}
    </div>
  );
}