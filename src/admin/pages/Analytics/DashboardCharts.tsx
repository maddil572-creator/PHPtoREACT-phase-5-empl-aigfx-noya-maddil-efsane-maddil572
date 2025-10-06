import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";
import { AnalyticsStats } from "../../hooks/useAnalytics";

interface DashboardChartsProps {
  data: AnalyticsStats;
}

export function DashboardCharts({ data }: DashboardChartsProps) {
  const userGrowthData = data.userGrowth.map((item) => ({
    date: format(parseISO(item.date), "MMM dd"),
    users: item.count,
  }));

  const popularBlogsData = data.popularBlogs.slice(0, 5).map((blog) => ({
    title: blog.title.length > 20 ? blog.title.substring(0, 20) + "..." : blog.title,
    views: blog.views,
    likes: blog.likes,
  }));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="col-span-full md:col-span-1">
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
          <CardDescription>New user registrations over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-full md:col-span-1">
        <CardHeader>
          <CardTitle>Popular Blog Posts</CardTitle>
          <CardDescription>Top 5 blog posts by views and likes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={popularBlogsData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="title"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Legend />
              <Bar dataKey="views" fill="hsl(var(--primary))" name="Views" />
              <Bar dataKey="likes" fill="hsl(var(--chart-2))" name="Likes" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
