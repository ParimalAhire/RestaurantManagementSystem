import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutGrid, Menu, ClipboardList, TableProperties } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutGrid },
  { href: "/menu", label: "Menu", icon: Menu },
  { href: "/orders", label: "Orders", icon: ClipboardList },
  { href: "/tables", label: "Tables", icon: TableProperties },
];

export default function Nav() {
  const [location] = useLocation();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center">
          <h1 className="text-2xl font-bold text-primary mr-8">Restaurant Manager</h1>
          <div className="flex space-x-4">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <a
                  className={cn(
                    "inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location === href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-primary hover:bg-accent"
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {label}
                </a>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
