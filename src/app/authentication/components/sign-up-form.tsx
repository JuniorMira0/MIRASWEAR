"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

import { checkCpfExists } from "@/actions/check-cpf";
import { updateUser } from "@/actions/update-user";
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
import { isValidBRMobilePhone, isValidCPF } from "@/helpers/br-validators";
import { useSetCpf } from "@/hooks/mutations/use-set-cpf";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const formSchema = z
  .object({
    cpf: z.string().min(11, "CPF é obrigatório"),
    phone: z.string().min(10, "Telefone é obrigatório"),
    birthDate: z.string().min(4, "Data de nascimento é obrigatória"),
    gender: z.enum(["female", "male", "other"]),
    name: z
  .string()
      .trim()
      .min(1, "O nome é obrigatório."),
    email: z
  .string()
  .email("Formato de e-mail inválido. Use o formato: exemplo@email.com"),
    password: z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres."),
    passwordConfirmation: z
  .string()
  .min(8, "A confirmação de senha deve ter pelo menos 8 caracteres."),
  })
  .refine(
    (data) => {
      return data.password === data.passwordConfirmation;
    },
    {
      message: "As senhas não coincidem. Verifique se digitou corretamente.",
      path: ["passwordConfirmation"],
    },
  );

type FormValues = z.infer<typeof formSchema>;

const SignUpForm = () => {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
  cpf: "",
  phone: "",
  birthDate: "",
  gender: "other",
  name: "",
  email: "",
  password: "",
  passwordConfirmation: "",
    },
  });

  const setCpfMutation = useSetCpf();

  async function onSubmit(values: FormValues) {
    // validate CPF if present
    if (!values.cpf) {
      form.setError("cpf", { message: "CPF é obrigatório." });
      return;
    }
    if (!isValidCPF(values.cpf)) {
      form.setError("cpf", { message: "CPF inválido." });
      return;
    }

    // validate phone
    if (!isValidBRMobilePhone(values.phone)) {
      form.setError("phone", { message: "Telefone inválido." });
      return;
    }

    const exists = await checkCpfExists(values.cpf);
    if (exists) {
      form.setError("cpf", { message: "CPF já cadastrado." });
      return;
    }

    try {
      await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      try {
        await updateUser({ phone: values.phone, birthDate: values.birthDate, gender: values.gender });
      } catch (e) {
        console.error("Falha ao salvar dados adicionais:", e);
      }

      try {
        await setCpfMutation.mutateAsync(values.cpf || "");
      } catch (e) {
        console.error(e);
        toast.error("Conta criada, mas não foi possível registrar CPF: " + (e instanceof Error ? e.message : ""));
      }

      router.push("/");
    } catch (error: any) {
      if (error?.error?.code === "USER_ALREADY_EXISTS") {
        toast.error("E-mail já cadastrado.");
        return form.setError("email", {
          message: "E-mail já cadastrado.",
        });
      }
      toast.error(error?.error?.message || String(error));
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Criar conta</CardTitle>
          <CardDescription>Crie uma conta para continuar.</CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <CardContent className="grid gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite seu nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite seu email" {...field} />
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
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite sua senha"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="passwordConfirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar senha</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite a sua senha novamente"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit">Criar conta</Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </>
  );
};

export default SignUpForm;
