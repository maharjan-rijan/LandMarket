import { useState } from "react";
import { getErrors } from "@/lib/api";

const NO_ERRORS = { message: "", fields: {} };

// Shared form state + submit handling for Login, Register and later forms.
export default function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState(NO_ERRORS);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const setValue = (name, value) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = (action) => async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors(NO_ERRORS);
    try {
      await action(values);
    } catch (err) {
      setErrors(getErrors(err));
    } finally {
      setSubmitting(false);
    }
  };

  return { values, errors, submitting, handleChange, setValue, handleSubmit };
}
