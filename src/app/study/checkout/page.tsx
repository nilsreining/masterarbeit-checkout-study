import { Checkout } from "@/components/checkout/Checkout";
import { ShopLayout } from "@/components/layout/ShopLayout";

export default function CheckoutPage() {
  return (
    <ShopLayout variant="checkout">
      <Checkout />
    </ShopLayout>
  );
}
