import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { X, Save, UserPlus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createUserSchema,
  type CreateUserInput,
  defaultUserValues,
} from "@/shared/schemas/userSchema"
import { cn } from "@/lib/utils"

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  userId?: string | null
}

/**
 * CreateUserModal Component
 * ------------------------------------------------------
 * A feature-rich modal for creating/editing users.
 * Features:
 * - React Hook Form with Zod validation
 * - Create and Edit modes
 * - Beautiful, responsive UI
 * - Theme-aware styling
 * - Real-time validation feedback
 */
export function CreateUserModal({
  isOpen,
  onClose,
  userId,
}: CreateUserModalProps) {
  const isEditMode = Boolean(userId)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: defaultUserValues,
  })

  const userTypeValue = watch("userType")

  // Fetch user data for edit mode
  useEffect(() => {
    if (userId && isOpen) {
      // TODO: Replace with actual API call
      // const fetchUser = async () => {
      //   const response = await axios.get(`/api/users/${userId}`)
      //   reset(response.data)
      // }
      // fetchUser()

      // Mock data for now
      reset({
        name: "John Doe",
        email: "john.doe@example.com",
        username: "johndoe",
        department: "IT",
        role: "Admin",
        plantCode: "P001",
        userType: "user",
        password: "",
        confirmPassword: "",
      })
    } else if (isOpen) {
      reset(defaultUserValues)
    }
  }, [userId, isOpen, reset])

  // Handle form submission
  const onSubmit = async (data: CreateUserInput) => {
    try {
      if (isEditMode) {
        // TODO: Replace with actual API call
        // await axios.put(`/api/users/${userId}`, data)
        console.log("Updating user:", data)
      } else {
        // TODO: Replace with actual API call
        // await axios.post('/api/users', data)
        console.log("Creating user:", data)
      }

      // Close modal and reset form
      onClose()
      reset()
    } catch (error) {
      console.error("Error saving user:", error)
    }
  }

  // Handle modal close
  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        showCloseButton={false}
      >
        {/* Header with title and buttons */}
        <DialogHeader className="flex-row items-center justify-between border-b border-[var(--color-border)] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-primary-light)] flex items-center justify-center">
              <UserPlus size={20} className="text-[var(--color-primary)]" />
            </div>
            <DialogTitle className="text-lg font-bold uppercase tracking-wide">
              {isEditMode ? "Edit User" : "Create New User"}
            </DialogTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="gap-2"
            >
              <Save size={16} />
              {isEditMode ? "Update" : "Create"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X size={16} />
            </Button>
          </div>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter full name"
              aria-invalid={!!errors.name}
              className={cn(errors.name && "border-red-500")}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="Enter email address"
              aria-invalid={!!errors.email}
              className={cn(errors.email && "border-red-500")}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Username Field */}
          <div className="space-y-2">
            <Label htmlFor="username">
              Username <span className="text-red-500">*</span>
            </Label>
            <Input
              id="username"
              {...register("username")}
              placeholder="Enter username"
              aria-invalid={!!errors.username}
              className={cn(errors.username && "border-red-500")}
            />
            {errors.username && (
              <p className="text-xs text-red-500 mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Two Column Layout for Password Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Password {!isEditMode && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder={isEditMode ? "Leave blank to keep current" : "Enter password"}
                aria-invalid={!!errors.password}
                className={cn(errors.password && "border-red-500")}
              />
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirm Password {!isEditMode && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                placeholder={isEditMode ? "Leave blank to keep current" : "Confirm password"}
                aria-invalid={!!errors.confirmPassword}
                className={cn(errors.confirmPassword && "border-red-500")}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          {/* Department Field */}
          <div className="space-y-2">
            <Label htmlFor="department">
              Department <span className="text-red-500">*</span>
            </Label>
            <Input
              id="department"
              {...register("department")}
              placeholder="Enter department"
              aria-invalid={!!errors.department}
              className={cn(errors.department && "border-red-500")}
            />
            {errors.department && (
              <p className="text-xs text-red-500 mt-1">
                {errors.department.message}
              </p>
            )}
          </div>

          {/* Two Column Layout for Role and Plant Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Role Field */}
            <div className="space-y-2">
              <Label htmlFor="role">
                Role <span className="text-red-500">*</span>
              </Label>
              <Input
                id="role"
                {...register("role")}
                placeholder="Enter role"
                aria-invalid={!!errors.role}
                className={cn(errors.role && "border-red-500")}
              />
              {errors.role && (
                <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>
              )}
            </div>

            {/* Plant Code Field */}
            <div className="space-y-2">
              <Label htmlFor="plantCode">
                Plant Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="plantCode"
                {...register("plantCode")}
                placeholder="Enter plant code"
                aria-invalid={!!errors.plantCode}
                className={cn(errors.plantCode && "border-red-500")}
              />
              {errors.plantCode && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.plantCode.message}
                </p>
              )}
            </div>
          </div>

          {/* User Type Field */}
          <div className="space-y-2">
            <Label htmlFor="userType">
              User Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={userTypeValue}
              onValueChange={(value) => setValue("userType", value as "user" | "supplier")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="supplier">Supplier</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.userType && (
              <p className="text-xs text-red-500 mt-1">
                {errors.userType.message}
              </p>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
