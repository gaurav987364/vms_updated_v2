/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  X,
  Save,
  UserPlus,
  User,
  Mail,
  AtSign,
  Lock,
  Eye,
  EyeOff,
  Building2,
  ShieldCheck,
  MapPin,
  Users,
  Hash,
  // CheckSquare,
} from "lucide-react"
import { useAlert } from "@/context/AlertContext"
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
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
  type UserListItem,
  defaultUserValues,
} from "@/shared/schemas/userSchema"
import { cn } from "@/lib/utils"
import { useUser, useCreateUser, useUpdateUser } from "./helpers/userApi"

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  userId?: string | null
}

/* ────────────────────────────────────────────────
   Reusable field wrapper — icon + input + error
   ──────────────────────────────────────────────── */
interface FieldProps {
  label: string
  htmlFor: string
  required?: boolean
  error?: string
  icon: React.ElementType
  children: React.ReactNode
}

function Field({ label, htmlFor, required, error, icon: Icon, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-[10px] sm:text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
        {label} {required && <span className="text-[var(--color-danger)]">*</span>}
      </Label>
      <div className="relative">
        <Icon
          size={15}
          className="sm:hidden absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
        />
        <Icon
          size={16}
          className="hidden sm:block absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
        />
        {children}
      </div>
      {error && <p className="text-[10px] sm:text-xs text-[var(--color-danger)]">{error}</p>}
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] sm:text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-3 sm:mb-4">
      {children}
    </h3>
  )
}

/**
 * CreateUserModal Component
 * ------------------------------------------------------
 * Modal for creating/editing users.
 * - React Hook Form + Zod validation
 * - Sectioned layout (Basic Info / Security / Access)
 * - Icon-accented inputs, password visibility toggle
 * - Theme-aware styling via CSS variable tokens
 */
