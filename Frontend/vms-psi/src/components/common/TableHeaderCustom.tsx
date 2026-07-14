import { TableHead, TableHeader, TableRow } from "@/components/ui/table"

/**
 * TableHeaderCustom Component
 * ------------------------------------------------------
 * A flexible table header component that supports multi-dimensional headers.
 * Structure: Array of arrays - First layer for rows, inner arrays for cells.
 *
 * @example
 * const tableHeaderObj = [
 *   [
 *     { text: 'S.No.', rowspan: 1, colspan: 1, style: {...} },
 *     { text: 'Name', rowspan: 1, colspan: 1, style: {...} }
 *   ]
 * ]
 */

export type TableHeaderObj = {
  text: string
  component?: React.ReactNode
  rowspan?: number
  colspan?: number
  style?: React.CSSProperties
}

interface TableHeaderCustomProps {
  tableHeaderObj: TableHeaderObj[][]
  customStyle?: React.CSSProperties
  sticky?: boolean
}

const TableHeaderCustom = ({
  tableHeaderObj,
  customStyle,
  sticky = false,
}: TableHeaderCustomProps) => {
  return (
    <TableHeader>
      {tableHeaderObj.map((row, rowIndex) => (
        <TableRow
          key={`header-row-${rowIndex}`}
          className="bg-[var(--color-primary-light)] hover:bg-[var(--color-primary-light)]"
          style={{
            ...(sticky && {
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }),
            ...customStyle,
          }}
        >
          {row.map((col, colIndex) => (
            <TableHead
              key={`header-cell-${rowIndex}-${colIndex}`}
              rowSpan={col.rowspan || 1}
              colSpan={col.colspan || 1}
              className="font-bold text-[var(--color-primary)] text-center uppercase border border-[var(--color-border)]"
              style={{
                textAlign: 'center',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                ...col.style,
              }}
            >
              {col.text}
              {col.component && col.component}
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableHeader>
  )
}

export default TableHeaderCustom
