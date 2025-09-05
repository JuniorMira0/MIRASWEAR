"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
  zipCode: z.string().min(9, "Por favor, digite um CEP válido"),
  address: z.string().min(1, "Por favor, digite seu endereço"),
  number: z.string().min(1, "Por favor, digite o número"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Por favor, digite o bairro"),
  city: z.string().min(1, "Por favor, digite a cidade"),
  state: z.string().min(1, "Por favor, digite o estado"),
});

export type AddressFormValues = z.infer<typeof formSchema>;

interface AddressFormProps {
  onSubmit: (values: AddressFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
}

export function AddressForm({ onSubmit, isSubmitting }: AddressFormProps) {
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
  zipCode: "",
      address: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
    },
  });

  const { data: session } = authClient.useSession();
  // no personal fields here; address-only form
  useEffect(() => {
  }, [session, form]);

  // CEP auto lookup
  const zipCodeValue = form.watch("zipCode");
  const [cepStatus, setCepStatus] = useState<
    "idle" | "loading" | "done" | "error"
  >("idle");
  const [lastFetchedCep, setLastFetchedCep] = useState<string>("");
  useEffect(() => {
    const cleanCep = (zipCodeValue || "").replace(/\D/g, "");
    if (cleanCep.length !== 8 || cleanCep === lastFetchedCep) return;
    let cancelled = false;
    const lookup = async () => {
      try {
        setCepStatus("loading");
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        if (!res.ok) throw new Error("Falha ao buscar CEP");
        const data = await res.json();
        if (cancelled) return;
        if (data?.erro) {
          setCepStatus("error");
          toast.error("CEP não encontrado");
          return;
        }
        form.setValue("address", data.logradouro || "", {
          shouldValidate: true,
        });
        form.setValue("neighborhood", data.bairro || "", {
          shouldValidate: true,
        });
        form.setValue("city", data.localidade || "", { shouldValidate: true });
        form.setValue("state", data.uf || "", { shouldValidate: true });
        if (data.complemento) {
          form.setValue("complement", data.complemento, {
            shouldValidate: true,
          });
        }
        setLastFetchedCep(cleanCep);
        setCepStatus("done");
      } catch (e) {
        if (cancelled) return;
        setCepStatus("error");
        toast.error("Não foi possível buscar o CEP");
      }
    };
    lookup();
    return () => {
      cancelled = true;
    };
  }, [zipCodeValue, lastFetchedCep, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (v) => onSubmit(v))}
        className="mt-4 space-y-4"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="zipCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CEP</FormLabel>
                <FormControl>
                  <PatternFormat
                    format="#####-###"
                    placeholder="00000-000"
                    customInput={Input}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                {cepStatus === "loading" && (
                  <p className="text-muted-foreground text-xs">
                    Buscando endereço pelo CEP…
                  </p>
                )}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Input placeholder="Digite seu endereço" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o número" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="complement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Complemento</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Apto, bloco, etc. (opcional)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="neighborhood"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bairro</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o bairro" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input placeholder="Digite a cidade" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o estado" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <LoadingButton
          type="submit"
          className="w-full"
          isLoading={!!isSubmitting}
          loadingText="Salvando..."
        >
          Salvar endereço
        </LoadingButton>
      </form>
    </Form>
  );
}
