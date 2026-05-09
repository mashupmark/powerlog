export const useCustomersQuery = () => {
  const { $db } = useNuxtApp();

  return useQuery({
    key: ["customers"],
    query: async () => {
      const customers = await $db.find({
        fields: ["customerName"],
        selector: { customerName: { $exists: true } },
      });
      return Array.from(new Set(customers.docs.map(({ customerName }) => customerName!)));
    },
  });
};
