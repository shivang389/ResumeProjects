import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Database, Clock } from "lucide-react";
import { formatTimeAgo } from "@/lib/auth-utils";
import { useAuth } from "@/hooks/use-auth";

interface SecurityLog {
  id: number;
  action: string;
  details: string;
  success: boolean;
  createdAt: string;
}

export function SecurityStatus() {
  const { user } = useAuth();
  
  const { data: securityLogs = [] } = useQuery<SecurityLog[]>({
    queryKey: ["/api/security/logs"],
    retry: false,
  });

  const recentLogs = securityLogs.slice(0, 3);
  const failedAttempts = securityLogs.filter(log => 
    log.action.includes('LOGIN') && !log.success
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Security Level */}
        <div className="security-badge high p-3 rounded-lg">
          <Shield className="w-4 h-4" />
          <div className="flex-1 flex justify-between">
            <span className="font-medium">Security Level</span>
            <span className="font-bold">High</span>
          </div>
        </div>

        {/* Login Statistics */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Failed Attempts Today</span>
            <span className="text-sm font-medium text-slate-800">
              {failedAttempts}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Last Login</span>
            <span className="text-sm font-medium text-slate-800">
              {user?.lastLogin ? formatTimeAgo(user.lastLogin) : 'Never'}
            </span>
          </div>
        </div>

        {/* Security Features */}
        <div className="space-y-3">
          {/* Brute Force Protection */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Lock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-blue-800">
                Brute Force Protection
              </span>
            </div>
            <p className="text-xs text-blue-700">
              Account lockout after 5 failed OTP attempts
            </p>
          </div>

          {/* Injection Protection */}
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Database className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">
                Injection Protection
              </span>
            </div>
            <p className="text-xs text-purple-700">
              SQL queries are sanitized and parameterized
            </p>
          </div>
        </div>

        {/* Recent Security Events */}
        {recentLogs.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">
              Recent Activity
            </h4>
            <div className="space-y-2">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      log.success ? 'bg-success' : 'bg-error'
                    }`}></div>
                    <span className="text-slate-600 truncate">
                      {log.action.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </div>
                  <span className="text-slate-500 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgo(log.createdAt)}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
