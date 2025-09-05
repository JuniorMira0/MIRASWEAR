"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
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
    cpf: z
      .string()
      .min(11, "CPF é obrigatório")
      .refine((v) => isValidCPF(v.replace(/\D/g, "")), {
        message: "CPF inválido",
      }),
    phone: z
      .string()
      .min(10, "Telefone é obrigatório")
      .refine((v) => isValidBRMobilePhone(v.replace(/\D/g, "")), {
        message: "Telefone inválido",
      }),
    birthDate: z
      .string()
      .min(8, "Data de nascimento é obrigatória")
      .refine((v) => /^(\d{2}\/\d{2}\/\d{4})$/.test(v), {
        message: "Data deve ter o formato DD/MM/AAAA",
      }),
    gender: z
      .union([z.enum(["female", "male", "other"]), z.literal("")])
      .refine((v) => v !== "", { message: "Selecione um gênero" }),
    name: z.string().trim().min(1, "O nome é obrigatório."),
    email: z.string().email("Formato de e-mail inválido. Use o formato: exemplo@email.com"),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
    passwordConfirmation: z.string().min(8, "A confirmação de senha deve ter pelo menos 8 caracteres."),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "As senhas não coincidem. Verifique se digitou corretamente.",
    path: ["passwordConfirmation"],
  });

type FormValues = z.infer<typeof formSchema>;

const SignUpForm = () => {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as unknown as Resolver<FormValues>,
    defaultValues: {
  cpf: "",
  phone: "",
  birthDate: "",
  gender: "",
  name: "",
  email: "",
  password: "",
  passwordConfirmation: "",
    },
  });

  const setCpfMutation = useSetCpf();

  const maskCPF = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
  };

  const maskPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const maskBirthDate = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
  };

  async function onSubmit(values: FormValues) {
    const cleanedCpf = values.cpf.replace(/\D/g, "");
    const cleanedPhone = values.phone.replace(/\D/g, "");

    if (!cleanedCpf || !isValidCPF(cleanedCpf)) {
      form.setError("cpf", { message: "CPF inválido." });
      return;
    }

    if (!isValidBRMobilePhone(cleanedPhone)) {
      form.setError("phone", { message: "Telefone inválido." });
      return;
    }

    const exists = await checkCpfExists(cleanedCpf);
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
        await authClient.signIn.email({ email: values.email, password: values.password });
      } catch (err) {
        console.error("Falha ao autenticar após cadastro:", err);
      }

      const birthIso = (() => {
        try {
          const parts = values.birthDate.split("/");
          if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
          return values.birthDate;
        } catch {
          return values.birthDate;
        }
      })();

      try {
        await updateUser({ phone: cleanedPhone, birthDate: birthIso, gender: values.gender });
      } catch (e) {
        console.error("Falha ao salvar dados adicionais:", e);
      }

      try {
        await setCpfMutation.mutateAsync(cleanedCpf || "");
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
                      <Input
                        placeholder="000.000.000-00"
                        value={field.value}
                        onChange={(e) => field.onChange(maskCPF(e.target.value))}
                      />
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
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(00) 9 0000-0000"
                        value={field.value}
                        onChange={(e) => field.onChange(maskPhone(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de nascimento</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="DD/MM/AAAA"
                        value={field.value}
                        onChange={(e) => field.onChange(maskBirthDate(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gênero</FormLabel>
                    <FormControl>
                      <select className="mt-1 w-full rounded-md border px-3 py-2" {...field}>
                        <option value="">Selecione</option>
                        <option value="female">Feminino</option>
                        <option value="male">Masculino</option>
                        <option value="other">Outro</option>
                      </select>
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
                      <Input placeholder="Digite sua senha" type="password" {...field} />
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
