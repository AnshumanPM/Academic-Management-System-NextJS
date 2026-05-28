"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UpdateUserModal } from "@/components/admin/update-user-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Edit,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { toast } from "sonner";
import { listUsers, type ListUsersParams } from "@/lib/auth-utils";

type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  role?: string;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: string | Date | null;
  username?: string | null;
  displayUsername?: string | null;
  lastLogin?: string | Date | null;
};

type SortField = NonNullable<ListUsersParams["sortBy"]>;
type SortDirection = "asc" | "desc";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
const SEARCH_DEBOUNCE_MS = 400;

const formatDate = (value: string | Date) => {
  const d = new Date(value);
  return {
    date: d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  };
};

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);
  const [isLoading, setIsLoading] = useState(true);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // reset to page 1 on new search
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: ListUsersParams = {
        page: currentPage,
        limit: pageSize,
        sortBy: sortField,
        sortDirection,
      };

      if (debouncedSearch.trim()) {
        params.searchValue = debouncedSearch.trim();
      }

      const result = await listUsers(params);

      if (!result.success) {
        throw new Error(result.message);
      }

      setUsers(result.users as User[]);
      setTotal(result.total ?? 0);
    } catch (error) {
      toast.error("Failed to fetch users");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, sortField, sortDirection, pageSize]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value) as (typeof PAGE_SIZE_OPTIONS)[number]);
    setCurrentPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleUpdateSuccess = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
    );
    setIsModalOpen(false);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const SortButton = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => {
    const isActive = sortField === field;
    const Icon = isActive
      ? sortDirection === "asc"
        ? ArrowUp
        : ArrowDown
      : ArrowUpDown;
    return (
      <Button
        variant="ghost"
        onClick={() => handleSort(field)}
        className={`h-8 px-2 lg:px-3 ${isActive ? "text-foreground font-semibold" : ""}`}
      >
        {children}
        <Icon
          className={`ml-2 h-4 w-4 ${isActive ? "opacity-100" : "opacity-40"}`}
        />
      </Button>
    );
  };

  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  return (
    <div className="space-y-6">
      {/* Search bar + count */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search by name, email or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          {isLoading && searchQuery && (
            <Loader2 className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin" />
          )}
        </div>
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-muted-foreground text-sm">Rows</span>
          <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-muted-foreground text-sm whitespace-nowrap">
          {total} user{total !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="border text-center whitespace-nowrap">
                Avatar
              </TableHead>
              <TableHead className="border whitespace-nowrap">
                <SortButton field="name">Name</SortButton>
              </TableHead>
              <TableHead className="border whitespace-nowrap">
                <SortButton field="email">Email</SortButton>
              </TableHead>
              <TableHead className="border whitespace-nowrap">
                <SortButton field="username">Username</SortButton>
              </TableHead>
              <TableHead className="border text-center whitespace-nowrap">
                <SortButton field="role">Role</SortButton>
              </TableHead>
              <TableHead className="border text-center whitespace-nowrap">
                <SortButton field="banned">Status</SortButton>
              </TableHead>
              <TableHead className="border text-center whitespace-nowrap">
                <SortButton field="createdAt">Joined</SortButton>
              </TableHead>
              <TableHead className="border text-center whitespace-nowrap">
                <SortButton field="lastLogin">Last Login</SortButton>
              </TableHead>
              <TableHead className="border text-center whitespace-nowrap">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading users...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="border text-center align-top">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.image || undefined}
                        alt={user.name}
                      />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="border align-top font-medium whitespace-nowrap">
                    {user.name}
                  </TableCell>
                  <TableCell className="border align-top">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      {user.email}
                      {user.emailVerified && (
                        <Badge variant="outline" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="border align-top whitespace-nowrap">
                    {user.displayUsername || user.username || (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="border text-center align-top">
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="border text-center align-top">
                    {user.banned ? (
                      <Badge variant="destructive">Banned</Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-600">
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="border text-center align-top">
                    <div className="text-sm">
                      <div>{formatDate(user.createdAt).date}</div>
                      <div className="text-muted-foreground text-xs">
                        {formatDate(user.createdAt).time}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="border text-center align-top">
                    {user.lastLogin ? (
                      <div className="text-sm">
                        <div>{formatDate(user.lastLogin).date}</div>
                        <div className="text-muted-foreground text-xs">
                          {formatDate(user.lastLogin).time}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        Never
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="border text-center align-top">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!isLoading && total > pageSize && (
        <div className="flex items-center justify-between px-2">
          <p className="text-muted-foreground text-sm">
            Showing {startItem} to {endItem} of {total} results
          </p>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
              </PaginationItem>

              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <Button
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className="w-9"
                          >
                            {page}
                          </Button>
                        </PaginationItem>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-1">
                          ...
                        </span>
                      );
                    }
                    return null;
                  },
                )}
              </div>

              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {selectedUser && (
        <UpdateUserModal
          user={selectedUser}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
}
