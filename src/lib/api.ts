import { Product } from "../types";

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch("https://fakestoreapi.com/products");
  const data = await response.json();
  
  return data.map((item: any) => ({
    id: item.id.toString(),
    title: item.title,
    description: item.description,
    price: item.price,
    currency: 'USD',
    image: item.image,
    category: item.category,
    stock: 10, // Mock stock
    vendor: 'FakeStoreAPI',
    tags: [item.category],
    isDraft: false,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}
