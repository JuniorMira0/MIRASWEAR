import { useQuery } from "@tanstack/react-query";

import { getCategories } from "@/data/categories/get-categories";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
