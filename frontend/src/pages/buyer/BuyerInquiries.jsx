import { useData } from "@/store/DataContext";
import InquiryList from "@/components/dashboard/InquiryList";
import PageHeader from "@/components/common/PageHeader";

export default function BuyerInquiries() {
  const { uid, inquiries } = useData();
  const items = inquiries.filter((i) => i.buyerId === uid).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <>
      <PageHeader title="My inquiries" text="Every message you sent to a seller, and whether they replied." />
      <InquiryList mode="buyer" items={items} />
    </>
  );
}
