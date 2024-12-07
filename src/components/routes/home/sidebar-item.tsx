"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icon";

interface SidebarItemProps {
  href: string;
  icon: string;
  label: string;
}

export default function SidebarItem({ href, icon, label }: SidebarItemProps) {
  const pathname = usePathname();
  return (
    <Link
      href={href}
      className={`flex flex-col items-center text-sm space-y-2 pb-4 ${
        pathname === href ? "text-foreground" : "text-gray-500"
      }`}
    >
      <Icon size={24} name={icon} />
      <span>{label}</span>
    </Link>
  );
}
