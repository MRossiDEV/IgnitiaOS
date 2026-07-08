"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  Users,
  UserPlus,
  Search,
  RefreshCw,
  Download,
  Upload,
  Shield,
  Crown,
  Briefcase,
  Building2,
  UserCheck,
  UserX,
  Loader2,
  AlertCircle,
  Activity,
  Mail,
  Phone,
  Edit,
  Trash2,
  Eye,
  KeyRound,
  CheckCircle2,
  XCircle,
  Clock3,
  MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Alert, AlertDescription } from "@/components/ui/alert";

import { useToast } from "@/hooks/use-toast";

import type {
  User,
  CreateUserInput,
  UpdateUserInput,
} from "@/lib/models/user";

const ROLE_COLORS: Record<string, string> = {
  super_admin:
    "bg-red-500/10 text-red-400 border-red-500/20",
  admin:
    "bg-purple-500/10 text-purple-400 border-purple-500/20",
  manager:
    "bg-blue-500/10 text-blue-400 border-blue-500/20",
  partner:
    "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  sales:
    "bg-green-500/10 text-green-400 border-green-500/20",
  agent:
    "bg-amber-500/10 text-amber-400 border-amber-500/20",
  contractor:
    "bg-orange-500/10 text-orange-400 border-orange-500/20",
  client:
    "bg-pink-500/10 text-pink-400 border-pink-500/20",
  user:
    "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const STATUS_COLORS: Record<string, string> = {
  active:
    "bg-green-500/10 text-green-400 border-green-500/20",
  inactive:
    "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  suspended:
    "bg-red-500/10 text-red-400 border-red-500/20",
  pending:
    "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

export default function UsersManagementPage() {
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] =
    useState("all");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/users",
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load users");
      }

      const data = await response.json();

      setUsers(data.users || []);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load users";

      setError(message);

      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(user: User) {
    if (
      !confirm(
        `Delete ${
          user.first_name || user.email
        } ?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/users/${user.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setUsers((prev) =>
        prev.filter((u) => u.id !== user.id)
      );

      toast({
        title: "User Deleted",
        description:
          "User removed successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error
            ? err.message
            : "Delete failed",
        variant: "destructive",
      });
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchMatch =
        !search ||
        user.email
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        user.first_name
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const roleMatch =
        roleFilter === "all" ||
        user.role === roleFilter;

      const statusMatch =
        statusFilter === "all" ||
        user.status === statusFilter;

      return (
        searchMatch &&
        roleMatch &&
        statusMatch
      );
    });
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
  ]);

  const stats = useMemo(() => {
    const active = users.filter(
      (u) => u.status === "active"
    ).length;

    const admins = users.filter((u) =>
      ["admin", "super_admin"].includes(
        u.role
      )
    ).length;

    const partners = users.filter(
      (u) => u.role === "partner"
    ).length;

    const suspended = users.filter(
      (u) => u.status === "suspended"
    ).length;

    return {
      total: users.length,
      active,
      admins,
      partners,
      suspended,
    };
  }, [users]);

  const roleBreakdown = useMemo(() => {
    const map: Record<string, number> = {};

    users.forEach((user) => {
      map[user.role] =
        (map[user.role] || 0) + 1;
    });

    return Object.entries(map).sort(
      (a, b) => b[1] - a[1]
    );
  }, [users]);

  const maxRoleCount = Math.max(
    ...roleBreakdown.map((r) => r[1]),
    1
  );

  return (
    <div className="p-6 space-y-6 text-white">

      {/* HEADER */}

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">

        <div>
          <h1 className="text-3xl font-bold">
            Users Intelligence Center
          </h1>

          <p className="text-zinc-500 text-sm">
            Manage users, permissions,
            security, departments and
            platform access.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">

          <Button
            variant="outline"
            className="border-white/10 bg-white/5"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>

          <Button
            variant="outline"
            className="border-white/10 bg-white/5"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Link href="/admin/users/new">
            <Button className="bg-cyan-500 text-black hover:bg-cyan-400">
              <UserPlus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </Link>

        </div>
      </div>

      {/* ERROR */}

      {error && (
        <Alert className="border-red-500/20 bg-red-500/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* KPI SECTION */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">

        <KPI
          title="Total Users"
          value={stats.total}
          icon={<Users size={16} />}
        />

        <KPI
          title="Active Users"
          value={stats.active}
          icon={<UserCheck size={16} />}
        />

        <KPI
          title="Administrators"
          value={stats.admins}
          icon={<Shield size={16} />}
        />

        <KPI
          title="Partners"
          value={stats.partners}
          icon={<Building2 size={16} />}
        />

        <KPI
          title="Suspended"
          value={stats.suspended}
          icon={<UserX size={16} />}
        />

      </div>
          {/* SEARCH + ANALYTICS */}

      <div className="grid lg:grid-cols-3 gap-6">

        {/* SEARCH PANEL */}

        <div className="lg:col-span-2 border border-white/10 bg-white/5 rounded-2xl p-5">

          <div className="flex flex-col lg:flex-row gap-4">

            <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-xl px-3 py-2 flex-1">
              <Search
                size={16}
                className="text-zinc-500"
              />
              <Input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search users..."
                className="border-0 bg-transparent focus-visible:ring-0"
              />
            </div>

            <Select
              value={roleFilter}
              onValueChange={setRoleFilter}
            >
              <SelectTrigger className="w-full lg:w-[220px] bg-black/30 border-white/10">
                <SelectValue placeholder="Role" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All Roles
                </SelectItem>

                <SelectItem value="super_admin">
                  Super Admin
                </SelectItem>

                <SelectItem value="admin">
                  Admin
                </SelectItem>

                <SelectItem value="manager">
                  Manager
                </SelectItem>

                <SelectItem value="sales">
                  Sales
                </SelectItem>

                <SelectItem value="agent">
                  Agent
                </SelectItem>

                <SelectItem value="partner">
                  Partner
                </SelectItem>

                <SelectItem value="contractor">
                  Contractor
                </SelectItem>

                <SelectItem value="client">
                  Client
                </SelectItem>

                <SelectItem value="user">
                  User
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full lg:w-[220px] bg-black/30 border-white/10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All Statuses
                </SelectItem>

                <SelectItem value="active">
                  Active
                </SelectItem>

                <SelectItem value="inactive">
                  Inactive
                </SelectItem>

                <SelectItem value="pending">
                  Pending
                </SelectItem>

                <SelectItem value="suspended">
                  Suspended
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={loadUsers}
              className="border-white/10 bg-white/5"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

          </div>

        </div>

        {/* ROLE BREAKDOWN */}

        <div className="border border-white/10 bg-white/5 rounded-2xl p-5">

          <h2 className="font-bold mb-4">
            User Roles
          </h2>

          <div className="space-y-4">

            {roleBreakdown.map(([role, count]) => (
              <div key={role}>

                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">
                    {role.replace("_", " ")}
                  </span>

                  <span className="text-zinc-400">
                    {count}
                  </span>
                </div>

                <div className="h-2 bg-white/10 rounded">
                  <div
                    className="h-2 rounded bg-cyan-500"
                    style={{
                      width: `${
                        (count /
                          maxRoleCount) *
                        100
                      }%`,
                    }}
                  />
                </div>

              </div>
            ))}

          </div>

        </div>

      </div>

      {/* USERS TABLE */}

      <div className="border border-white/10 bg-white/5 rounded-2xl overflow-hidden">

        <div className="p-5 border-b border-white/10 flex justify-between items-center">

          <div>
            <h2 className="font-bold text-lg">
              Platform Users
            </h2>

            <p className="text-xs text-zinc-500">
              {filteredUsers.length} users
              found
            </p>
          </div>

        </div>

        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-black/30">

                <tr>

                  <th className="text-left p-4">
                    User
                  </th>

                  <th className="text-left p-4">
                    Role
                  </th>

                  <th className="text-left p-4">
                    Status
                  </th>

                  <th className="text-left p-4">
                    Email
                  </th>

                  <th className="text-left p-4">
                    Last Login
                  </th>

                  <th className="text-right p-4">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredUsers.map((user) => (

                  <tr
                    key={user.id}
                    className="border-t border-white/10 hover:bg-white/5"
                  >

                    <td className="p-4">

                      <div className="flex items-center gap-3">

                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-black font-bold">
                          {(
                            user.first_name ||
                            user.email
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>

                          <p className="font-medium">
                            {user.first_name ||
                              "Unnamed User"}
                          </p>

                          <p className="text-xs text-zinc-500">
                            {user.id.slice(
                              0,
                              8
                            )}
                          </p>

                        </div>

                      </div>

                    </td>

                    <td className="p-4">

                      <span
                        className={`px-2 py-1 rounded-full border text-xs ${
                          ROLE_COLORS[
                            user.role
                          ] ||
                          ROLE_COLORS.user
                        }`}
                      >
                        {user.role}
                      </span>

                    </td>

                    <td className="p-4">

                      <span
                        className={`px-2 py-1 rounded-full border text-xs ${
                          STATUS_COLORS[
                            user.status
                          ] ||
                          STATUS_COLORS.active
                        }`}
                      >
                        {user.status}
                      </span>

                    </td>

                    <td className="p-4 text-zinc-400">
                      {user.email}
                    </td>

                    <td className="p-4 text-zinc-500">

                      {user.last_login_at
                        ? new Date(
                            user.last_login_at
                          ).toLocaleDateString()
                        : "Never"}

                    </td>

                    <td className="p-4 text-right">

                      <DropdownMenu>

                        <DropdownMenuTrigger
                          asChild
                        >
                          <Button
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">

                          <DropdownMenuItem
                            asChild
                          >
                            <Link
                              href={`/admin/users/${user.id}`}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            asChild
                          >
                            <Link
                              href={`/admin/users/${user.id}/edit`}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem>
                            <KeyRound className="h-4 w-4 mr-2" />
                            Reset Password
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() =>
                              deleteUser(user)
                            }
                            className="text-red-400"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>

                        </DropdownMenuContent>

                      </DropdownMenu>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

function KPI({
  title,
  value,
  icon,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <div className="border border-white/10 bg-white/5 rounded-2xl p-4">

      <div className="flex justify-between items-center">

        <p className="text-xs text-zinc-500">
          {title}
        </p>

        <div className="text-cyan-400">
          {icon}
        </div>

      </div>

      <p className="text-2xl font-bold mt-2">
        {value}
      </p>

    </div>
  );
}