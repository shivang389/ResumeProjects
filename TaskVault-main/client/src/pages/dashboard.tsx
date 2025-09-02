import { useAuth, useLogout } from "@/hooks/use-auth";
import { TaskManager } from "@/components/task-manager";
import { TaskAnalytics } from "@/components/task-analytics";
import { SecurityStatus } from "@/components/security-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListTodo, LogOut, Download, Trash2, History } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await logoutMutation.mutateAsync();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <ListTodo className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Task Vault</h1>
                <p className="text-xs text-slate-500">Secure Task Management</p>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Security Badge */}
              <div className="security-badge high">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-sm">Secure Session</span>
              </div>

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-800">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <img
                  src={user?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"}
                  alt="User profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-slate-200"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Task Management Section */}
          <div className="lg:col-span-2">
            <TaskManager />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Task Analytics */}
            <TaskAnalytics />

            {/* Security Status */}
            <SecurityStatus />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    // TODO: Implement clear completed tasks
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  Clear Completed ListTodo
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    // TODO: Implement export tasks
                  }}
                >
                  <Download className="w-4 h-4 mr-3" />
                  Export ListTodo
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    // TODO: Implement security logs view
                  }}
                >
                  <History className="w-4 h-4 mr-3" />
                  View Security Logs
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
