import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { type Order, type MenuItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { ChefHat, Timer, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Kitchen() {
  const { toast } = useToast();

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: menuItems } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items"],
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/orders/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order status updated",
        description: "The order status has been updated successfully.",
      });
    },
  });

  if (ordersLoading) {
    return <div>Loading orders...</div>;
  }

  const activeOrders = orders?.filter((order) => 
    order.status === "pending" || order.status === "preparing"
  ) || [];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Kitchen Display System</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2" />
            <span className="text-sm">Pending</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-400 rounded-full mr-2" />
            <span className="text-sm">Preparing</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {activeOrders.map((order) => (
          <Card 
            key={order.id}
            className={
              order.status === "pending"
                ? "border-yellow-200"
                : "border-blue-200"
            }
          >
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  {order.status === "pending" ? (
                    <Timer className="w-5 h-5 mr-2 text-yellow-500" />
                  ) : (
                    <ChefHat className="w-5 h-5 mr-2 text-blue-500" />
                  )}
                  Order #{order.id}
                </CardTitle>
                <span
                  className={`px-2 py-1 rounded-full text-xs capitalize ${
                    order.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2">Items:</div>
                  {/* We'll add order items here in the next iteration */}
                </div>
                <div className="flex justify-end">
                  {order.status === "pending" ? (
                    <Button
                      onClick={() =>
                        updateOrderStatusMutation.mutate({
                          id: order.id,
                          status: "preparing",
                        })
                      }
                    >
                      <ChefHat className="mr-2 h-4 w-4" />
                      Start Preparing
                    </Button>
                  ) : (
                    <Button
                      onClick={() =>
                        updateOrderStatusMutation.mutate({
                          id: order.id,
                          status: "served",
                        })
                      }
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Mark as Served
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
