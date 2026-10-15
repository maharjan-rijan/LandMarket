import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "@/store/DataContext";
import { DISTRICTS } from "@/data/districts";
import { PATHS } from "@/routes/paths";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PageHeader from "@/components/common/PageHeader";
import VendorCard from "@/components/vendor/VendorCard";

export default function SellerStore() {
  const { myStore, saveStore } = useData();
  const [v, setV] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // myStore can arrive a moment after the first render
  useEffect(() => {
    if (myStore && !v)
      setV({
        name: myStore.name,
        type: myStore.type,
        district: myStore.district,
        phone: myStore.phone,
        email: myStore.email,
        about: myStore.about,
      });
  }, [myStore, v]);

  if (!myStore || !v) return null;

  const set = (k) => (e) => {
    setSaved(false);
    setV((p) => ({ ...p, [k]: e.target.value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (v.name.trim().length < 2) {
      setError("Enter a store name.");
      return;
    }
    setError("");
    const stored = await saveStore({ ...v, name: v.name.trim() });
    if (stored) setSaved(true);
  };

  return (
    <>
      <PageHeader
        title="Store profile"
        text="This is what buyers see on your public store page."
        action={
          <Link to={PATHS.vendor(myStore.id)} className="btn btn-outline">
            View public page
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem] xl:items-start">
        <form
          onSubmit={submit}
          className="sheet sheet-pad flex flex-col gap-5"
          noValidate
        >
          <Alert type="success">{saved ? "Store profile saved." : ""}</Alert>
          <Input
            label="Store name"
            name="name"
            value={v.name}
            onChange={set("name")}
            error={error}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              as="select"
              label="I sell as"
              name="type"
              value={v.type}
              onChange={set("type")}
            >
              <option>Owner</option>
              <option>Agency</option>
            </Input>
            <Input
              as="select"
              label="Based in"
              name="district"
              value={v.district}
              onChange={set("district")}
            >
              {DISTRICTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </Input>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Phone"
              name="phone"
              type="tel"
              value={v.phone}
              onChange={set("phone")}
            />
            <Input
              label="Public email"
              name="email"
              type="email"
              value={v.email}
              onChange={set("email")}
            />
          </div>
          <Input
            as="textarea"
            label="About your store"
            name="about"
            value={v.about}
            onChange={set("about")}
            hint="Tell buyers what land you sell and where."
          />
          <div>
            <Button type="submit">Save changes</Button>
          </div>
        </form>

        <aside className="flex flex-col gap-4" aria-label="Store preview">
          <VendorCard vendor={{ ...myStore, ...v }} />
        </aside>
      </div>
    </>
  );
}
