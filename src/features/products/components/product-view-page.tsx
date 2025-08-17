import { fakeProducts, Product } from '@/constants/mock-api';
import { notFound } from 'next/navigation';
import ProductForm from './product-form';

type TProductViewPageProps = {
  leadsId: string;
};

export default async function ProductViewPage({
  leadsId
}: TProductViewPageProps) {
  let product = null;
  let pageTitle = 'Create New Leads';

  if (leadsId !== 'new') {
    const data = await fakeProducts.getProductById(Number(leadsId));
    product = data.product as Product;
    if (!product) {
      notFound();
    }
    pageTitle = `Edit Leads`;
  }

  return <ProductForm initialData={product} pageTitle={pageTitle} />;
}
