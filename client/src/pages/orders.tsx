import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { type Order, type MenuItem, type Table, type OrderItem, type Customer } from "@shared/schema";
import { OrderForm } from "@/components/orders/order-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { PlusCircle, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Orders() {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: menuItems, isLoading: menuItemsLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items"],
  });

  const { data: tables, isLoading: tablesLoading } = useQuery<Table[]>({
    queryKey: ["/api/tables"],
  });

  const { data: customers, isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const createOrderMutation = useMutation({
    mutationFn: async ({
      order,
      items,
    }: {
      order: Omit<Order, "id" | "createdAt">;
      items: Omit<OrderItem, "id" | "orderId">[];
    }) => {
      const createdOrder = await apiRequest("POST", "/api/orders", order);
      const orderData = await createdOrder.json();

      await Promise.all(
        items.map((item) =>
          apiRequest("POST", `/api/orders/${orderData.id}/items`, item)
        )
      );

      // Create a customer visit record when an order is created
      if (order.customerId && order.tableId) {
        await apiRequest("POST", `/api/customers/${order.customerId}/visits`, {
          tableId: order.tableId,
        });
      }

      return orderData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order created",
        description: "New order has been created successfully.",
      });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/orders/${id}`, { status });

      // When order is completed, end the customer visit
      if (status === "completed") {
        const order = orders?.find(o => o.id === id);
        if (order) {
          const visits = await apiRequest("GET", `/api/customers/${order.customerId}/visits`);
          const visitsData = await visits.json();
          const activeVisit = visitsData.find((v: any) => !v.endTime && v.tableId === order.tableId);
          if (activeVisit) {
            await apiRequest("PATCH", `/api/customer-visits/${activeVisit.id}/end`);
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
  });

  if (ordersLoading || menuItemsLoading || tablesLoading || customersLoading) {
    return <div>Loading...</div>;
  }

  if (!menuItems || !tables || !customers) {
    return <div>Error loading data</div>;
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      preparing: "bg-blue-100 text-blue-800",
      served: "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Orders</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
            </DialogHeader>
            <OrderForm
              tables={tables}
              menuItems={menuItems}
              customers={customers}
              onSubmit={async (order, items) => {
                await createOrderMutation.mutateAsync({ order, items });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {orders?.map((order) => {
          const customer = customers.find((c) => c.id === order.customerId);
          return (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Order #{order.id}</CardTitle>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Customer</div>
                    <div>{customer?.name || "Unknown"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Table</div>
                    <div>
                      {tables.find((t) => t.id === order.tableId)?.number || "Unknown"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Amount</div>
                    <div>${order.totalAmount}</div>
                  </div>
                  <div className="flex space-x-2">
                    {order.status !== "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const nextStatus = {
                            pending: "preparing",
                            preparing: "served",
                            served: "completed",
                          }[order.status];
                          if (nextStatus) {
                            updateOrderStatusMutation.mutate({
                              id: order.id,
                              status: nextStatus,
                            });
                          }
                        }}
                      >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Update Status
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}