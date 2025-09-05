"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const formSchema = z.object({
  email: z
    .string("Por favor, insira um e-mail válido.")
    .email("Formato de e-mail inválido. Use o formato: exemplo@email.com"),
  password: z
    .string("Por favor, insira uma senha válida.")
    .min(8, "A senha deve ter pelo menos 8 caracteres."),
});

type FormValues = z.infer<typeof formSchema>;

const SignInForm = ({ redirect }: { redirect?: string }) => {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: FormValues) {
    await authClient.signIn.email({
      email: values.email,
      password: values.password,
      fetchOptions: {
        onSuccess: () => {
          router.push(redirect || "/");
        },
        onError: (ctx) => {
          if (ctx.error.code === "USER_NOT_FOUND") {
            toast.error("Usuário não encontrado. Verifique o e-mail digitado.");
            return form.setError("email", {
              message: "Usuário não encontrado. Verifique o e-mail digitado.",
            });
          }
          if (ctx.error.code === "INVALID_EMAIL_OR_PASSWORD") {
            toast.error("E-mail ou senha incorretos. Tente novamente.");
            form.setError("password", {
              message: "E-mail ou senha incorretos. Tente novamente.",
            });
            return form.setError("email", {
              message: "E-mail ou senha incorretos. Tente novamente.",
            });
          }
          toast.error("Erro ao fazer login. Tente novamente.");
        },
      },
    });
  }

  const handleSignInWithGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
    });
  };
  return (
    <>
      <Card className="w-full shadow-xl rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-lg p-6">
        <CardHeader className="pb-2 text-center">
          <CardTitle className="text-2xl font-bold text-gray-800 tracking-tight">Bem-vindo de volta</CardTitle>
          <CardDescription className="text-gray-500">Faça login para continuar</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CardContent className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite seu email" {...field} className="bg-gray-50 border-gray-300 focus:border-primary focus:ring-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Senha</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite sua senha"
                        type="password"
                        {...field}
                        className="bg-gray-50 border-gray-300 focus:border-primary focus:ring-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button type="submit" className="w-full font-semibold text-base py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition">Entrar</Button>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={handleSignInWithGoogle}
                type="button"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Entrar com Google
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </>
  );
};

export default SignInForm;
