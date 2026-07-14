import { AlertTriangle, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "danger"
  icon?: "warning" | "delete"
  onConfirm: () => void
  onCancel?: () => void
  isLoading?: boolean
}

/**
 * ConfirmDialog
 * ------------------------------------------------------
 * A reusable confirmation dialog component with theme-aware styling.
 * Supports both "warning" and "danger" variants with appropriate icons.
 *
 * @example
 * // Usage for delete confirmation
 * <ConfirmDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Delete User"
 *   description="Are you sure you want to delete this user? This action cannot be undone."
 *   confirmText="Delete"
 *   variant="danger"
 *   icon="delete"
 *   onConfirm={handleDelete}
 * />
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  icon = "warning",
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  const IconComponent = icon === "delete" ? Trash2 : AlertTriangle
  const iconColor = variant === "danger" ? "#f87171" : "#fbbf24"
  const iconBgColor = variant === "danger" ? "rgba(248,113,113,0.16)" : "rgba(251,191,36,0.16)"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: iconBgColor }}
            >
              <IconComponent size={20} style={{ color: iconColor }} />
            </div>
            <DialogTitle className="text-[var(--color-text-primary)]">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-[var(--color-text-secondary)] pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="border-t-[var(--color-border)]">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="cursor-pointer"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className={
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                : "cursor-pointer"
            }
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
