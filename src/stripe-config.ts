export const products = {
  pro: {
    priceId: 'price_1R8JoLD32QRoF7Sd8NZLnw3E',
    name: 'Pro',
    description: '1,200 Credits/mo • 5 schedules/day • 3 concurrent video generation • 10s video supported • Unlimited Storages • Unlimited Downloads • Priority support',
    mode: 'subscription' as const,
  },
} as const;

export type Product = keyof typeof products;
export type ProductDetails = typeof products[Product];