import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ActivityItem } from "../../hooks/useAnalytics";
import { UserPlus, Mail, Eye, TrendingUp, CircleAlert as AlertCircle, Shield, UserCog } from "lucide-react";

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const iconMap: Record<string, React.ReactNode> = {
  "fas fa-user-plus": <UserPlus className="h-4 w-4" />,
  "fas fa-envelope": <Mail className="h-4 w-4" />,
  "fas fa-eye": <Eye className="h-4 w-4" />,
  "fas fa-shield": <Shield className="h-4 w-4" />,
  "fas fa-user-cog": <UserCog className="h-4 w-4" />,
};

function getActivityIcon(iconClass: string) {
  return iconMap[iconClass] || <TrendingUp className="h-4 w-4" />;
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions and events across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions and events across the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
              >
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  {getActivityIcon(activity.icon)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
