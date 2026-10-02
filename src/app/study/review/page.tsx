import { OrderReview } from "@/components/checkout/OrderReview";
import { ShopLayout } from "@/components/layout/ShopLayout";

export default function ReviewPage() {
  return (
    <ShopLayout variant="checkout">
      <OrderReview />
    </ShopLayout>
  );
}
