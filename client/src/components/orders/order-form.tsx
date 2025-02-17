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
  onSubmit: (data: InsertOrder, items: InsertOrderItem[]) => Promise<void>;
}

export function OrderForm({ tables, menuItems, customers, onSubmit }: OrderFormProps) {
  const { toast } = useToast();
  const form = useForm<InsertOrder & { items: InsertOrderItem[] }>({
    resolver: zodResolver(insertOrderSchema.extend({
      items: insertOrderItemSchema.omit({ orderId: true }).array(),
    })),
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
      await onSubmit(order, items);
      form.reset();
      toast({
        title: "Success",
        description: "Order created successfully",
      });
    } catch (error) {
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
                      onValueChange={(value) => field.onChange(parseInt(value))}
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
                            {item.name} (${item.price})
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