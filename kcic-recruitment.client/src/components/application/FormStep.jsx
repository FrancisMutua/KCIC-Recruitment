import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { IconLoader2 } from "@tabler/icons-react";
import { load, post } from "../../lib/recruitmentApi";
import { Field, StepNavigation } from "./Field";
import { isShown, validateFields } from "../../lib/fieldRules";

/**
 * A single-record section of the application (employment status, declarations). Values are read
 * from the stored application and saved with one POST when the applicant moves on.
 *
 * config: { sections: [{ title, intro, fields, show(values) }], savePath, fromDetails(details) → values,
 *           toPayload(values), validate(values) → errors }
 */
export default function FormStep({ applicationNo, config, onBack, onNext }) {
  const [values, setValues] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    load("application-details", applicationNo)
      .then((details) => active && setValues(config.fromDetails(details || {})))
      .catch((error) => active && toast.error(error.message || "Could not load the application."));
    return () => { active = false; };
  }, [applicationNo, config]);

  const change = (name, value) => {
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const save = async () => {
    const fields = config.sections.filter((section) => !section.show || section.show(values)).flatMap((section) => section.fields);
    const found = { ...validateFields(fields, values), ...(config.validate?.(values) || {}) };
    setErrors(found);
    if (Object.keys(found).length) {
      toast.error("Please correct the highlighted fields.");
      return;
    }
    setSaving(true);
    try {
      await post(config.savePath, { applicationNo, ...config.toPayload(values) });
      toast.success("Saved");
      onNext();
    } catch (error) {
      toast.error(error.message || "Could not save this section.");
    } finally {
      setSaving(false);
    }
  };

  if (!values) {
    return <div className="flex justify-center py-16 text-slate-500"><IconLoader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-8">
      {config.sections.filter((section) => !section.show || section.show(values)).map((section) => (
        <section key={section.title} className="space-y-4">
          <div className="border-b pb-2">
            <h3 className="text-lg font-semibold text-slate-900">{section.title}</h3>
            {section.intro && <p className="text-sm text-slate-600 mt-1">{section.intro}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {section.fields.filter((field) => isShown(field, values)).map((field) =>
              <Field key={field.name} field={field} value={values[field.name]} error={errors[field.name]} onChange={change} disabled={saving} />)}
          </div>
        </section>
      ))}
      <StepNavigation onBack={onBack} onNext={save} busy={saving} nextLabel="Save and continue" />
    </div>
  );
}
