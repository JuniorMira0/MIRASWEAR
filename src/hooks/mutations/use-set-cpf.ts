import { useMutation, useQueryClient } from '@tanstack/react-query';

export const getSetCpfMutationKey = () => ['set-cpf'] as const;

export const useSetCpf = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: getSetCpfMutationKey(),
    mutationFn: async (cpf: string) => {
      const res = await fetch(`/api/set-cpf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Erro ao salvar CPF');
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};
