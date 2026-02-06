"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { adminUpdateUser } from "@/lib/auth-utils";

const updateUserFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["user", "admin"]),
  banned: z.boolean(),
  banReason: z.string().optional(),
  banExpires: z.string().optional(),
  username: z.string().optional(),
});

type UpdateUserFormValues = z.infer<typeof updateUserFormSchema>;

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
};

interface UpdateUserModalProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateSuccess: (user: User) => void;
}

export function UpdateUserModal({
  user,
  open,
  onOpenChange,
  onUpdateSuccess,
}: UpdateUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isBanned, setIsBanned] = useState(user.banned || false);

  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserFormSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      role: (user.role as "user" | "admin") || "user",
      banned: user.banned || false,
      banReason: user.banReason || "",
      banExpires:
        typeof user.banExpires === "object" && user.banExpires instanceof Date
          ? user.banExpires.toISOString().slice(0, 16)
          : user.banExpires || "",
      username: user.username || "",
    },
  });

  const onSubmit = async (data: UpdateUserFormValues) => {
    setIsLoading(true);
    try {
      const result = await adminUpdateUser({
        userId: user.id,
        name: data.name,
        email: data.email,
        role: data.role,
        banned: data.banned,
        banReason: data.banned ? data.banReason || null : null,
        banExpires: data.banned ? data.banExpires || null : null,
        username: data.username || null,
      });

      if (result.success) {
        toast.success(result.message);
        onUpdateSuccess({
          ...user,
          name: data.name,
          email: data.email,
          role: data.role,
          banned: data.banned,
          banReason: data.banned ? data.banReason || null : null,
          banExpires: data.banned ? data.banExpires || null : null,
          username: data.username || null,
        });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to update user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update User</DialogTitle>
          <DialogDescription>
            Make changes to user information below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Enter name"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="Enter email"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              {...form.register("username")}
              placeholder="Enter username (optional)"
            />
            {form.formState.errors.username && (
              <p className="text-sm text-red-500">
                {form.formState.errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={form.watch("role")}
              onValueChange={(value) =>
                form.setValue("role", value as "user" | "admin")
              }
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.role && (
              <p className="text-sm text-red-500">
                {form.formState.errors.role.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="banned"
              checked={isBanned}
              onCheckedChange={(checked) => {
                setIsBanned(checked as boolean);
                form.setValue("banned", checked as boolean);
              }}
            />
            <Label
              htmlFor="banned"
              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Ban this user
            </Label>
          </div>

          {isBanned && (
            <>
              <div className="space-y-2">
                <Label htmlFor="banReason">Ban Reason</Label>
                <Input
                  id="banReason"
                  {...form.register("banReason")}
                  placeholder="Enter ban reason"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="banExpires">Ban Expires</Label>
                <Input
                  id="banExpires"
                  type="datetime-local"
                  {...form.register("banExpires")}
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
