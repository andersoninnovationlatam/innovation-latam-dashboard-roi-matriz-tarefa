/**
 * Formata uma data calendário ISO (YYYY-MM-DD), como vinda do Postgres `date`.
 * Usa componentes locais (ano/mês/dia) para que o dia exibido coincida com o valor no BD,
 * sem o deslocamento de `new Date("YYYY-MM-DD")` (interpretado como UTC em JS).
 */
export function formatDateOnlyLocal(
  isoDate: string,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const dayPart = isoDate.trim().split("T")[0] ?? "";
  const [ys, ms, ds] = dayPart.split("-");
  const y = Number(ys);
  const m = Number(ms);
  const d = Number(ds);
  if (!ys || !ms || !ds || Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) {
    return isoDate;
  }
  return new Date(y, m - 1, d).toLocaleDateString(locale, options);
}
