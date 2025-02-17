import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOrderSchema, insertOrderItemSchema } from "@shared/schema";
import type { InsertOrder, InsertOrderItem, MenuItem, Table, Customer } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderFormProps {
  tables: Table[];
  menuItems: MenuItem[];
  customers: Customer[];
  onSubmit: (order: InsertOrder, items: InsertOrderItem[]) => Promise<void>;
}

export function OrderForm({ tables, menuItems, customers, onSubmit }: OrderFormProps) {
  const { toast } = useToast();
  const form = useForm<InsertOrder & { items: InsertOrderItem[] }>({
    resolver: zodResolver(
      insertOrderSchema.extend({
        items: insertOrderItemSchema.omit({ orderId: true }).array(),
      })
    ),
    defaultValues: {
      customerId: 0,
      tableId: 0,
      status: "pending",
      totalAmount: 0,
      items: [],
    },
  });

  const handleSubmit = async (data: InsertOrder & { items: InsertOrderItem[] }) => {
    try {
      const { items, ...order } = data;

      // Calculate total amount from items
      const totalAmount = items.reduce((sum, item) => {
        const menuItem = menuItems.find(m => m.id === item.menuItemId);
        return sum + ((menuItem?.price || 0) * item.quantity);
      }, 0);

      // Create the order with calculated total
      const orderData: InsertOrder = {
        ...order,
        totalAmount,
      };

      // Set the price for each item based on the menu item price
      const itemsWithPrice = items.map(item => {
        const menuItem = menuItems.find(m => m.id === item.menuItemId);
        return {
          ...item,
          price: menuItem?.price || 0,
        };
      });

      await onSubmit(orderData, itemsWithPrice);
      form.reset();
      toast({
        title: "Success",
        description: "Order created successfully",
      });
    } catch (error) {
      console.error('Order creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name} ({customer.phone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tableId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Table</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a table" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tables.map((table) => (
                    <SelectItem key={table.id} value={table.id.toString()}>
                      Table {table.number} (Capacity: {table.capacity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          {form.watch("items").map((_, index) => (
            <div key={index} className="flex gap-4">
              <FormField
                control={form.control}
                name={`items.${index}.menuItemId`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Item</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(parseInt(value));
                        // Update price when menu item changes
                        const menuItem = menuItems.find(m => m.id === parseInt(value));
                        if (menuItem) {
                          form.setValue(`items.${index}.price`, menuItem.price);
                        }
                      }}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an item" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {menuItems.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name} (₹{item.price})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`items.${index}.quantity`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            form.setValue("items", [
              ...form.watch("items"),
              { menuItemId: 0, quantity: 1, price: 0 },
            ])
          }
        >
          Add Item
        </Button>

        <Button type="submit">Create Order</Button>
      </form>
    </Form>
  );
}