import { authSession } from "@/lib/auth-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Mail, User, Globe } from "lucide-react";

export default async function Profile() {
  const sessionData = await authSession();
  const { user, session } = sessionData!;

  const formatDate = (dateStr: string | Date) => {
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex w-full flex-col gap-6 px-4 py-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      {/* User Header Card */}
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
            <div className="flex-1 min-w-0">
              <CardTitle className="break-all overflow-wrap text-2xl">
                {user.name}
              </CardTitle>
              <p className="break-all text-sm text-muted-foreground">
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

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 break-words sm:grid-cols-2">
            {user.username && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Username
                </p>
                <p className="text-sm">{user.username}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Account Created
              </p>
              <p className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4" />
                {formatDate(user.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Last Login
              </p>
              <p className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4" />
                {formatDate(session.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                IP Address
              </p>
              <p className="flex items-center gap-2 font-mono text-sm">
                <Globe className="h-4 w-4" />
                {session.ipAddress || "N/A"}
              </p>
            </div>
          </div>

          {user.banned && (
            <div className="mt-4 rounded-lg border border-destructive bg-destructive/10 p-4">
              <p className="font-semibold text-destructive">Account Banned</p>
              {user.banReason && (
                <p className="mt-1 text-sm text-destructive">
                  Reason: {user.banReason}
                </p>
              )}
              {user.banExpires && (
                <p className="mt-1 text-sm text-destructive">
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
