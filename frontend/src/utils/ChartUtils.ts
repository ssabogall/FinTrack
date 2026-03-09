import { ArcElement, Chart, DoughnutController, Tooltip, type ChartConfiguration } from 'chart.js';

export class ChartUtils {
  private static initialized = false;

  private static ensureInitialized(): void {
    if (ChartUtils.initialized) return;
    Chart.register(ArcElement, DoughnutController, Tooltip);
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
}
