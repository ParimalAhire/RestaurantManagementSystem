import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Order, type MenuItem, type Table } from "@shared/schema";
import { CircleDollarSign, Utensils, TableIcon, History } from "lucide-react";

export default function Dashboard() {
  const { data: orders } = useQuery<Order[]>({ 
    queryKey: ["/api/orders"]
  });
  
  const { data: menuItems } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items"]
  });

  const { data: tables } = useQuery<Table[]>({
    queryKey: ["/api/tables"]
  });

  const totalSales = orders?.reduce((sum, order) => sum + Number(order.totalAmount), 0) || 0;
  const activeOrders = orders?.filter(o => o.status !== "completed").length || 0;
  const availableTables = tables?.filter(t => !t.occupied).length || 0;
  const popularItems = menuItems?.slice(0, 5) || [];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Tables</CardTitle>
            <TableIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableTables}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{menuItems?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {orders?.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>Order #{order.id}</div>
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">${order.totalAmount}</span>
                    <span className="capitalize text-sm px-2 py-1 rounded-full bg-primary/10">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Menu Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {popularItems.map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>{item.name}</div>
                  <div className="text-muted-foreground">${item.price}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
