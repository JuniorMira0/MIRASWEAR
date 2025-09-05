import { setCpf } from "@/actions/set-cpf";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const getSetCpfMutationKey = () => ["set-cpf"] as const;

export const useSetCpf = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: getSetCpfMutationKey(),
    mutationFn: (cpf: string) => setCpf(cpf),
    onSuccess: () => {
      // invalidate user profile queries if any
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};
