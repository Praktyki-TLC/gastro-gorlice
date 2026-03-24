import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
} from "chart.js";

// Rejestrujemy tutaj, by nie robić tego za każdym montowaniem komponentu
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale
);

export const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context: any) => `${context.parsed.y} zł`,
      },
    },
  },
  scales: {
    y: {
      ticks: {
        callback: (value: any) => `${value} zł`,
      },
    },
  },
};