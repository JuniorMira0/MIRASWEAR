import { useQuery } from "@tanstack/react-query";

import { getCart } from "@/actions/get-cart";
import { authClient } from "@/lib/auth-client";

export const getUseCartQueryKey = () => ["cart", "server"] as const;

export const useCart = (params?: {
  initialData?: Awaited<ReturnType<typeof getCart>>;
}) => {
  const { data: session } = authClient.useSession();

  return useQuery({
    queryKey: getUseCartQueryKey(),
    queryFn: getCart,
    initialData: params?.initialData,
    enabled: !!session?.user,
  });
};
