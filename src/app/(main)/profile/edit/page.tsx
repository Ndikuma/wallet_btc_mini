
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import type { User } from "@/lib/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const profileFormSchema = z.object({
  first_name: z.string().max(50).optional(),
  last_name: z.string().max(50).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function EditProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.getUserProfile();
        setUser(response.data);
        form.reset({
          first_name: response.data.first_name || "",
          last_name: response.data.last_name || "",
        });
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
  }, [toast, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true);
    try {
      const response = await api.updateUserProfile(data);
      setUser(response.data);
      form.reset(response.data);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved.",
      });
      router.push("/profile");
      router.refresh();
    } catch (error: any) {
        const errorMsg = error.message || "An unexpected error occurred.";
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: errorMsg,
        });
    } finally {
        setIsSaving(false);
    }
  };
  
    if (loading) {
        return (
            <div className="mx-auto max-w-xl space-y-6">
                <Skeleton className="h-10 w-24" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-40" />
                        <Skeleton className="h-4 w-60" />
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-2">
                             <Skeleton className="h-4 w-16" />
                             <Skeleton className="h-10 w-full" />
                        </div>
                         <div className="space-y-2">
                             <Skeleton className="h-4 w-16" />
                             <Skeleton className="h-10 w-full" />
                        </div>
                        <Skeleton className="h-11 w-32" />
                    </CardContent>
                </Card>
            </div>
        )
    }

  if (!user) {
    return (
       <div className="mx-auto max-w-xl text-center">
         <p>Could not load profile. Please try refreshing the page.</p>
      </div>
    );
  }


  return (
    <div className="mx-auto max-w-xl space-y-6">
       <Button variant="ghost" asChild className="-ml-4">
        <Link href="/profile">
          <ArrowLeft className="mr-2 size-4" />
          Back to Profile
        </Link>
      </Button>
      <Card>
        <CardHeader>
            <CardTitle className="text-2xl">Edit Profile</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Your first name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Your last name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isSaving || !form.formState.isDirty}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

    