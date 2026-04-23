export class AdminUtils {
  public static getMonthRange(year: number, month: number): { monthStart: number; monthEnd: number } {
    return {
      monthStart: new Date(year, month - 1, 1).getTime(),
      monthEnd: new Date(year, month, 0, 23, 59, 59).getTime(),
    };
  }
}
