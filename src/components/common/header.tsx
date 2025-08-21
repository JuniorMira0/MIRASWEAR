"use client";

import { useCartMigration } from "@/hooks/use-cart-migration";
import { authClient } from "@/lib/auth-client";
import { MenuIcon, SearchIcon, UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Cart } from "./cart";
interface HeaderProps {
  categories: { id: string; name: string; slug: string }[];
}

export const Header = ({ categories }: HeaderProps) => {
  const { data: session } = authClient.useSession();
  useCartMigration();

  return (
    <header className="border-border bg-background relative z-10 w-full border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:py-4">
        <div className="hidden min-w-[180px] items-center gap-2 md:flex">
          <UserIcon className="text-muted-foreground h-5 w-5" />
          <span className="text-sm font-medium">
            Olá{session?.user ? `, ${session.user.name.split(" ")[0]}` : ""}!
          </span>
        </div>
        <div className="flex items-center md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-6">
                {session?.user && (
                  <div className="text-sm font-medium">
                    Olá, {session.user.name?.split(" ")[0]}!
                  </div>
                )}
                <nav className="flex flex-col gap-2">
                  <span className="text-muted-foreground text-xs font-semibold">
                    CATEGORIAS
                  </span>
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/category/${c.slug}`}
                      className="hover:bg-muted rounded-md px-2 py-2 text-sm font-medium"
                    >
                      {c.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-1 justify-center md:justify-center">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="MIRASWEAR"
              width={200}
              height={26.14}
              className="mx-auto dark:invert-0"
            />
          </Link>
        </div>

        <div className="flex min-w-[120px] items-center justify-end gap-3">
          <Button
            variant="outline"
            size="icon"
            className="hidden md:inline-flex"
          >
            <SearchIcon className="h-5 w-5" />
          </Button>
          <div className="hidden md:inline-flex">
            <Cart />
          </div>
          <div className="md:hidden">
            <Cart />
          </div>
        </div>
      </div>
      <nav className="border-border bg-background hidden w-full border-t md:block">
        <div className="mx-auto flex max-w-7xl gap-8 overflow-x-auto px-4 py-3 text-sm md:px-8">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="text-muted-foreground hover:text-foreground shrink-0 font-medium whitespace-nowrap transition-colors"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
};
