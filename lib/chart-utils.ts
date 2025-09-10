// Import Chart.js
import { Chart, ChartConfiguration, ChartTypeRegistry } from 'chart.js/auto';

// Fungsi untuk membuat trend chart (line chart)
export const createTrendChart = (
  canvas: HTMLCanvasElement,
  labels: string[],
  data: number[]
) => {
  const config: ChartConfiguration<'line', number[], string> = {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Jumlah Surat',
          data,
          borderColor: 'rgb(251, 146, 60)',
          backgroundColor: 'rgba(251, 146, 60, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Trend Surat Keluar',
          font: {
            size: 16,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    },
  };

  return new Chart(canvas, config);
};

// Fungsi untuk membuat kategori chart (doughnut chart)
export const createKategoriChart = (
  canvas: HTMLCanvasElement,
  labels: string[],
  data: number[]
) => {
  const config: ChartConfiguration<'doughnut', number[], string> = {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            'rgba(251, 146, 60, 0.8)',
            'rgba(96, 165, 250, 0.8)',
            'rgba(134, 239, 172, 0.8)',
            'rgba(253, 224, 71, 0.8)',
            'rgba(192, 132, 252, 0.8)',
            'rgba(248, 113, 133, 0.8)',
          ],
          borderColor: [
            'rgb(251, 146, 60)',
            'rgb(96, 165, 250)',
            'rgb(134, 239, 172)',
            'rgb(253, 224, 71)',
            'rgb(192, 132, 252)',
            'rgb(248, 113, 133)',
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right' as const,
        },
        title: {
          display: true,
          text: 'Distribusi Surat per Kategori',
          font: {
            size: 16,
          },
        },
      },
    },
  };

  return new Chart(canvas, config);
};

// Fungsi untuk membuat harian chart (bar chart)
export const createHarianChart = (
  canvas: HTMLCanvasElement,
  labels: string[],
  data: number[]
) => {
  const config: ChartConfiguration<'bar', number[], string> = {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Jumlah Surat',
          data,
          backgroundColor: 'rgba(96, 165, 250, 0.8)',
          borderColor: 'rgb(96, 165, 250)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Surat Keluar Harian',
          font: {
            size: 16,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    },
  };

  return new Chart(canvas, config);
};