import { formatNpr, totalPrice } from "@/lib/format";

export default function PriceTag({ land }) {
  return (
    <div>
      <p className="price num">{formatNpr(totalPrice(land))}</p>
      <p className="price-sub num">{formatNpr(land.pricePerAana)} per aana</p>
    </div>
  );
}
