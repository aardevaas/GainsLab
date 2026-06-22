import { ShoppingCart } from "lucide-react";
import { ComingSoon } from "@/components/ui/ComingSoon";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Grocery List" };

export default function GroceryPage() {
  return (
    <ComingSoon
      title="Grocery List"
      description="Pick your meals for the week and get an auto-generated grocery list with quantities and macros."
      icon={ShoppingCart}
    />
  );
}
