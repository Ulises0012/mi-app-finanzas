import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { Transaction } from '@/hooks/useTransactions';
import type { Categoria } from '@/hooks/useCategories';

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function generarCSV(transactions: Transaction[], categorias: Categoria[]): string {
  const encabezado = 'Fecha,Tipo,Categoría,Monto,Nota';
  const filas = transactions.map((t) => {
    const categoria = categorias.find((c) => c.id === t.categoryId);
    const fecha = t.fecha?.toDate ? t.fecha.toDate().toLocaleDateString('es-SV') : '';
    const tipo = t.tipo === 'ingreso' ? 'Ingreso' : 'Gasto';
    const monto = t.tipo === 'gasto' ? -t.monto : t.monto;
    return [fecha, tipo, csvEscape(categoria?.nombre ?? 'Otro'), monto.toFixed(2), csvEscape(t.nota ?? '')].join(',');
  });
  return [encabezado, ...filas].join('\n');
}

export async function exportarTransaccionesCSV(transactions: Transaction[], categorias: Categoria[]) {
  const csv = generarCSV(transactions, categorias);
  const nombreArchivo = `transacciones_${new Date().toISOString().slice(0, 10)}.csv`;
  const file = new File(Paths.cache, nombreArchivo);
  if (file.exists) file.delete();
  file.create();
  await file.write(csv);

  const disponible = await Sharing.isAvailableAsync();
  if (!disponible) throw new Error('Compartir no está disponible en este dispositivo');
  await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', dialogTitle: 'Exportar transacciones' });
}