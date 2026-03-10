import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PieController,
  PointElement,
  Tooltip,
  type ChartConfiguration,
} from 'chart.js';

export class ChartUtils {
  private static initialized = false;

  private static ensureInitialized(): void {
    if (ChartUtils.initialized) return;
    Chart.register(
      ArcElement,
      BarController,
      BarElement,
      CategoryScale,
      DoughnutController,
      Filler,
      Legend,
      LinearScale,
      LineController,
      LineElement,
      PieController,
      PointElement,
      Tooltip,
    );
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

  public static buildMovementTrendsLine(
    canvas: HTMLCanvasElement,
    labels: string[],
    incomeData: number[],
    expenseData: number[],
  ): Chart {
    ChartUtils.ensureInitialized();

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            borderColor: '#16A34A',
            backgroundColor: 'rgba(22,163,74,0.15)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: '#16A34A',
          },
          {
            label: 'Expenses',
            data: expenseData,
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239,68,68,0.10)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: '#EF4444',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 } },
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `$${Number(value).toLocaleString()}`,
              font: { size: 11 },
            },
            grid: { color: '#F1F5F9' },
          },
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { usePointStyle: true, pointStyle: 'circle', font: { size: 12 } },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: $${(ctx.parsed.y ?? 0).toLocaleString()}`,
            },
          },
        },
      },
    };

    return new Chart(canvas, config);
  }

  public static buildExpensesByCategoryDoughnut(
    canvas: HTMLCanvasElement,
    labels: string[],
    data: number[],
    colors: string[],
  ): Chart {
    ChartUtils.ensureInitialized();

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: '#FFFFFF',
            hoverOffset: 6,
          },
        ],
      },
      options: {
        cutout: '60%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                ` ${ctx.label}: $${ctx.parsed.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            },
          },
        },
      },
    };

    return new Chart(canvas, config);
  }

  public static buildUserGrowthLine(
    canvas: HTMLCanvasElement,
    labels: string[],
    counts: number[],
  ): Chart {
    ChartUtils.ensureInitialized();

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Users',
            data: counts,
            borderColor: '#0B2C3D',
            backgroundColor: 'rgba(11,44,61,0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#0B2C3D',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 } },
          },
          y: {
            beginAtZero: true,
            ticks: { font: { size: 11 } },
            grid: { color: '#F1F5F9' },
          },
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { usePointStyle: true, pointStyle: 'circle', font: { size: 12 } },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` Users: ${ctx.parsed.y}`,
            },
          },
        },
      },
    };

    return new Chart(canvas, config);
  }

  public static buildIncomeVsExpensesBar(
    canvas: HTMLCanvasElement,
    labels: string[],
    incomeData: number[],
    expenseData: number[],
  ): Chart {
    ChartUtils.ensureInitialized();

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            backgroundColor: 'rgba(22,163,74,0.8)',
            borderColor: '#16A34A',
            borderWidth: 1,
          },
          {
            label: 'Expenses',
            data: expenseData,
            backgroundColor: 'rgba(239,68,68,0.8)',
            borderColor: '#EF4444',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 } },
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `$${Number(value).toLocaleString()}`,
              font: { size: 11 },
            },
            grid: { color: '#F1F5F9' },
          },
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { usePointStyle: true, pointStyle: 'circle', font: { size: 12 } },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: $${(ctx.parsed.y ?? 0).toLocaleString()}`,
            },
          },
        },
      },
    };

    return new Chart(canvas, config);
  }

  public static buildGoalsProgressStackedBar(
    canvas: HTMLCanvasElement,
    labels: string[],
    savedData: number[],
    remainingData: number[],
  ): Chart {
    ChartUtils.ensureInitialized();

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Saved',
            data: savedData,
            backgroundColor: 'rgba(11,44,61,0.9)',
            borderColor: '#0B2C3D',
            borderWidth: 1,
            borderRadius: 6,
          },
          {
            label: 'Remaining',
            data: remainingData,
            backgroundColor: 'rgba(226,232,240,1)',
            borderColor: '#E2E8F0',
            borderWidth: 1,
            borderRadius: 6,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: {
            stacked: true,
            beginAtZero: true,
            ticks: {
              callback: (value) => `$${Number(value).toLocaleString()}`,
              font: { size: 11 },
            },
            grid: { color: '#F1F5F9' },
          },
          y: {
            stacked: true,
            grid: { display: false },
            ticks: { font: { size: 11 } },
          },
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { usePointStyle: true, pointStyle: 'circle', font: { size: 12 } },
          },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                ` ${ctx.dataset.label}: $${(ctx.parsed.x ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            },
          },
        },
      },
    };

    return new Chart(canvas, config);
  }
}
