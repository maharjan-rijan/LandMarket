import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api, { getErrors } from "@/lib/api";
import { checkPhotoFile } from "@/lib/crop";
import Alert from "@/components/ui/Alert";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import AvatarCropper from "@/components/ui/AvatarCropper";

export default function AvatarField() {
  const { user, updateUser } = useAuth();

  const [picked, setPicked] = useState(null); // address of the photo being cropped
  const [fieldError, setFieldError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [focused, setFocused] = useState(false);
  const [done, setDone] = useState("");

  // give the photo's memory back when the box closes or the page is left
  useEffect(
    () => () => {
      if (picked) URL.revokeObjectURL(picked);
    },
    [picked],
  );

  const choose = (file) => {
    setDone("");
    setSaveError("");
    if (!file) return;
    const problem = checkPhotoFile(file);
    setFieldError(problem);
    if (!problem) setPicked(URL.createObjectURL(file));
  };

  const onInput = (e) => {
    choose(e.target.files?.[0]);
    e.target.value = ""; // so choosing the same photo again still counts
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    choose(e.dataTransfer.files?.[0]);
  };

  const cancel = () => {
    setPicked(null);
    setSaveError("");
  };

  const save = async (file) => {
    setSaving(true);
    setSaveError("");
    try {
      const form = new FormData();
      form.append("avatar", file);
      const { data } = await api.post("/account/avatar", form);
      updateUser(data);
      setPicked(null);
      setDone("Your photo is saved.");
    } catch (err) {
      const { message, fields } = getErrors(err);
      setSaveError(fields.avatar || message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setRemoving(true);
    setFieldError("");
    setDone("");
    try {
      const { data } = await api.delete("/account/avatar");
      updateUser(data);
      setDone("Your photo was removed.");
    } catch (err) {
      setFieldError(getErrors(err).message);
    } finally {
      setRemoving(false);
    }
  };

  const hasPhoto = Boolean(user.avatar_url);

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          padding: "1rem",
          borderRadius: "var(--r-md)",
          border: `1px dashed ${dragOver ? "var(--terrace)" : "var(--line-strong)"}`,
          background: dragOver ? "var(--terrace-wash)" : "transparent",
        }}
      >
        <Avatar src={user.avatar_url} name={user.name} size={80} />

        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              as="label"
              htmlFor="avatar-file"
              variant="outline"
              size="sm"
              style={{
                cursor: "pointer",
                outline: focused ? "2px solid var(--terrace)" : undefined,
                outlineOffset: 2,
              }}
            >
              {hasPhoto ? "Change photo" : "Choose photo"}
            </Button>
            <Input
              name="avatar-file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={onInput}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
            {hasPhoto && (
              <Button
                size="sm"
                variant="ghost"
                onClick={remove}
                loading={removing}
              >
                Remove
              </Button>
            )}
          </div>
          <p className="hint" style={{ marginTop: 0 }}>
            JPG, PNG or WebP. Choose a photo or drop one here, then crop and
            zoom it before saving.
          </p>
        </div>
      </div>

      {fieldError && (
        <p className="error-text" role="alert" style={{ marginTop: 0 }}>
          {fieldError}
        </p>
      )}
      <Alert type="success">{done}</Alert>

      <Modal open={Boolean(picked)} onClose={cancel} title="Crop your photo">
        {picked && (
          <AvatarCropper
            src={picked}
            saving={saving}
            error={saveError}
            onCancel={cancel}
            onSave={save}
          />
        )}
      </Modal>
    </div>
  );
}
