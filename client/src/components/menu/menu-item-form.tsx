import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMenuItemSchema } from "@shared/schema";
import type { MenuItem, InsertMenuItem } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface MenuItemFormProps {
  onSubmit: (data: InsertMenuItem) => Promise<void>;
  defaultValues?: MenuItem;
}

export function MenuItemForm({ onSubmit, defaultValues }: MenuItemFormProps) {
  const { toast } = useToast();
  const form = useForm<InsertMenuItem>({
    resolver: zodResolver(insertMenuItemSchema),
    defaultValues: defaultValues || {
      name: "",
      description: "",
      price: "",
      category: "",
      available: true,
    },
  });

  const handleSubmit = async (data: InsertMenuItem) => {
    try {
      await onSubmit(data);
      form.reset();
      toast({
        title: "Success",
        description: "Menu item saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save menu item",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  inputMode="decimal"
                  onChange={(e) => {
                    // Only allow numbers and a single decimal point
                    const value = e.target.value.replace(/[^0-9.]/g, '');
                    // Ensure only one decimal point
                    const parts = value.split('.');
                    if (parts.length > 2) {
                      return;
                    }
                    // Limit to 2 decimal places
                    if (parts[1] && parts[1].length > 2) {
                      return;
                    }
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Save Menu Item</Button>
      </form>
    </Form>
  );
}