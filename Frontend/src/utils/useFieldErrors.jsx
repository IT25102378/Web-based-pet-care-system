import { useCallback, useState } from 'react';

// =============================================================================
// Shows validation messages under the field they belong to.
//
//   const { check, errorFor } = useFieldErrors();
//
//   const error = check(
//     ['formData.phone', formData.phone, validatePhone(formData.phone)],
//     !selectedPetId ? 'Please select a pet' : null,   // not tied to one field
//   );
//   if (error) { showToast('Please Check the Form', error, 'error'); return; }
//
//   <input value={formData.phone} ... />
//   {errorFor('formData.phone', formData.phone)}
//
// check() returns the first message (or null when everything is valid). A
// field's message disappears as soon as its value changes, so corrected or
// reset forms never show a stale error.
// =============================================================================
export function useFieldErrors() {
  const [errors, setErrors] = useState({});

  const check = useCallback((...rules) => {
    const next = {};
    let first = null;
    rules.forEach((rule) => {
      if (!rule) return;
      if (Array.isArray(rule)) {
        const [key, value, message] = rule;
        if (!message) return;
        if (!(key in next)) next[key] = { value, message };
        first = first || message;
      } else {
        first = first || rule;
      }
    });
    setErrors(next);
    return first;
  }, []);

  const errorFor = (key, value) => {
    const error = errors[key];
    if (!error || error.value !== value) return null;
    return (
      <span className="form-error" role="alert" style={{ display: 'block', marginTop: '4px' }}>
        {error.message}
      </span>
    );
  };

  return { check, errorFor };
}
