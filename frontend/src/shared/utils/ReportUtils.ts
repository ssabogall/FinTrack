// author: Santiago Gómez
// external imports
import { jsPDF } from 'jspdf';

// internal imports
import type { CategoryInterface } from '@/modules/category/interfaces/CategoryInterface';
import type { TransactionInterface } from '@/modules/transaction/interfaces/TransactionInterface';
import type { UserInterface } from '@/modules/user/interfaces/UserInterface';
import { Formatters } from '@/shared/utils/Formatters';

export class ReportUtils {
  public static downloadMonthlyFinancialSummary(
    year: number,
    month: number,
    income: number,
    expenses: number,
    netSavings: number,
    transactionCount: number,
  ): void {
    const doc = new jsPDF();
    const monthName = new Date(year, month - 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    doc.setFontSize(18);
    doc.text('Monthly Financial Summary', 20, 20);
    doc.setFontSize(12);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 25, 190, 25);
    doc.text(`Period: ${monthName}`, 20, 32);

    doc.setFontSize(11);
    let y = 45;
    doc.text(
      `Total Income: $${income.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      20,
      y,
    );
    y += 8;
    doc.text(
      `Total Expenses: $${expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      20,
      y,
    );
    y += 8;
    doc.text(
      `Net Savings: $${netSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      20,
      y,
    );
    y += 8;
    doc.text(`Total Transactions: ${transactionCount}`, 20, y);

    doc.save(`FinTrack-Monthly-Summary-${year}-${month}.pdf`);
  }

  public static downloadTransactionReport(
    transactions: TransactionInterface[],
    year: number,
    month: number,
    getUserName: (userId: number) => string,
  ): void {
    const doc = new jsPDF();
    const monthName = new Date(year, month - 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    doc.setFontSize(18);
    doc.text('Transaction Report', 20, 20);
    doc.setFontSize(12);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 25, 190, 25);
    doc.text(`Period: ${monthName}`, 20, 32);
    doc.text(`Total transactions: ${transactions.length}`, 20, 39);

    doc.setFontSize(9);
    doc.text('Date', 20, 50);
    doc.text('User', 45, 50);
    doc.text('Description', 90, 50);
    doc.text('Amount', 160, 50);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 52, 190, 52);

    let y = 60;
    for (const t of transactions.slice(0, 80)) {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      const dateStr = Formatters.formatShortDate(t.date);
      const user = getUserName(t.userId);
      const desc =
        t.description.length > 35 ? t.description.substring(0, 32) + '...' : t.description;
      const amount =
        t.amount >= 0 ? `+$${t.amount.toFixed(2)}` : `-$${Math.abs(t.amount).toFixed(2)}`;
      doc.text(dateStr, 20, y);
      doc.text(user, 45, y);
      doc.text(desc, 90, y);
      doc.text(amount, 160, y);
      y += 6;
    }

    if (transactions.length > 80) {
      doc.text(`... and ${transactions.length - 80} more transactions`, 20, y + 8);
    }

    doc.save(`FinTrack-Transactions-${year}-${month}.pdf`);
  }

  public static downloadUserActivityReport(
    users: (UserInterface & { balance: number; transactionCount: number })[],
    year: number,
    month: number,
  ): void {
    const doc = new jsPDF();
    const monthName = new Date(year, month - 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    doc.setFontSize(18);
    doc.text('User Activity Report', 20, 20);
    doc.setFontSize(12);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 25, 190, 25);
    doc.text(`Generated: ${monthName}`, 20, 32);
    doc.text(`Total users: ${users.length}`, 20, 39);

    doc.setFontSize(9);
    doc.text('Name', 20, 50);
    doc.text('Email', 60, 50);
    doc.text('Balance', 110, 50);
    doc.text('Transactions', 140, 50);
    doc.text('Join Date', 170, 50);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 52, 190, 52);

    let y = 60;
    for (const u of users) {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      const joinDate = Formatters.formatShortDate(u.createdAt);
      doc.text(u.name, 20, y);
      doc.text(u.email.length > 25 ? u.email.substring(0, 22) + '...' : u.email, 60, y);
      doc.text(Formatters.formatCurrency(u.balance), 110, y);
      doc.text(String(u.transactionCount), 140, y);
      doc.text(joinDate, 170, y);
      y += 6;
    }

    doc.save(`FinTrack-User-Activity-${year}-${month}.pdf`);
  }

  public static downloadCategoryAnalysisReport(
    items: { category: CategoryInterface; amount: number }[],
    year: number,
    month: number,
  ): void {
    const doc = new jsPDF();
    const monthName = new Date(year, month - 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    doc.setFontSize(18);
    doc.text('Category Analysis Report', 20, 20);
    doc.setFontSize(12);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 25, 190, 25);
    doc.text(`Period: ${monthName}`, 20, 32);
    doc.text(`Breakdown by expense categories`, 20, 39);

    doc.setFontSize(9);
    doc.text('Category', 20, 50);
    doc.text('Amount', 140, 50);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 52, 190, 52);

    let y = 60;
    const total = items.reduce((sum, i) => sum + i.amount, 0);
    for (const { category, amount } of items) {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      const pct = total > 0 ? ((amount / total) * 100).toFixed(1) : '0';
      doc.text(category.name, 20, y);
      doc.text(`${Formatters.formatCurrency(amount)} (${pct}%)`, 140, y);
      y += 6;
    }

    if (items.length > 0) {
      doc.setDrawColor(200, 200, 200);
      doc.line(20, y + 2, 190, y + 2);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total: ${Formatters.formatCurrency(total)}`, 20, y + 10);
    }

    doc.save(`FinTrack-Category-Analysis-${year}-${month}.pdf`);
  }
}
