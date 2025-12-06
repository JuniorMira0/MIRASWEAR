import { Header } from '@/components/common/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import SignInForm from './components/sign-in-form';
import SignUpForm from './components/sign-up-form';

export function Authentication({ searchParams }: { searchParams: { redirect?: string } }) {
  return (
    <>
      <Header />
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">
        <div className="flex w-full max-w-md flex-col gap-6">
          <Tabs defaultValue="sign-in">
            <TabsList className="mb-4 grid w-full grid-cols-2">
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
