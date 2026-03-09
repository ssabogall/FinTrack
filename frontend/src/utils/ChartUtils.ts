import {
  ArcElement,
  Chart,
  DoughnutController,
  Legend,
  PieController,
  Tooltip,
  type ChartConfiguration,
} from 'chart.js';

export class ChartUtils {
  private static initialized = false;

  private static ensureInitialized(): void {
    if (ChartUtils.initialized) return;
    Chart.register(ArcElement, DoughnutController, Legend, PieController, Tooltip);
    ChartUtils.initialized = true;
  }

  public static buildGoalProgressDoughnut(
    canvas: HTMLCanvasElement,
    savedAmount: number,
    remainingAmount: number,
    color: string,
  ): Chart {
    ChartUtils.ensureInitialized();

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        datasets: [
          {
            data: [savedAmount, remainingAmount],
            backgroundColor: [color, '#E2E8F0'],
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        cutout: '72%',
        responsive: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => ` $${ctx.parsed.toLocaleString()}`,
            },
          },
          legend: { display: false },
        },
      },
    };

    return new Chart(canvas, config);
  }

  public static buildCategoryDistributionPie(
    canvas: HTMLCanvasElement,
    labels: string[],
    data: number[],
    colors: string[],
  ): Chart {
    ChartUtils.ensureInitialized();

    const config: ChartConfiguration<'pie'> = {
      type: 'pie',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors,
            borderColor: '#FFFFFF',
            borderWidth: 2,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 16,
              usePointStyle: true,
              pointStyle: 'circle',
              font: { size: 12 },
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : '0';
                return ` ${ctx.label}: $${ctx.parsed.toLocaleString('en-US', { minimumFractionDigits: 2 })} (${pct}%)`;
              },
            },
          },
        },
      },
    };

    return new Chart(canvas, config);
  }
}
