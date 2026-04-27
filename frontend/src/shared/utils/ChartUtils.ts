// author: all of us

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
  type ChartDataset,
  type ChartConfiguration,
  type ChartType,
  type TooltipItem,
} from 'chart.js';

export class ChartUtils {
  private static readonly NEUTRAL_COLORS = {
    white: '#FFFFFF',
    gray100: '#F1F5F9',
    gray200: '#E2E8F0',
    slate900: '#0B2C3D',
    green500: '#16A34A',
    red500: '#EF4444',
  } as const;

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

  private static formatCurrency(value: number, minimumFractionDigits = 0): string {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits })}`;
  }

  private static formatCurrencyFromTick(value: string | number): string {
    return ChartUtils.formatCurrency(Number(value));
  }

  private static buildMoneyTooltipLabel<TType extends ChartType>(
    context: TooltipItem<TType>,
    amount: number,
    minimumFractionDigits = 0,
  ): string {
    const valueLabel = ChartUtils.formatCurrency(amount, minimumFractionDigits);
    const datasetLabel = (context.dataset as { label?: string }).label;
    return datasetLabel ? ` ${datasetLabel}: ${valueLabel}` : ` ${valueLabel}`;
  }

  private static buildLegend(position: 'top' | 'bottom') {
    return {
      position,
      labels: {
        usePointStyle: true,
        pointStyle: 'circle' as const,
        font: { size: 12 },
      },
    };
  }

  private static buildCartesianScales({
    currency = false,
    stacked = false,
    indexAxis = 'x',
  }: {
    currency?: boolean;
    stacked?: boolean;
    indexAxis?: 'x' | 'y';
  }) {
    const valueAxis = indexAxis === 'x' ? 'y' : 'x';
    const labelAxis = indexAxis === 'x' ? 'x' : 'y';

    return {
      [labelAxis]: {
        stacked,
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
      [valueAxis]: {
        stacked,
        beginAtZero: true,
        ticks: {
          ...(currency
            ? { callback: (value: string | number) => ChartUtils.formatCurrencyFromTick(value) }
            : {}),
          font: { size: 11 },
        },
        grid: { color: ChartUtils.NEUTRAL_COLORS.gray100 },
      },
    };
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
            backgroundColor: [color, ChartUtils.NEUTRAL_COLORS.gray200],
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
              label: (ctx) => ChartUtils.buildMoneyTooltipLabel(ctx, ctx.parsed),
            },
          },
          legend: { display: false },
        },
      },
    };

    return new Chart(canvas, config) as unknown as Chart;
  }

  public static buildCategoryDistributionPie(
    canvas: HTMLCanvasElement,
    labels: string[],
    data: number[],
    colors: string[],
  ): Chart {
    ChartUtils.ensureInitialized();
    const total = data.reduce((acc, value) => acc + value, 0);
    const bottomLegend = ChartUtils.buildLegend('bottom');

    const config: ChartConfiguration<'pie'> = {
      type: 'pie',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors,
            borderColor: ChartUtils.NEUTRAL_COLORS.white,
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
            ...bottomLegend,
            labels: { ...bottomLegend.labels, padding: 16 },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const percentage = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : '0';
                return ` ${ctx.label}: ${ChartUtils.formatCurrency(ctx.parsed, 2)} (${percentage}%)`;
              },
            },
          },
        },
      },
    };

    return new Chart(canvas, config) as unknown as Chart;
  }

  public static buildMovementTrendsLine(
    canvas: HTMLCanvasElement,
    labels: string[],
    incomeData: number[],
    expenseData: number[],
  ): Chart {
    ChartUtils.ensureInitialized();
    const datasetDefaults: Pick<
      ChartDataset<'line', number[]>,
      'fill' | 'tension' | 'pointRadius'
    > = {
      fill: true,
      tension: 0.4,
      pointRadius: 3,
    };

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            borderColor: ChartUtils.NEUTRAL_COLORS.green500,
            backgroundColor: 'rgba(22,163,74,0.15)',
            pointBackgroundColor: ChartUtils.NEUTRAL_COLORS.green500,
            ...datasetDefaults,
          },
          {
            label: 'Expenses',
            data: expenseData,
            borderColor: ChartUtils.NEUTRAL_COLORS.red500,
            backgroundColor: 'rgba(239,68,68,0.10)',
            pointBackgroundColor: ChartUtils.NEUTRAL_COLORS.red500,
            ...datasetDefaults,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: ChartUtils.buildCartesianScales({ currency: true }),
        plugins: {
          legend: ChartUtils.buildLegend('top'),
          tooltip: {
            callbacks: {
              label: (ctx) => ChartUtils.buildMoneyTooltipLabel(ctx, ctx.parsed.y ?? 0),
            },
          },
        },
      },
    };

    return new Chart(canvas, config) as unknown as Chart;
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
            borderColor: ChartUtils.NEUTRAL_COLORS.white,
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
              label: (ctx) => ` ${ctx.label}: ${ChartUtils.formatCurrency(ctx.parsed, 2)}`,
            },
          },
        },
      },
    };

    return new Chart(canvas, config) as unknown as Chart;
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
            borderColor: ChartUtils.NEUTRAL_COLORS.slate900,
            backgroundColor: 'rgba(11,44,61,0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: ChartUtils.NEUTRAL_COLORS.slate900,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: ChartUtils.buildCartesianScales({ currency: false }),
        plugins: {
          legend: ChartUtils.buildLegend('top'),
          tooltip: {
            callbacks: {
              label: (ctx) => ` Users: ${ctx.parsed.y}`,
            },
          },
        },
      },
    };

    return new Chart(canvas, config) as unknown as Chart;
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
            borderColor: ChartUtils.NEUTRAL_COLORS.green500,
            borderWidth: 1,
          },
          {
            label: 'Expenses',
            data: expenseData,
            backgroundColor: 'rgba(239,68,68,0.8)',
            borderColor: ChartUtils.NEUTRAL_COLORS.red500,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: ChartUtils.buildCartesianScales({ currency: true }),
        plugins: {
          legend: ChartUtils.buildLegend('top'),
          tooltip: {
            callbacks: {
              label: (ctx) => ChartUtils.buildMoneyTooltipLabel(ctx, ctx.parsed.y ?? 0),
            },
          },
        },
      },
    };

    return new Chart(canvas, config) as unknown as Chart;
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
            borderColor: ChartUtils.NEUTRAL_COLORS.slate900,
            borderWidth: 1,
            borderRadius: 6,
          },
          {
            label: 'Remaining',
            data: remainingData,
            backgroundColor: 'rgba(226,232,240,1)',
            borderColor: ChartUtils.NEUTRAL_COLORS.gray200,
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
        scales: ChartUtils.buildCartesianScales({ currency: true, stacked: true, indexAxis: 'y' }),
        plugins: {
          legend: ChartUtils.buildLegend('top'),
          tooltip: {
            callbacks: {
              label: (ctx) => ChartUtils.buildMoneyTooltipLabel(ctx, ctx.parsed.x ?? 0, 2),
            },
          },
        },
      },
    };

    return new Chart(canvas, config) as unknown as Chart;
  }
}