export function CreateUserModal({
  isOpen,
  onClose,
  userId,
}: CreateUserModalProps) {
  const isEditMode = Boolean(userId)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { showAlert } = useAlert()

  type UserFormValues = CreateUserInput | UpdateUserInput

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UserFormValues>({
    resolver: zodResolver(isEditMode ? updateUserSchema : createUserSchema),
    defaultValues: defaultUserValues,
  })

  const userTypeValue = watch("userType")

  // Fetch user data with TanStack Query
  const { data: userData } = useUser(userId ?? null, showAlert) as { data?: UserListItem }

  // Create/Update mutations
  const { mutate: createUser, isPending: isCreating } = useCreateUser(showAlert)
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser(showAlert)

  const isSubmitting = isCreating || isUpdating

  // Populate form when editing
  useEffect(() => {
    if (userId && isOpen && userData) {
      reset({
        name: userData.name,
        email: userData.email,
        username: userData.username,
        department: userData.department || "",
        role: userData.role,
        plantCode: userData.plantCode || "",
        userType: userData.userType,
        supplierCode: userData.supplierCode || "",
        isPaid: userData.isPaid || false,
        password: "",
        confirmPassword: "",
      })
    } else if (isOpen && !userId) {
      reset(defaultUserValues)
    }

    setShowPassword(false)
    setShowConfirmPassword(false)
  }, [userId, isOpen, userData, reset])

  const onSubmit = (data: UserFormValues) => {
    if (isEditMode && userId) {
      // Prepare update data
      const updateData: Partial<UpdateUserInput> = {
        name: data.name,
        email: data.email,
        username: data.username,
        department: data.department,
        role: data.role,
        plantCode: data.plantCode,
        userType: data.userType,
        supplierCode: data.userType === "supplier" ? data.supplierCode : undefined,
        isPaid: data.userType === "supplier" ? data.isPaid : undefined,
      }

      // Only include password if it's not empty
      if (data.password && data.password.trim() !== "") {
        updateData.password = data.password
      }

      updateUser(
        { userId, userData: updateData },
        {
          onSuccess: () => {
            onClose()
            reset()
          },
        }
      )
    } else {
      // Create new user
      createUser(data as CreateUserInput, {
        onSuccess: () => {
          onClose()
          reset()
        },
      })
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const inputBase = "h-10 sm:h-11 pl-8 sm:pl-9 text-sm"

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="!max-w-[1120px] w-[96vw] sm:w-[94vw] max-h-[95vh] overflow-y-auto p-0 gap-0"
        showCloseButton={false}
      >
        {/* Header */}
        <DialogHeader className="flex-row items-center justify-between gap-2 sm:gap-4 md:gap-6 border-b border-[var(--color-border)] px-4 sm:px-6 md:px-8 py-4 sm:py-5 sticky top-0 bg-[var(--color-surface)] z-10">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[var(--radius-md)] bg-[var(--color-primary-light)] flex items-center justify-center shrink-0">
              <UserPlus size={18} className="sm:hidden text-[var(--color-primary)]" />
              <UserPlus size={22} className="hidden sm:block text-[var(--color-primary)]" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-sm sm:text-base md:text-lg font-bold uppercase tracking-wide leading-tight truncate">
                {isEditMode ? "Edit User" : "Create New User"}
              </DialogTitle>
              <p className="hidden sm:block text-xs sm:text-sm text-[var(--color-text-muted)] mt-0.5 truncate">
                {isEditMode
                  ? "Update account details and permissions"
                  : "Add a new user or supplier account"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
              className="hidden sm:inline-flex cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="gap-1.5 sm:gap-2 bg-[var(--color-sidebar-bg)] cursor-pointer text-xs sm:text-sm"
            >
              <Save size={14} className="sm:hidden" />
              <Save size={16} className="hidden sm:block" />
              <span>{isSubmitting ? "Saving..." : (isEditMode ? "Update" : "Create")}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              onClick={handleClose}
              disabled={isSubmitting}
              className="sm:size-7 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] cursor-pointer"
            >
              <X size={14} className="sm:hidden" />
              <X size={16} className="hidden sm:block" />
            </Button>
          </div>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 md:py-7 space-y-6 sm:space-y-7 md:space-y-9">
          {/* Basic Information */}
          <section>
            <SectionHeading>Basic Information</SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
              <Field label="Name" htmlFor="name" required icon={User} error={errors.name?.message}>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Enter full name"
                  aria-invalid={!!errors.name}
                  className={cn(inputBase, errors.name && "border-[var(--color-danger)]")}
                />
              </Field>

              <Field label="Email" htmlFor="email" required icon={Mail} error={errors.email?.message}>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="Enter email address"
                  aria-invalid={!!errors.email}
                  className={cn(inputBase, errors.email && "border-[var(--color-danger)]")}
                />
              </Field>

              <Field label="Username" htmlFor="username" required icon={AtSign} error={errors.username?.message}>
                <Input
                  id="username"
                  {...register("username")}
                  placeholder="Enter username"
                  aria-invalid={!!errors.username}
                  className={cn(inputBase, errors.username && "border-[var(--color-danger)]")}
                />
              </Field>
            </div>
          </section>

          {/* Security - Only show in CREATE mode */}
          {!isEditMode && (
            <>
              <div className="h-px bg-[var(--color-border)]" />

              <section>
                <SectionHeading>Security</SectionHeading>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <Field
                    label="Password"
                    htmlFor="password"
                    required
                    icon={Lock}
                    error={errors.password?.message}
                  >
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                      placeholder="Enter password"
                      aria-invalid={!!errors.password}
                      className={cn(inputBase, "pr-10", errors.password && "border-[var(--color-danger)]")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </Field>

                  <Field
                    label="Confirm Password"
                    htmlFor="confirmPassword"
                    required
                    icon={Lock}
                    error={errors.confirmPassword?.message}
                  >
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      {...register("confirmPassword")}
                      placeholder="Confirm password"
                      aria-invalid={!!errors.confirmPassword}
                      className={cn(inputBase, "pr-10", errors.confirmPassword && "border-[var(--color-danger)]")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </Field>
                </div>
              </section>

              <div className="h-px bg-[var(--color-border)]" />
            </>
          )}

          {/* Access Details */}
          <section>
            <SectionHeading>Access Details</SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              <Field label="Department" htmlFor="department" icon={Building2} error={errors.department?.message}>
                <Input
                  id="department"
                  {...register("department")}
                  placeholder="Enter department"
                  aria-invalid={!!errors.department}
                  className={cn(inputBase, errors.department && "border-[var(--color-danger)]")}
                />
              </Field>

              <Field label="Role" htmlFor="role" required icon={ShieldCheck} error={errors.role?.message}>
                <Input
                  id="role"
                  {...register("role")}
                  placeholder="Enter role"
                  aria-invalid={!!errors.role}
                  className={cn(inputBase, errors.role && "border-[var(--color-danger)]")}
                />
              </Field>

              <Field label="Plant Code" htmlFor="plantCode" icon={MapPin} error={errors.plantCode?.message}>
                <Input
                  id="plantCode"
                  {...register("plantCode")}
                  placeholder="Enter plant code"
                  aria-invalid={!!errors.plantCode}
                  className={cn(inputBase, errors.plantCode && "border-[var(--color-danger)]")}
                />
              </Field>

              <div className="space-y-2.5">
                <Label htmlFor="userType" className="text-[10px] sm:text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
                  User Type <span className="text-[var(--color-danger)]">*</span>
                </Label>
                <div className="relative">
                  <Users
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-[var(--color-text-muted)] pointer-events-none"
                  />
                  <Select
                    value={userTypeValue}
                    onValueChange={(value) => setValue("userType", value as "user" | "supplier")}
                  >
                    <SelectTrigger className="w-full h-10 sm:h-11 pl-9 transition-colors duration-300 cursor-pointer">
                      <SelectValue placeholder="Select user type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup className={" cursor-pointer transition-all duration-300"}>
                        <SelectItem value="user" className="cursor-pointer transition-all duration-300">User</SelectItem>
                        <SelectItem value="supplier" className="cursor-pointer transition-all duration-300">Supplier</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                {errors.userType && (
                  <p className="text-[10px] sm:text-xs text-[var(--color-danger)]">{errors.userType.message}</p>
                )}
              </div>
            </div>

            {/* Supplier-Specific Fields */}
            {userTypeValue === "supplier" && (
              <>
                <div className="h-px bg-[var(--color-border)] my-4" />
                <SectionHeading>Supplier Information</SectionHeading>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <Field
                    label="Supplier Code"
                    htmlFor="supplierCode"
                    required
                    icon={Hash}
                    error={errors.supplierCode?.message}
                  >
                    <Input
                      id="supplierCode"
                      {...register("supplierCode")}
                      placeholder="Enter unique supplier code"
                      aria-invalid={!!errors.supplierCode}
                      className={cn(inputBase, errors.supplierCode && "border-[var(--color-danger)]")}
                    />
                  </Field>

                  <div className="space-y-1.5">
                    <Label htmlFor="isPaid" className="text-[10px] sm:text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
                      Payment Status
                    </Label>
                    <div className="flex items-center gap-3 h-10 sm:h-11 px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
                      <input
                        type="checkbox"
                        id="isPaid"
                        {...register("isPaid")}
                        className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 cursor-pointer"
                      />
                      <label
                        htmlFor="isPaid"
                        className="text-sm text-[var(--color-text-primary)] cursor-pointer select-none"
                      >
                        Paid Supplier
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        </form>
      </DialogContent>
    </Dialog>
  )
}