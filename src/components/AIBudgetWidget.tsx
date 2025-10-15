import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Zap
} from 'lucide-react';
import { useAIFeatures } from '@/hooks/useAIFeatures';

interface AIBudgetWidgetProps {
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
}

const AIBudgetWidget: React.FC<AIBudgetWidgetProps> = ({
  className,
  showDetails = true,
  compact = false
}) => {
  const { usageStats, getBudgetUsagePercentage, getBudgetStatusColor } = useAIFeatures();

  if (!usageStats) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-muted-foreground animate-pulse" />
            <span className="text-sm text-muted-foreground">Loading AI usage...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const budgetUsagePercentage = getBudgetUsagePercentage();
  const statusColor = getBudgetStatusColor();
  
  const getBudgetStatus = () => {
    if (budgetUsagePercentage >= 95) return { icon: AlertTriangle, text: 'Critical', color: 'text-red-600' };
    if (budgetUsagePercentage >= 80) return { icon: Clock, text: 'Warning', color: 'text-yellow-600' };
    return { icon: CheckCircle, text: 'Healthy', color: 'text-green-600' };
  };

  const status = getBudgetStatus();
  const StatusIcon = status.icon;

  if (compact) {
    return (
      <Card className={className}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between space-x-3">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">AI Budget</span>
            </div>
            <div className="flex items-center space-x-2">
              <StatusIcon className={`h-3 w-3 ${status.color}`} />
              <span className={`text-sm font-medium ${statusColor}`}>
                {budgetUsagePercentage}%
              </span>
            </div>
          </div>
          <Progress 
            value={budgetUsagePercentage} 
            className="h-1 mt-2"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>AI Budget Usage</span>
          </div>
          <Badge variant={budgetUsagePercentage >= 80 ? "destructive" : "secondary"}>
            {status.text}
          </Badge>
        </CardTitle>
        <CardDescription>
          Monthly AI spending and usage tracking
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Budget Overview */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">
              ${usageStats.monthly_budget.toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground">Budget</p>
          </div>
          <div>
            <p className={`text-2xl font-bold ${statusColor}`}>
              ${usageStats.current_spend.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">Spent</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              ${usageStats.remaining_budget.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">Remaining</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Usage Progress</span>
            <span className={statusColor}>{budgetUsagePercentage}%</span>
          </div>
          <Progress 
            value={budgetUsagePercentage} 
            className={`h-2 ${
              budgetUsagePercentage >= 90 ? 'bg-red-100' : 
              budgetUsagePercentage >= 75 ? 'bg-yellow-100' : 'bg-green-100'
            }`}
          />
        </div>

        {/* Status Alert */}
        {budgetUsagePercentage >= 80 && (
          <Alert variant={budgetUsagePercentage >= 95 ? "destructive" : "default"}>
            <StatusIcon className="h-4 w-4" />
            <AlertDescription>
              {budgetUsagePercentage >= 95 
                ? 'Budget almost exhausted! Consider increasing limit or reducing usage.'
                : budgetUsagePercentage >= 90
                ? 'Approaching budget limit. Monitor usage carefully.'
                : 'Budget usage is high. Consider optimizing AI calls.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Usage Details */}
        {showDetails && usageStats.usage_by_operation && usageStats.usage_by_operation.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent Usage</h4>
            <div className="space-y-1">
              {usageStats.usage_by_operation.slice(0, 3).map((usage, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-muted-foreground">
                    {usage.operation.replace('_', ' ')}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">
                      {usage.total_calls} calls
                    </span>
                    <span className="font-medium">
                      ${usage.total_cost.toFixed(4)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>Updates every 5 minutes</span>
          </div>
          {budgetUsagePercentage < 50 && (
            <Badge variant="outline" className="text-xs">
              Efficient Usage
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIBudgetWidget;