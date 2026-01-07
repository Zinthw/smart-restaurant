import Link from "next/link"
import { Users, ChefHat, ClipboardList, Settings } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const roles = [
  {
    title: "Guest / Customer",
    description: "Browse menu, place orders, and pay",
    icon: Users,
    href: "/menu/guest",
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Kitchen Display (KDS)",
    description: "View and manage incoming orders",
    icon: ChefHat,
    href: "/kitchen",
    color: "bg-success/10 text-success",
  },
  {
    title: "Waiter / Staff",
    description: "Accept orders and serve tables",
    icon: ClipboardList,
    href: "/waiter/login",
    color: "bg-info/10 text-info",
  },
  {
    title: "Admin Dashboard",
    description: "Manage menu, tables, and reports",
    icon: Settings,
    href: "/admin/login",
    color: "bg-warning/10 text-warning",
  },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="mb-10 text-center">
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground">Smart Restaurant</h1>
        <p className="text-muted-foreground">Select your role to continue</p>
      </div>

      <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
        {roles.map((role) => {
          const Icon = role.icon
          return (
            <Link key={role.href} href={role.href} className="block">
              <Card className="h-full transition-all hover:shadow-lg hover:ring-2 hover:ring-primary/20">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className={`rounded-lg p-3 ${role.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{role.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{role.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="mt-10 text-center text-sm text-muted-foreground">
        <p>Demo Credentials</p>
        <p className="mt-1">Admin: admin@restaurant.com / admin123</p>
        <p>Waiter: waiter@restaurant.com / waiter123</p>
      </div>
    </div>
  )
}
