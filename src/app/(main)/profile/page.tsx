
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import type { User } from "@/lib/types";

export default function ProfilePage() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.getUserProfile();
        setUser(response.data);
      } catch (error: any) {
        const errorMsg = error.response?.data?.error?.details?.detail || "Could not fetch user data. Please try again later.";
        toast({
          variant: "destructive",
          title: "Failed to load profile",
          description: errorMsg,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [toast]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
       <div className="mx-auto max-w-2xl text-center">
         <p>Could not load profile. Please try refreshing the page.</p>
      </div>
    );
  }

  const handleSaveChanges = () => {
      toast({
          title: "Coming Soon",
          description: "Profile editing is not yet implemented.",
      })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">My Profile</h1>
        <p className="text-muted-foreground">
          View and manage your account details.
        </p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <Avatar className="h-20 w-20 sm:h-16 sm:w-16">
              <AvatarImage src={`https://picsum.photos/seed/${user.email}/80/80`} alt="Avatar" data-ai-hint="avatar" />
              <AvatarFallback>
                {user.first_name?.[0]}
                {user.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl sm:text-2xl">{user.first_name || user.username} {user.last_name}</CardTitle>
              <CardDescription>Update your profile information.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" defaultValue={user.first_name || ""} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" defaultValue={user.last_name || ""} />
                </div>
            </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user.email} readOnly disabled />
          </div>
           <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" type="text" value={user.username} readOnly disabled />
          </div>
          <Button onClick={handleSaveChanges} className="w-full sm:w-auto">Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
