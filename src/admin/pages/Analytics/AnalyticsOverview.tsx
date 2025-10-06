import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAnalyticsStats, useActivityFeed } from "../../hooks/useAnalytics";
import { StatCard } from "./StatCard";
import { DashboardCharts } from "./DashboardCharts";
import { ActivityFeed } from "./ActivityFeed";
import {
  Users,
  FileText,
  Mail,
  Coins,
  RefreshCw,
  TrendingUp,
  Calendar,
} from "lucide-react";

export function AnalyticsOverview() {
  const { toast } = useToast();
  const [refetchInterval, setRefetchInterval] = useState<number | undefined>(undefined);

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useAnalyticsStats(refetchInterval);

  const {
    data: activities,
    isLoading: activitiesLoading,
    error: activitiesError,
    refetch: refetchActivities,
  } = useActivityFeed(10, refetchInterval);

  const handleRefresh = async () => {
    try {
      await Promise.all([refetchStats(), refetchActivities()]);
      toast({
        title: "Success",
        description: "Analytics data refreshed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh analytics data",
        variant: "destructive",
      });
    }
  };

  const toggleAutoRefresh = () => {
    if (refetchInterval) {
      setRefetchInterval(undefined);
      toast({
        title: "Auto-refresh disabled",
        description: "Analytics will no longer update automatically",
      });
    } else {
      setRefetchInterval(30000);
      toast({
        title: "Auto-refresh enabled",
        description: "Analytics will update every 30 seconds",
      });
    }
  };

  if (statsError || activitiesError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">Failed to Load Analytics</h2>
          <p className="text-muted-foreground mb-4">
            {statsError?.message || activitiesError?.message || "An error occurred"}
          </p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (statsLoading || !stats) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
          <p className="text-muted-foreground">
            Monitor your platform performance and user activity
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={refetchInterval ? "default" : "outline"}
            size="sm"
            onClick={toggleAutoRefresh}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refetchInterval ? "animate-spin" : ""}`}
            />
            {refetchInterval ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          description={`${stats.newUsersMonth} new this month`}
          iconColor="text-blue-600"
        />
        <StatCard
          title="Published Blogs"
          value={stats.totalBlogs}
          icon={FileText}
          description="Active blog posts"
          iconColor="text-green-600"
        />
        <StatCard
          title="Contact Submissions"
          value={stats.totalContacts}
          icon={Mail}
          description="All-time submissions"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Total Tokens"
          value={stats.totalTokens}
          icon={Coins}
          description="Platform tokens earned"
          iconColor="text-orange-600"
        />
      </div>

      <DashboardCharts data={stats} />

      <div className="grid gap-6 md:grid-cols-2">
        <ActivityFeed activities={activitiesLoading ? [] : activities} />

        <Card>
          <CardHeader>
            <CardTitle>Recent Contacts</CardTitle>
            <CardDescription>Latest contact form submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">No contact submissions yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentContacts.slice(0, 5).map((contact, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">{contact.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Service: {contact.service}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(contact.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
          <CardDescription>Key metrics at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">User Growth</span>
              </div>
              <p className="text-2xl font-bold">{stats.newUsersMonth}</p>
              <p className="text-xs text-muted-foreground">New users this month</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Content Activity</span>
              </div>
              <p className="text-2xl font-bold">
                {stats.popularBlogs.reduce((sum, blog) => sum + blog.views, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total blog views</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Token Economy</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalTokens}</p>
              <p className="text-xs text-muted-foreground">Total tokens in circulation</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
