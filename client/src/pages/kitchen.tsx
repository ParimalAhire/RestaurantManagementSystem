import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { type Order, type MenuItem, type OrderItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { ChefHat, Timer, Check, User, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderWithItems extends Order {
  items?: OrderItem[];
}

export default function Kitchen() {
  const { toast } = useToast();

  const { data: orders, isLoading: ordersLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: menuItems, isLoading: menuItemsLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items"],
  });

  // Get order items for each order
  const { data: ordersWithItems, isLoading: orderItemsLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders-with-items"],
    queryFn: async () => {
      if (!orders) return [];
      
      const orderPromises = orders.map(async (order) => {
        const response = await fetch(`/api/orders/${order.id}`);
        const data = await response.json();
        return data;
      });
      
      return Promise.all(orderPromises);
    },
    enabled: !!orders && orders.length > 0,
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/orders/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders-with-items"] });
      toast({
        title: "Order status updated",
        description: "The order status has been updated successfully.",
      });
    },
  });

  const isLoading = ordersLoading || menuItemsLoading || orderItemsLoading;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Kitchen Display System</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const activeOrders = ordersWithItems?.filter((order) => 
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

      {activeOrders.length === 0 ? (
        <div className="text-center py-10">
          <ChefHat className="h-10 w-10 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No active orders</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Orders that need to be prepared will appear here.
          </p>
        </div>
      ) : (
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
                  <Badge variant={
                    order.status === "pending" ? "outline" : "secondary"
                  }
                  className={`capitalize ${
                    order.status === "pending"
                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                      : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                  }`}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center mb-2">
                      <Home className="w-4 h-4 mr-1" />
                      <span>Table #{order.tableId}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">Items:</div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.items?.map((item) => {
                          const menuItem = menuItems?.find(m => m.id === item.menuItemId);
                          return (
                            <TableRow key={item.id}>
                              <TableCell>{menuItem?.name || 'Unknown Item'}</TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full flex justify-end">
                  {order.status === "pending" ? (
                    <Button
                      onClick={() =>
                        updateOrderStatusMutation.mutate({
                          id: order.id,
                          status: "preparing",
                        })
                      }
                      className="w-full"
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
                      className="w-full"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Mark as Served
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
