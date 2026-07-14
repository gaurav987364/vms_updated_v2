import { useState } from "react"
import { Users, Edit, Trash2 } from "lucide-react"
import { ChildHeader } from "@/components/common/ChildHeader"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/common/SearchBar"
import { FilterBy, type FilterOption } from "@/components/common/FilterBy"
import { Pagination } from "@/components/common/Pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useQuery } from "@/shared/hooks/useQuery"
import { useDebounce } from "@/shared/hooks/useDebounce"
import { UserListItem } from "@/shared/schemas/userSchema"
import { CreateUserModal } from "./CreateUserModal"

// Filter options for sorting
const filterOptions: FilterOption[] = [
  { value: "name", name: "Name (A-Z)" },
  { value: "email", name: "Email" },
  { value: "username", name: "Username" },
  { value: "createdAt", name: "Date Created" },
  { value: "userType", name: "User Type" },
]

const UserListPage = () => {
  const [users, setUsers] = useState<UserListItem[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [perPage, setPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Get URL params
  const search = useQuery("search") || ""
  const filter = useQuery("filter") || "createdAt"
  const page = parseInt(useQuery("page") || "1", 10)

  // Fetch users data
  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call
      // const response = await axios.get(`/api/users?page=${page}&sortBy=${filter}&search=${search}&perPage=${perPage}`)
      // setUsers(response.data.results)
      // setTotalPages(response.data.pages)

      // Mock data for now
      const mockUsers: UserListItem[] = [
        {
          _id: "1",
          name: "John Doe",
          email: "john.doe@example.com",
          username: "johndoe",
          role: "Admin",
          userType: "user",
          department: "IT",
          plantCode: "P001",
        },
        {
          _id: "2",
          name: "Jane Smith",
          email: "jane.smith@example.com",
          username: "janesmith",
          role: "Manager",
          userType: "user",
          department: "Operations",
          plantCode: "P002",
        },
      ]
      setUsers(mockUsers)
      setTotalPages(1)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Debounce fetch on search/filter/page change
  useDebounce(fetchUsers, 500, [page, search, filter, isModalOpen])

  // Handle edit user
  const handleEdit = (userId: string) => {
    setSelectedUserId(userId)
    setIsModalOpen(true)
  }

  // Handle delete user
  const handleDelete = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return

    try {
      // TODO: Replace with actual API call
      // await axios.delete(`/api/users/${userId}`)
      console.log("Deleting user:", userId)
      fetchUsers() // Refresh list
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedUserId(null)
  }

  return (
    <>
      <ChildHeader title="Users Management" icon={Users}>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="gap-2"
        >
          <Users size={16} />
          Add New User
        </Button>
      </ChildHeader>

      {/* Search and Filter Section */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <SearchBar
            label="Search Users"
            placeholder="Search by name, email, or username..."
          />
        </div>
        <div className="w-full sm:w-64">
          <FilterBy
            options={filterOptions}
            label="Sort By"
            defaultValue="createdAt"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[var(--color-primary-light)] hover:bg-[var(--color-primary-light)]">
                <TableHead className="font-bold text-[var(--color-primary)] w-16">
                  S.No.
                </TableHead>
                <TableHead className="font-bold text-[var(--color-primary)]">
                  Name
                </TableHead>
                <TableHead className="font-bold text-[var(--color-primary)]">
                  Email
                </TableHead>
                <TableHead className="font-bold text-[var(--color-primary)]">
                  Username
                </TableHead>
                <TableHead className="font-bold text-[var(--color-primary)]">
                  Role
                </TableHead>
                <TableHead className="font-bold text-[var(--color-primary)]">
                  User Type
                </TableHead>
                <TableHead className="font-bold text-[var(--color-primary)] w-24 text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-[var(--color-text-muted)]">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-[var(--color-text-muted)]">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user, index) => (
                  <TableRow key={user._id}>
                    <TableCell className="text-center text-[var(--color-text-secondary)]">
                      {perPage * (page - 1) + index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-[var(--color-text-primary)]">
                      {user.name}
                    </TableCell>
                    <TableCell className="text-[var(--color-text-secondary)]">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-[var(--color-text-secondary)]">
                      {user.username}
                    </TableCell>
                    <TableCell className="text-[var(--color-text-secondary)]">
                      {user.role}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.userType === "user"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        }`}
                      >
                        {user.userType}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleEdit(user._id)}
                          aria-label="Edit user"
                          className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(user._id)}
                          aria-label="Delete user"
                          className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
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
