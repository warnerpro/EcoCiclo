import Link from "next/link";
import SidebarItem from "@/components/routes/home/sidebar-item";
import { UserType } from "@/lib/constants/user-type";

const navigationItems = [
  {
    name: "Home",
    href: "/home",
    icon: "House",
  },
  {
    name: "Coletas",
    href: "/coletas",
    icon: "Recycle",
  },
  {
    name: "Perfil",
    href: "/perfil",
    icon: "User",
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">{children}</main>
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200">
        <div className="flex justify-around py-2">
          {navigationItems.map((item) => {
            return (
              <SidebarItem
                href={item.href}
                label={item.name}
                icon={item.icon}
              />
            );
          })}
        </div>
      </nav>
    </div>
  );
}
