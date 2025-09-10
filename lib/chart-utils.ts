// Fungsi untuk membuat trend chart (line chart)
export const createTrendChart = (canvas: HTMLCanvasElement, labels: string[], values: number[]) => {
  // Bersihkan canvas
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  
  // Hapus konten canvas sebelumnya
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Buat chart baru
  return new Promise((resolve) => {
    // Tambahkan sedikit delay untuk memastikan DOM siap
    setTimeout(() => {
      // @ts-ignore
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Jumlah Surat',
            data: values,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 3,
            pointBackgroundColor: '#3b82f6',
            pointRadius: 5,
            pointHoverRadius: 7,
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleFont: {
                size: 14,
                weight: 'bold'
              },
              bodyFont: {
                size: 13
              },
              padding: 12,
              displayColors: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              },
              ticks: {
                stepSize: 1
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
      
      resolve(chart);
    }, 50);
  });
};

// Fungsi untuk membuat kategori chart (doughnut chart)
export const createKategoriChart = (canvas: HTMLCanvasElement, labels: string[], values: number[]) => {
  // Bersihkan canvas
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  
  // Hapus konten canvas sebelumnya
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Buat chart baru
  return new Promise((resolve) => {
    // Tambahkan sedikit delay untuk memastikan DOM siap
    setTimeout(() => {
      // @ts-ignore
      const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: [
              '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', 
              '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899'
            ],
            borderWidth: 0,
            hoverOffset: 15
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              callbacks: {
                label: function(context: any) {
                  const total = context.dataset.data.reduce((acc: number, val: number) => acc + val, 0);
                  const percentage = Math.round((context.raw / total) * 100);
                  return `${context.label}: ${context.raw} (${percentage}%)`;
                }
              },
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleFont: {
                size: 14,
                weight: 'bold'
              },
              bodyFont: {
                size: 13
              },
              padding: 12
            }
          },
          cutout: '65%'
        }
      });
      
      resolve(chart);
    }, 50);
  });
};

// Fungsi untuk membuat harian chart (bar chart)
export const createHarianChart = (canvas: HTMLCanvasElement, labels: string[], values: number[]) => {
  // Bersihkan canvas
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  
  // Hapus konten canvas sebelumnya
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Buat chart baru
  return new Promise((resolve) => {
    // Tambahkan sedikit delay untuk memastikan DOM siap
    setTimeout(() => {
      // @ts-ignore
      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Jumlah Surat',
            data: values,
            backgroundColor: '#10b981',
            borderColor: '#059669',
            borderWidth: 1,
            borderRadius: 4,
            barPercentage: 0.6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleFont: {
                size: 14,
                weight: 'bold'
              },
              bodyFont: {
                size: 13
              },
              padding: 12,
              displayColors: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              },
              ticks: {
                stepSize: 1
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
      
      resolve(chart);
    }, 50);
  });
};