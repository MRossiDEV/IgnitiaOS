"use client"

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import { MoreHorizontal, Edit, Trash2, Shield } from 'lucide-react'
import { format } from 'date-fns'

import type { User } from '@/lib/models/user'
import { ROLE_LABELS, STATUS_LABELS } from '@/lib/models/user'

interface UserTableProps {
  users: User[]
  isLoading?: boolean
  onEdit?: (user: User) => void
  onDelete?: (user: User) => void
}

export function UserTable({
  users,
  isLoading = false,
  onEdit,
  onDelete,
}: UserTableProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null)

  const getDisplayName = (user?: User | null) => {
    if (!user) return 'Unknown User'

    const full = [user.first_name, user.last_name]
      .filter((v): v is string => Boolean(v))
      .join(' ')
      .trim()

    return full || user.email || 'Unnamed User'
  }

  const formatDate = (value?: string | null) => {
    if (!value) return '—'
    const date = new Date(value)
    if (isNaN(date.getTime())) return '—'
    return format(date, 'MMM d, yyyy')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        Loading users...
      </div>
    )
  }

  if (!users?.length) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        No users found. Create your first team member to get started.
      </div>
    )
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-10 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="hover:bg-gray-50">
                {/* NAME */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center text-xs font-semibold">
                      {(
                        user.first_name?.charAt(0) ||
                        user.email?.charAt(0) ||
                        'U'
                      ).toUpperCase()}
                    </div>

                    <span className="font-medium text-sm">
                      {getDisplayName(user)}
                    </span>
                  </div>
                </TableCell>

                {/* EMAIL */}
                <TableCell className="text-sm text-gray-600">
                  {user.email}
                </TableCell>

                {/* ROLE */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    {user.role === 'super_admin' && (
                      <Shield className="w-3 h-3 text-red-500" />
                    )}

                    <Badge
                      variant="outline"
                      className={
                        user.role === 'super_admin'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : user.role === 'admin'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : user.role === 'partner'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }
                    >
                      {ROLE_LABELS?.[user.role] ?? user.role}
                    </Badge>
                  </div>
                </TableCell>

                {/* STATUS */}
                <TableCell>
                  <Badge
                    className={
                      user.status === 'active'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : user.status === 'suspended'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }
                  >
                    {STATUS_LABELS?.[user.status] ?? user.status}
                  </Badge>
                </TableCell>

                {/* LAST LOGIN */}
                <TableCell className="text-sm text-gray-600">
                  {formatDate(user.last_login_at)}
                </TableCell>

                {/* CREATED */}
                <TableCell className="text-sm text-gray-600">
                  {formatDate(user.created_at)}
                </TableCell>

                {/* ACTIONS */}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onEdit?.(user)}
                        className="cursor-pointer"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => setDeleteConfirm(user)}
                        className="cursor-pointer text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* DELETE CONFIRM */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{getDisplayName(deleteConfirm as User)}</strong>? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm) {
                  onDelete?.(deleteConfirm)
                  setDeleteConfirm(null)
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}