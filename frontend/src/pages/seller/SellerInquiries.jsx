import { useData } from "@/store/DataContext";
import InquiryList from "@/components/dashboard/InquiryList";
import PageHeader from "@/components/common/PageHeader";

export default function SellerInquiries() {
  const { inquiries, myStore } = useData();
  const items = inquiries
    .filter((i) => i.vendorId === myStore?.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <>
      <PageHeader title="Inquiries" text="Buyers who messaged you about a listing." />
      <InquiryList mode="seller" items={items} />
    </>
  );
}
