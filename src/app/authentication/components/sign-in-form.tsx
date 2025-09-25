'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/ui/loading-button';
import { authClient } from '@/lib/auth-client';

const formSchema = z.object({
  email: z
    .string('Por favor, insira um e-mail válido.')
    .email('Formato de e-mail inválido. Use o formato: exemplo@email.com'),
  password: z
    .string('Por favor, insira uma senha válida.')
    .min(8, 'A senha deve ter pelo menos 8 caracteres.'),
});

type FormValues = z.infer<typeof formSchema>;

const SignInForm = ({ redirect }: { redirect?: string }) => {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: FormValues) {
    await authClient.signIn.email({
      email: values.email,
      password: values.password,
      fetchOptions: {
        onSuccess: () => {
          router.push(redirect || '/');
        },
        onError: ctx => {
          if (ctx.error.code === 'USER_NOT_FOUND') {
            toast.error('Usuário não encontrado. Verifique o e-mail digitado.');
            return form.setError('email', {
              message: 'Usuário não encontrado. Verifique o e-mail digitado.',
            });
          }
          if (ctx.error.code === 'INVALID_EMAIL_OR_PASSWORD') {
            toast.error('E-mail ou senha incorretos. Tente novamente.');
            form.setError('password', {
              message: 'E-mail ou senha incorretos. Tente novamente.',
            });
            return form.setError('email', {
              message: 'E-mail ou senha incorretos. Tente novamente.',
            });
          }
          toast.error('Erro ao fazer login. Tente novamente.');
        },
      },
    });
  }

  return (
    <>
      <Card className="w-full rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-xl backdrop-blur-lg">
        <CardHeader className="pb-2 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-gray-800">
            Bem-vindo de volta
          </CardTitle>
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
                      <Input
                        placeholder="Digite seu email"
                        {...field}
                        className="focus:border-primary focus:ring-primary border-gray-300 bg-gray-50"
                      />
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
                        className="focus:border-primary focus:ring-primary border-gray-300 bg-gray-50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-2">
              <LoadingButton
                isLoading={form.formState.isSubmitting}
                loadingText="Entrando..."
                type="submit"
                className="bg-primary hover:bg-primary/90 w-full rounded-lg py-2 text-base font-semibold text-white transition"
              >
                Entrar
              </LoadingButton>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </>
  );
};

export default SignInForm;
