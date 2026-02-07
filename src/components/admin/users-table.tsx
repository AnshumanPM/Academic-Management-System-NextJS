"use client";

import { useState, useEffect, useMemo } from "react";
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
  ArrowUpDown,
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
import { listUsers } from "@/lib/auth-utils";

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

type SortField =
  | "name"
  | "email"
  | "username"
  | "role"
  | "createdAt"
  | "banned"
  | "lastLogin";
type SortDirection = "asc" | "desc";

const ITEMS_PER_PAGE = 10;

export function UsersTable() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);

      try {
        const result = await listUsers();

        if (!result.success) {
          throw new Error(result.message);
        }

        setAllUsers(result.users);
      } catch (error) {
        toast.error("Failed to fetch users");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return allUsers;
    }

    const query = searchQuery.toLowerCase();
    return allUsers.filter((user) => {
      const name = user.name?.toLowerCase() || "";
      const email = user.email?.toLowerCase() || "";
      const username = user.username?.toLowerCase() || "";
      const displayUsername = user.displayUsername?.toLowerCase() || "";

      return (
        name.includes(query) ||
        email.includes(query) ||
        username.includes(query) ||
        displayUsername.includes(query)
      );
    });
  }, [allUsers, searchQuery]);

  const sortedUsers = useMemo(() => {
    const sorted = [...filteredUsers];

    sorted.sort((a: User, b: User) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === "createdAt" || sortField === "lastLogin") {
        const aTime = aValue ? new Date(aValue).getTime() : 0;
        const bTime = bValue ? new Date(bValue).getTime() : 0;
        return sortDirection === "asc" ? aTime - bTime : bTime - aTime;
      }

      if (sortField === "banned") {
        return sortDirection === "asc"
          ? Number(aValue || false) - Number(bValue || false)
          : Number(bValue || false) - Number(aValue || false);
      }

      if (sortField === "username") {
        const aUsername = a.displayUsername || a.username || "";
        const bUsername = b.displayUsername || b.username || "";
        return sortDirection === "asc"
          ? aUsername.localeCompare(bUsername)
          : bUsername.localeCompare(aUsername);
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

    return sorted;
  }, [filteredUsers, sortField, sortDirection]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sortedUsers.slice(startIndex, endIndex);
  }, [sortedUsers, currentPage]);

  const totalPages = Math.ceil(sortedUsers.length / ITEMS_PER_PAGE);
  const total = sortedUsers.length;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleUpdateSuccess = (updatedUser: User) => {
    setAllUsers(
      allUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
    );
    setIsModalOpen(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const SortButton = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(field)}
      className="h-8 px-2 lg:px-3"
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-muted-foreground text-sm whitespace-nowrap">
          {total} user{total !== 1 ? "s" : ""}
        </div>
      </div>

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
            ) : paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
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
                      <div>{new Date(user.createdAt).toLocaleDateString()}</div>
                      <div className="text-muted-foreground text-xs">
                        {new Date(user.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="border text-center align-top">
                    {user.lastLogin ? (
                      <div className="text-sm">
                        <div>
                          {new Date(user.lastLogin).toLocaleDateString()}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {new Date(user.lastLogin).toLocaleTimeString()}
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

      {totalPages > 1 && !isLoading && (
        <div className="flex items-center justify-between px-2">
          <p className="text-muted-foreground text-sm">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, total)} of {total} results
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
