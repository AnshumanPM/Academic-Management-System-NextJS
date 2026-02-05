"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays, Mail, User, Globe, Loader2 } from "lucide-react";
import { updateUserProfile } from "@/lib/auth-utils";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  image?: string | null;
  username?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | string | null;
}

interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface ProfileClientProps {
  user: User;
  session: Session;
}

export function ProfileClient({ user, session }: ProfileClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    username: user.username || "",
  });

  const formatDate = (dateStr: string | Date) => {
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await updateUserProfile({
      name: formData.name,
      username: formData.username || undefined,
    });

    setIsLoading(false);

    if (result.success) {
      toast.success(result.message);
      setIsEditing(false);
      window.location.reload();
    } else {
      toast.error(result.message);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      username: user.username || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="flex w-full flex-col gap-6 px-4 py-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {user.image && <AvatarImage src={user.image} alt={user.name} />}
              <AvatarFallback className="text-2xl">
                {user.name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <CardTitle className="overflow-wrap text-2xl break-all">
                {user.name}
              </CardTitle>
              <p className="text-muted-foreground text-sm break-all">
                {user.email}
              </p>
              {user.emailVerified && (
                <Badge variant="default" className="mt-2 gap-1">
                  <Mail className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
              >
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="Enter your username"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid gap-4 break-words sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Name
                </p>
                <p className="text-sm">{user.name}</p>
              </div>
              {user.username && (
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Username
                  </p>
                  <p className="text-sm">{user.username}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Account Created
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <CalendarDays className="h-4 w-4" />
                  {formatDate(user.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Last Login
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <CalendarDays className="h-4 w-4" />
                  {formatDate(session.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  IP Address
                </p>
                <p className="flex items-center gap-2 font-mono text-sm">
                  <Globe className="h-4 w-4" />
                  {session.ipAddress || "N/A"}
                </p>
              </div>
            </div>
          )}

          {user.banned && (
            <div className="border-destructive bg-destructive/10 mt-4 rounded-lg border p-4">
              <p className="text-destructive font-semibold">Account Banned</p>
              {user.banReason && (
                <p className="text-destructive mt-1 text-sm">
                  Reason: {user.banReason}
                </p>
              )}
              {user.banExpires && (
                <p className="text-destructive mt-1 text-sm">
                  Expires: {formatDate(user.banExpires)}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
