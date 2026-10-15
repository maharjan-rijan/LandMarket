import AreaConverterWidget from "@/components/common/AreaConverterWidget";
import PageHeader from "@/components/common/PageHeader";

export default function AreaConverter() {
  return (
    <div className="wrap section" style={{ paddingTop: "2rem", maxWidth: "52rem" }}>
      <PageHeader title="Land area converter" text="Convert between ropani, aana, paisa, daam, square feet and square metres." />

      <div className="sheet sheet-pad">
        <AreaConverterWidget />
      </div>

      <section className="sheet sheet-pad mt-6">
        <h2 style={{ fontSize: "1.3rem" }}>How the units relate</h2>
        <dl className="kv mt-3">
          <div><dt>1 ropani</dt><dd className="num">16 aana, 5,476 sq ft</dd></div>
          <div><dt>1 aana</dt><dd className="num">4 paisa, 342.25 sq ft</dd></div>
          <div><dt>1 paisa</dt><dd className="num">4 daam, 85.56 sq ft</dd></div>
          <div><dt>1 daam</dt><dd className="num">21.39 sq ft</dd></div>
        </dl>
        <p className="hint">These are the hill-region (Kathmandu Valley) units. The Terai uses bigha, kattha and dhur, which this tool does not cover yet.</p>
      </section>
    </div>
  );
}
