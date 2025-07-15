import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 دقائق قبل اعتبار البيانات قديمة
      cacheTime: 15 * 60 * 1000, // 15 دقائق قبل إزالة البيانات من الذاكرة المؤقتة
      refetchOnWindowFocus: false, // عدم إعادة جلب البيانات عند تركيز النافذة
      retry: 1, // عدد المحاولات عند الفشل
    },
  },
});