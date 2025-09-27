
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import type { User, Wallet } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight, User as UserIcon, BarChart2, Clock, Hash, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number | undefined;
  isLoading: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, isLoading }) => {
    return (
        <Card className="flex flex-col justify-between p-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{title}</p>
                <Icon className="size-5 text-muted-foreground" />
            </div>
            {isLoading ? (
                <Skeleton className="mt-2 h-7 w-20" />
            ) : (
                <p className="text-2xl font-bold">{value}</p>
            )}
        </Card>
    );
};

export default function ProfilePage() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, walletResponse] = await Promise.all([
            api.getUserProfile(),
            api.getWallets()
        ]);
        setUser(userResponse.data);
        if (walletResponse.data && walletResponse.data.length > 0) {
          setWallet(walletResponse.data[0]);
        }
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
    fetchData();
  }, [toast]);


  const getInitials = () => {
      if (!user) return "";
      const firstNameInitial = user.first_name?.[0] || '';
      const lastNameInitial = user.last_name?.[0] || '';
      return `${firstNameInitial}${lastNameInitial}`.toUpperCase() || user.username?.[0].toUpperCase();
  }

  const walletStats = wallet?.stats;

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-4 w-60" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-4 space-y-2">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-7 w-1/4" />
                </Card>
            ))}
        </div>
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

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">My Profile</h1>
        <p className="text-muted-foreground">
          View your account details and wallet statistics.
        </p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
             <Avatar className="h-20 w-20 sm:h-16 sm:w-16 text-3xl font-bold">
              <AvatarFallback>
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl sm:text-2xl">{user.first_name && user.last_name ? `${user.first_name} ${user.last_name}`: user.username}</CardTitle>
              <CardDescription>
                <span className="font-mono">{user.username}</span> - {user.email}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/profile/edit">
              Edit Profile
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
      
      <div className="space-y-2">
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">Wallet Statistics</h2>
        <p className="text-muted-foreground">
          An overview of your wallet's activity.
        </p>
      </div>

       <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard icon={BarChart2} title="Current Balance" value={wallet?.balance_formatted} isLoading={loading} />
          <StatCard icon={Hash} title="Total Transactions" value={walletStats?.total_transactions} isLoading={loading} />
          <StatCard icon={Clock} title="Wallet Age (Days)" value={walletStats?.wallet_age_days} isLoading={loading} />
          <StatCard icon={TrendingDown} title="Total Sent" value={walletStats?.total_sent} isLoading={loading} />
          <StatCard icon={TrendingUp} title="Total Received" value={walletStats?.total_received} isLoading={loading} />
          <StatCard icon={UserIcon} title="Primary Address" value={shortenText(wallet?.primary_address, 10, 10)} isLoading={loading} />
       </div>
    </div>
  );
}

