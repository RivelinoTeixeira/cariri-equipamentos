// Tabela responsiva: vira "cards empilhados" em telas pequenas.
// Recebe `columns` (chave, label, render opcional) e `rows`.

export default function ResponsiveTable({
  columns,
  rows,
  emptyMessage = 'Nenhum registro encontrado.',
  onEdit,
  onDelete,
  rowKey = 'id'
}) {
  const hasActions = Boolean(onEdit || onDelete)

  if (!rows || rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-nexus-border bg-nexus-surface/40 p-8 text-center text-sm text-nexus-muted">
        {emptyMessage}
      </div>
    )
  }

  const editBtnClasses =
    'text-xs font-semibold text-nexus-purple hover:bg-nexus-purple/10 px-3 py-1.5 rounded-lg border border-nexus-purple/40'
  const deleteBtnClasses =
    'text-xs font-semibold text-nexus-danger hover:bg-nexus-danger/10 px-3 py-1.5 rounded-lg border border-nexus-danger/30'

  return (
    <>
      {/* Desktop: tabela */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-nexus-border">
        <table className="w-full text-sm">
          <thead className="bg-nexus-surface/60">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-nexus-muted font-semibold"
                >
                  {c.label}
                </th>
              ))}
              {hasActions && <th className="w-40" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row[rowKey]}
                className="border-t border-nexus-border hover:bg-nexus-surface/60 transition"
              >
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3 text-nexus-text">
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
                {hasActions && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className={editBtnClasses}
                        >
                          Editar
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className={deleteBtnClasses}
                        >
                          Excluir
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards empilhados */}
      <div className="md:hidden flex flex-col gap-3">
        {rows.map((row) => (
          <div
            key={row[rowKey]}
            className="rounded-xl border border-nexus-border bg-nexus-surface/60 p-4 backdrop-blur-md"
          >
            <div className="space-y-2">
              {columns.map((c) => (
                <div key={c.key} className="flex justify-between items-start gap-3">
                  <span className="text-[11px] uppercase tracking-wider text-nexus-muted font-semibold">
                    {c.label}
                  </span>
                  <span className="text-sm text-nexus-text text-right break-words max-w-[60%]">
                    {c.render ? c.render(row) : row[c.key]}
                  </span>
                </div>
              ))}
            </div>
            {hasActions && (
              <div className="mt-3 pt-3 border-t border-nexus-border grid grid-cols-2 gap-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(row)}
                    className={`${editBtnClasses} w-full`}
                  >
                    Editar
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(row)}
                    className={`${deleteBtnClasses} w-full ${
                      !onEdit ? 'col-span-2' : ''
                    }`}
                  >
                    Excluir
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
