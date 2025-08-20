"use client";

import { useCategories } from "@/hooks/queries/use-categories";
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
import CategorySelector from "./category-selector";

export const Header = () => {
  const { data: session } = authClient.useSession();
  const { data: categories } = useCategories();
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
      <nav className="border-border bg-background w-full border-t">
        <div className="mx-auto max-w-7xl px-2 md:px-0">
          <CategorySelector categories={categories || []} />
        </div>
      </nav>
    </header>
  );
};
