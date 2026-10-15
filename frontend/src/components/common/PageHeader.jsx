export default function PageHeader({ title, text, action }) {
  return (
    <div className="page-head">
      <div>
        <h1 className="page-title">{title}</h1>
        {text && <p className="text-muted mt-1">{text}</p>}
      </div>
      {action}
    </div>
  );
}
