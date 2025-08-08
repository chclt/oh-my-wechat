import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: "always",
      staleTime: Number.POSITIVE_INFINITY,
      refetchOnWindowFocus: false,
    },
    mutations: {
      networkMode: "always",
    },
  },
});

export default queryClient;
