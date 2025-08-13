"use client";

import {
  HomeIcon,
  LogInIcon,
  LogOutIcon,
  MenuIcon,
  PackageIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";
import { useCategories } from "@/hooks/queries/use-categories";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Cart } from "./cart";

export const Header = () => {
  const { data: session } = authClient.useSession();
  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  return (
    <header className="flex items-center justify-between p-5">
      <Link href="/">
        <Image
          src="/logo.png"
          alt="MIRASWEAR"
          width={200}
          height={26.14}
          className="dark:invert-0"
        />
      </Link>

      <div className="flex items-center gap-3">
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
            <div className="flex flex-col gap-4 py-4">
              {/* Seção do Usuário */}
              <div className="px-5">
                {session?.user ? (
                  <>
                    <div className="flex justify-between space-y-6">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={session?.user?.image as string | undefined}
                          />
                          <AvatarFallback>
                            {session?.user?.name?.split(" ")?.[0]?.[0]}
                            {session?.user?.name?.split(" ")?.[1]?.[0]}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <h3 className="font-semibold">
                            {session?.user?.name}
                          </h3>
                          <span className="text-muted-foreground block text-xs">
                            {session?.user?.email}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => authClient.signOut()}
                      >
                        <LogOutIcon />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold">Olá. Faça seu login!</h2>
                    <Button size="icon" asChild variant="outline">
                      <Link href="/authentication">
                        <LogInIcon />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              {/* Navegação Principal */}
              <div className="flex flex-col gap-2 px-5">
                <Button variant="ghost" className="justify-start gap-3" asChild>
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

              {/* Categorias */}
              <div className="flex flex-col gap-2 px-5">
                <h3 className="text-muted-foreground mb-2 text-sm font-semibold">
                  CATEGORIAS
                </h3>

                {isCategoriesLoading ? (
                  <div className="text-sm text-muted-foreground">
                    Carregando categorias...
                  </div>
                ) : (
                  categories?.map((category) => (
                    <Button
                      key={category.id}
                      variant="ghost"
                      className="justify-start"
                      asChild
                    >
                      <Link href={`/category/${category.slug}`}>
                        {category.name}
                      </Link>
                    </Button>
                  ))
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <Cart />
      </div>
    </header>
  );
};
