import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Header } from "@/components/common/header";
import SignInForm from "./components/sign-in-form";
import SignUpForm from "./components/sign-up-form";

export function Authentication({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  return (
    <>
      <Header />

      <div className="flex w-full max-w-sm flex-col gap-6">
        <Tabs defaultValue="sign-in">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sign-in">Entrar</TabsTrigger>
            <TabsTrigger value="sign-up">Criar conta</TabsTrigger>
          </TabsList>
          <TabsContent value="sign-in">
            <SignInForm redirect={searchParams?.redirect} />
          </TabsContent>
          <TabsContent value="sign-up">
            <SignUpForm />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

export default Authentication;
