import { useLanguage } from '../../hooks/useLanguage.js';

export function DataTable({ columns, rows, emptyMessage }) {
  const { t } = useLanguage();
  const fallbackEmptyMessage = emptyMessage || t('tableEmpty');

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => <th key={column.key}>{column.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>)}
            </tr>
          )) : (
            <tr>
              <td colSpan={columns.length}>{fallbackEmptyMessage}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
