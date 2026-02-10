import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { sanitizeInput, formatTimeAgo } from "@/lib/auth-utils";
import { Plus, Trash2, Check } from "lucide-react";
import type { Task } from "@shared/schema";

const taskSchema = z.object({
  description: z.string().min(1, "Task description is required").max(500, "Task description too long"),
});

type FilterType = "all" | "active" | "completed";

export function TaskManager() {
  const [filter, setFilter] = useState<FilterType>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      description: "",
    },
  });

  // Fetch tasks
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: { description: string }) => {
      const sanitizedDescription = sanitizeInput(taskData.description);
      const response = await apiRequest("POST", "/api/tasks", { description: sanitizedDescription });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      form.reset();
      toast({
        title: "Task Created",
        description: "Your task has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Task> }) => {
      const response = await apiRequest("PATCH", `/api/tasks/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Update Task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/tasks/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({
        title: "Task Deleted",
        description: "Task has been removed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Delete Task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: z.infer<typeof taskSchema>) => {
    await createTaskMutation.mutateAsync(data);
  };

  const toggleTask = async (task: Task) => {
    await updateTaskMutation.mutateAsync({
      id: task.id,
      updates: { isCompleted: !task.isCompleted },
    });
  };

  const deleteTask = async (id: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      await deleteTaskMutation.mutateAsync(id);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.isCompleted;
    if (filter === "completed") return task.isCompleted;
    return true;
  });

  const completedCount = tasks.filter(task => task.isCompleted).length;
  const pendingCount = tasks.filter(task => !task.isCompleted).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-10 bg-slate-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Task Input */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex space-x-3">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="What needs to be done?"
                        {...field}
                        disabled={createTaskMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={createTaskMutation.isPending}
                className="px-6"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Task Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-1">
            <Button
              variant={filter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "active" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("active")}
            >
              Active
            </Button>
            <Button
              variant={filter === "completed" ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter("completed")}
            >
              Completed
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Tasks</CardTitle>
          <p className="text-sm text-slate-500">
            {completedCount} completed, {pendingCount} pending
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              {filter === "all" 
                ? "No tasks yet. Add your first task above!" 
                : `No ${filter} tasks.`
              }
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`task-item ${task.isCompleted ? 'completed' : ''}`}
                >
                  <button
                    onClick={() => toggleTask(task)}
                    className={`task-checkbox ${task.isCompleted ? 'checked' : ''}`}
                    disabled={updateTaskMutation.isPending}
                  >
                    {task.isCompleted && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <div className="flex-1">
                    <p className={`text-slate-800 ${task.isCompleted ? 'line-through text-slate-600' : ''}`}>
                      {task.description}
                    </p>
                    <p className="text-xs text-slate-500">
                      {task.isCompleted 
                        ? `Completed ${formatTimeAgo(task.updatedAt!)}` 
                        : `Created ${formatTimeAgo(task.createdAt!)}`
                      }
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTask(task.id)}
                    disabled={deleteTaskMutation.isPending}
                    className="text-slate-400 hover:text-error"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
