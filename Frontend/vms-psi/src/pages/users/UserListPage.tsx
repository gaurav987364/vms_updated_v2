/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react"
import { Users, Edit, Trash2 } from "lucide-react"
import { ChildHeader } from "@/components/common/ChildHeader"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/common/SearchBar"
import { FilterBy } from "@/components/common/FilterBy"
import { Pagination } from "@/components/common/Pagination"
import TableHeaderCustom from "@/components/common/TableHeaderCustom"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { useQuery } from "@/shared/hooks/useQuery"
import { useAlert } from "@/context/AlertContext"
import { CreateUserModal } from "./CreateUserModal"
import { tableHeaderObj, filterOptions } from "./helpers/tableConfig"
import { useUsers, useDeleteUser } from "./helpers/userApi"

const ITEMS_PER_PAGE = 10

const UserListPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const { showAlert, showConfirm } = useAlert()

  // Get URL params with validation
  const search = useQuery("search") || ""
  const filter = useQuery("filter") || "createdAt"
  const rawPage = parseInt(useQuery("page") || "1", 10)
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage

  // Determine sortBy and userType based on filter value
  const isUserTypeFilter = filter === "user" || filter === "supplier"
  const sortBy = isUserTypeFilter ? "createdAt" : filter
  const userType = isUserTypeFilter ? (filter as "user" | "supplier") : undefined

  // Fetch users with TanStack Query
  const { data, isLoading } = useUsers(
    {
      page,
      perPage: ITEMS_PER_PAGE,
      search: search || undefined,
      sortBy,
      userType,
    },
    showAlert
  )

  const users = (data as any)?.results || []
  const totalPages = (data as any)?.pages || 0

  // Delete mutation
  const { mutate: deleteUser } = useDeleteUser(showAlert)

  // Handle edit user
  const handleEdit = (userId: string) => {
    setSelectedUserId(userId)
    setIsModalOpen(true)
  }

  // Handle delete user
  const handleDelete = async (userId: string) => {
    const confirmed = await showConfirm({
      title: "Delete User",
      description: "Are you sure you want to delete this user? This action cannot be undone and will permanently remove all user data.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
      icon: "delete",
    })

    if (confirmed) {
      deleteUser(userId)
    }
  }

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedUserId(null)
  }

  return (
    <>
      <ChildHeader title="Users List" icon={Users}>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="gap-2 cursor-pointer py-5 bg-[var(--color-sidebar-bg)]"
        >
          <Users size={17} />
          Add New User
        </Button>
      </ChildHeader>

      {/* Search and Filter Section */}
      <div className="mb-4 flex justify-between flex-col sm:flex-row gap-4 items-end">
        <div className="w-full sm:w-80 md:w-96">
          <SearchBar
            label="Search Users"
            placeholder="Search by name, email, username, or supplier code..."
          />
        </div>
        <div className="w-full sm:w-64">
          <FilterBy
            options={filterOptions}
            label="Sort By"
            defaultValue="createdAt"
            className=" cursor-pointer"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeaderCustom tableHeaderObj={tableHeaderObj} />
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-[var(--color-text-muted)] border border-[var(--color-border)]">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-[var(--color-text-muted)] border border-[var(--color-border)]">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user: any, index: number) => (
                  <TableRow key={user._id}>
                    <TableCell className="text-center text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                      {ITEMS_PER_PAGE * (page - 1) + index + 1}
                    </TableCell>
                    <TableCell className="text-center font-medium text-[var(--color-text-primary)] border border-[var(--color-border)]">
                      {user.name}
                    </TableCell>
                    <TableCell className="text-center text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-center text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                      {user.username}
                    </TableCell>
                    <TableCell className="text-center text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                      {user.role}
                    </TableCell>
                    <TableCell className="text-center border border-[var(--color-border)]">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.userType === "user"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                              : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          }`}
                        >
                          {user.userType}
                        </span>
                        {user.userType === "supplier" && user.supplierCode && (
                          <span className="text-[10px] text-[var(--color-text-muted)] font-extrabold">
                            {user.supplierCode}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center border border-[var(--color-border)]">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleEdit(user._id)}
                          aria-label="Edit user"
                          className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 cursor-pointer"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(user._id)}
                          aria-label="Delete user"
                          className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && <Pagination totalPages={totalPages} />}
      </div>

      {/* Create/Edit User Modal */}
      <CreateUserModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        userId={selectedUserId}
      />
    </>
  )
}

export default UserListPage
