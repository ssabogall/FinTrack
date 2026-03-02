// author: Santiago Gómez Ospina

export class Formatters {
  public static initialsFromName(name: string | null | undefined): string {
    if (!name) return 'FT';

    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .slice(0, 2)
      .join('') || 'FT';
  }

  public static roleLabel(role: string | null | undefined): string {
    if (role === 'admin') return 'Admin';
    if (role === 'user') return 'User';
    return role ?? 'User';
  }

  public static memberSince(date: Date | string | null | undefined, locale = 'en-US'): string {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return '';

    return d.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  }

  public static formatShortDate(date: Date | string | null | undefined, locale = 'en-US'): string {
    if (!date) return '—';
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return '—';

    return d.toLocaleDateString(locale);
  }
}

