"use client";

import { useCartMigration } from "@/hooks/use-cart-migration";
import { authClient } from "@/lib/auth-client";
import {
  HomeIcon,
  LogInIcon,
  LogOutIcon,
  MenuIcon,
  PackageIcon,
  SearchIcon,
  UserIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Cart } from "./cart";
interface HeaderProps {
  categories?: { id: string; name: string; slug: string }[];
}

export const Header = ({ categories = [] }: HeaderProps) => {
  const { data: session } = authClient.useSession();
  const isLogged = !!session?.user;
  const pathname = usePathname();
  useCartMigration();

  return (
    <header className="bg-background relative z-10 w-full">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:py-4">
        <div className="hidden min-w-[180px] items-center gap-2 md:flex">
          <UserIcon className="text-muted-foreground h-5 w-5" />
          <span className="text-sm font-medium">
            Olá,{" "}
            <Link
              href={
                isLogged
                  ? "/profile"
                  : "/authentication?redirect=/cart/identification"
              }
            >
              {isLogged
                ? (session.user.name?.split(" ")?.[0] ?? "")
                : "Faça Login"}
            </Link>
            !
          </span>
        </div>
        <div className="flex flex-1 justify-start md:justify-center md:px-0">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="MIRASWEAR"
              width={200}
              height={26.14}
              className="dark:invert-0"
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
          {/* Mobile menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <MenuIcon />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription className="sr-only">
                    Acesse sua conta, navegue pelo início, confira pedidos e
                    categorias.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-4 py-4">
                  <div className="px-1">
                    {session?.user ? (
                      <div className="flex justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage
                              src={session.user.image as string | undefined}
                            />
                            <AvatarFallback>
                              {session.user.name?.split(" ")?.[0]?.[0]}
                              {session.user.name?.split(" ")?.[1]?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="leading-none font-semibold">
                              {session.user.name}
                            </h3>
                            <span className="text-muted-foreground block max-w-[140px] truncate text-xs">
                              {session.user.email}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => authClient.signOut()}
                        >
                          <LogOutIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold">
                          Olá. Faça seu login!
                        </h2>
                        <Button size="icon" asChild variant="outline">
                          <Link href="/authentication">
                            <LogInIcon className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                  <Separator />
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="ghost"
                      className="justify-start gap-3"
                      asChild
                    >
                      <Link href="/">
                        <HomeIcon className="h-4 w-4" />
                        Início
                      </Link>
                    </Button>
                    {session?.user && (
                      <Button
                        variant="ghost"
                        className="justify-start gap-3"
                        asChild
                      >
                        <Link href="/my-orders">
                          <PackageIcon className="h-4 w-4" />
                          Meus Pedidos
                        </Link>
                      </Button>
                    )}
                  </div>
                  <Separator />
                  <div className="flex flex-col gap-2">
                    <h3 className="text-muted-foreground mb-1 text-xs font-semibold tracking-wide">
                      CATEGORIAS
                    </h3>
                    {categories?.map((c) => (
                      <Button
                        key={c.id}
                        variant="ghost"
                        className="justify-start"
                        asChild
                      >
                        <Link href={`/category/${c.slug}`}>{c.name}</Link>
                      </Button>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="md:hidden">
            <Cart />
          </div>
        </div>
      </div>
      {categories.length > 0 && (
        <nav className="bg-background hidden w-full md:block">
          <div className="mx-auto flex max-w-7xl justify-center gap-20 overflow-x-auto px-6 pt-0 pb-3 text-sm md:px-10">
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
      )}
      {categories.length > 0 && pathname !== "/" && (
        <div className="hidden md:block">
          <Separator />
        </div>
      )}
    </header>
  );
};
