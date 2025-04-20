import React, { useState, useEffect } from "react";
import {
  addWeeks,
  subWeeks,
  startOfWeek,
  format,
  isSameDay,
  addDays,
  startOfDay,
} from "date-fns";
import { Link } from "react-router-dom";
import axios from "axios";
import { getUserFromToken } from "../../utils/auth";

// Define hours and days
const hours = Array.from({ length: 9 }, (_, i) => 9 + i); // 9am to 5pm
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function Calendar() {
  // State for current week and class data
  const [currentWeek, setCurrentWeek] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [classes, setClasses] = useState([]);
  const user = getUserFromToken();
   const [sem, setSem] = useState(`${new Date().getMonth() <= 7 ? "Even" : "Odd"}-${new Date().getFullYear()}`);

  useEffect(() => {
    const fetchData = async() =>{
      const BACKEND_URL=import.meta.env.VITE_BACKEND_URL
      const response = await axios.get(`${BACKEND_URL}/facultyView/schedule?sem=${sem}&id=${user._id}`)
      setClasses(response.data);
    }

    fetchData()
  }, []);

  // Calculate dates for the week (Monday to Friday)
  const weekDates = days.map((_, i) => addDays(currentWeek, i));

  // Handlers for week navigation
  const handlePrevWeek = () => setCurrentWeek((prev) => subWeeks(prev, 1));
  const handleNextWeek = () => setCurrentWeek((prev) => addWeeks(prev, 1));

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={handlePrevWeek}
          className="text-xl font-semibold px-2 hover:text-blue-600"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold">
          Week of {format(weekDates[0], "MMM dd, yyyy")} –{" "}
          {format(weekDates[4], "MMM dd")}
        </h2>
        <button
          onClick={handleNextWeek}
          className="text-2xl font-semibold px-2 hover:text-blue-600"
        >
          →
        </button>
      </div>

      <div className="max-h-[65vh] overflow-y-auto rounded-2xl">
        <div
          className="grid bg-white shadow-md border border-gray-300"
          style={{
            gridTemplateColumns: "80px repeat(5, 1fr)",
            gridAutoRows: "4rem",
          }}
        >
          <div className="border border-gray-200 p-2 font-medium text-center bg-gray-100 sticky top-0 z-10 text-sm">
            Time
          </div>
          {weekDates.map((date) => {
            const isToday = isSameDay(date, new Date());
            return (
              <div
                key={date}
                className={`border border-gray-200 p-2 text-center sticky top-0 z-10 text-sm font-semibold ${
                  isToday ? "bg-yellow-100" : "bg-gray-100"
                }`}
              >
                {format(date, "EEEE")}
                <br />
                <span className="text-xs font-normal text-gray-600">
                  {format(date, "MM/dd")}
                </span>
              </div>
            );
          })}

          {/* Time Rows */}
          {hours.map((hour) => (
            <React.Fragment key={hour}>
              {/* Time Column */}
              <div className="border border-gray-200 text-xs text-gray-700 flex items-center justify-center h-16 bg-white">
                {hour}:00
              </div>

              {/* Schedule Slots */}
              {weekDates.map((date, index) => {
                const classItem = classes.find(
                  (cls) => {
                    // Compare only the date part (no time) using startOfDay
                    const classDate = new Date(cls.date);
                    return (
                      isSameDay(startOfDay(date), startOfDay(classDate)) &&
                      cls.start === hour
                    );
                  }
                );

                if (classItem) {
                  const duration = classItem.end - classItem.start;
                  return (
                    <div
                      key={index + hour}
                      className="bg-blue-100 border border-blue-200 rounded-xl shadow-sm p-2 m-1 text-xs flex flex-col justify-center"
                      style={{ gridRow: `span ${duration}` }}
                    >
                      <div className="font-semibold text-sm">
                        {classItem.subject}
                      </div>
                      <div className="text-[11px] text-gray-600">
                        {classItem.location} -{" "}
                        <Link
                          className="underline"
                          to={`/faculty/attendance/upload/${classItem.id}`}
                        >
                          Mark
                        </Link>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={index + hour}
                    className="border border-gray-200 h-16"
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
