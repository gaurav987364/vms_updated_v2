import type { TableHeaderObj } from "@/components/common/TableHeaderCustom"
import type { FilterOption } from "@/components/common/FilterBy"

/**
 * User Table Configuration
 * ------------------------------------------------------
 * Contains table headers and filter options for the users list
 */

// Table header configuration
export const tableHeaderObj: TableHeaderObj[][] = [
  [
    {
      text: "S.No.",
      rowspan: 1,
      colspan: 1,
      style: { width: '60px' }
    },
    {
      text: "Name",
      rowspan: 1,
      colspan: 1
    },
    {
      text: "Email",
      rowspan: 1,
      colspan: 1
    },
    {
      text: "Username",
      rowspan: 1,
      colspan: 1
    },
    {
      text: "Role",
      rowspan: 1,
      colspan: 1
    },
    {
      text: "User Type",
      rowspan: 1,
      colspan: 1
    },
    {
      text: "Actions",
      rowspan: 1,
      colspan: 1,
      style: { width: '120px' }
    },
  ],
]

// Filter options for sorting
export const filterOptions: FilterOption[] = [
  { value: "createdAt", name: "Date Created" },
  {
    value: "userType",
    name: "User Type",
    children: [
      { value: "user", name: "User" },
      { value: "supplier", name: "Supplier" }
    ]
  },
]
