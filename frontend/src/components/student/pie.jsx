import { PieChart, Pie, Cell, Tooltip } from "recharts";

export default function AttendancePieChart({ data }) {
  const total = data.totalClasses || 0;
  const attended = data.attendedClasses || 0;
  const missed = total - attended;

  const attendanceData = [
    { name: "Attended", value: attended },
    { name: "Missed", value: missed > 0 ? missed : 0 }
  ];

  const COLORS = ["#4ade80", "#f87171"];

  return (
    <PieChart width={300} height={300}>
      <Pie
        data={attendanceData}
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={90}
        fill="#8884d8"
        paddingAngle={5}
        dataKey="value"
        label
      >
        {attendanceData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  );
}
