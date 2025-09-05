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
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">
        <div className="w-full max-w-md flex flex-col gap-6">
          <Tabs defaultValue="sign-in">
            <TabsList className="grid w-full grid-cols-2 mb-4">
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
      </div>
    </>
  );
}

export default Authentication;
