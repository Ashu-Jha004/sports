// HexagramChart.tsx
"use client";

import React from "react";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import type { ApexOptions } from "apexcharts";
import { AthleteStats, recordHolderStats } from "../../utils/recordHolderStats";
interface Props {
  userStats: AthleteStats;
  onOpenReport: () => void;
}

const categories = [
  "Strength",
  "Power",
  "Speed",
  "Agility",
  "Recovery",
  "Stamina",
];

export const HexagramChart: React.FC<Props> = ({ userStats, onOpenReport }) => {
  const series = [
    {
      name: "Record Holder",
      data: Object.values(recordHolderStats),
    },
    {
      name: "User",
      data: Object.values(userStats),
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "radar",
      height: 350,
      toolbar: {
        show: true,
        tools: { download: true },
      },
    },
    stroke: {
      width: 2,
      curve: "smooth",
      colors: ["#f87171", "#3b82f6"],
      dashArray: [0, 0],
    },
    fill: {
      opacity: 0.4,
      colors: ["#f87171", "#3b82f6"],
      type: "solid",
    },
    markers: {
      size: 5,
      colors: ["#f87171", "#3b82f6"],
      strokeColors: "#ffffff",
      strokeWidth: 2,
    },
    xaxis: {
      categories,
      labels: {
        style: {
          fontSize: "14px",
          fontWeight: "600",
          colors: [
            "#ef4444",
            "#2563eb",
            "#bbf7d0",
            "#fde68a",
            "#fca5a5",
            "#93c5fd",
          ],
        },
      },
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 5,
      labels: {
        formatter: (val: number) => `${val.toFixed(0)}%`,
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val: number) => `${val.toFixed(1)}%`,
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "center",
      offsetY: -10,
      markers: {
        strokeWidth: 12,
      },
    },
    theme: {
      mode: "light",
    },
  };

  return (
    <div className="rounded-lg bg-white p-4 shadow-lg max-w-lg mx-auto">
      <Chart options={options} series={series} type="radar" height={350} />
      <button
        onClick={onOpenReport}
        className="mt-4 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
      >
        View Full Report
      </button>
    </div>
  );
};
