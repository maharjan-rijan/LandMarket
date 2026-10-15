import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/store/DataContext";
import { ROLES } from "@/lib/roles";
import { PATHS } from "@/routes/paths";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function InquiryForm({ land }) {
  const { user } = useAuth();
  const { sendInquiry } = useData();
  const location = useLocation();

  const [message, setMessage] = useState(
    `Hello, I am interested in "${land.title}". Is it still available?`,
  );
  const [phone, setPhone] = useState(user?.phone || "");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  if (!user) {
    return (
      <div>
        <p className="text-muted text-sm">
          Create a free account to message this seller and track every inquiry
          in one place.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button to={PATHS.register}>Create account</Button>
          <Button to={PATHS.login} variant="outline" state={{ from: location }}>
            Login
          </Button>
        </div>
      </div>
    );
  }

  if (user.role !== ROLES.BUYER) {
    return (
      <p className="text-muted text-sm">
        Inquiries are sent from buyer accounts.
      </p>
    );
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-3">
        <Alert type="success">
          Inquiry sent. The seller can reply to {user.email}.
        </Alert>
        <Link to={PATHS.buyer.inquiries} className="link text-sm">
          See your inquiries
        </Link>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    if (message.trim().length < 10) {
      setError(
        "Write at least 10 characters so the seller knows what you need.",
      );
      return;
    }
    const sentOk = await sendInquiry({
      land,
      message: message.trim(),
      phone: phone.trim(),
    });
    if (sentOk) setSent(true);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
      <Input
        as="textarea"
        label="Message to seller"
        name="message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        error={error}
      />
      <Input
        label="Your phone (optional)"
        name="phone"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <Button type="submit" className="btn-block">
        Send inquiry
      </Button>
    </form>
  );
}
