import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";

type FormState = {
  [key: string]:
    | string
    | number
    | boolean
    | FormState
    | (string | number | FormState)[];
};

interface DynamicFormProps {
  initialJsonObject: FormState;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ initialJsonObject }) => {
  const [formState, setFormState] = useState<FormState>(initialJsonObject);
  const [jsonInput, setJsonInput] = useState<string>(
    JSON.stringify(initialJsonObject, null, 2)
  );

  useEffect(() => {
    try {
      const parsedJson = JSON.parse(jsonInput);
      setFormState(parsedJson);
    } catch (e) {
      // Invalid JSON, ignore updates to prevent crashing
    }
  }, [jsonInput]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const keys = name.split(".");

    const setNestedValue = (obj: any, keys: string[], value: any): void => {
      const key = keys[0];
      if (keys.length === 1) {
        obj[key] = type === "checkbox" ? checked : value;
      } else {
        if (!obj[key]) obj[key] = {};
        setNestedValue(obj[key], keys.slice(1), value);
      }
    };

    setFormState((prevState) => {
      const newState = { ...prevState };
      setNestedValue(newState, keys, type === "number" ? Number(value) : value);
      return newState;
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form Submitted:", formState);
  };

  const handleJsonChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
  };

  useEffect(() => {
    setJsonInput(JSON.stringify(formState, null, 2));
  }, [formState]);

  const renderInput = (key: string, value: any, path: string) => {
    const fullPath = path ? `${path}.${key}` : key;

    if (typeof value === "boolean") {
      return (
        <div key={fullPath}>
          <label>{key}</label>
          <input
            type="checkbox"
            name={fullPath}
            checked={value}
            onChange={handleChange}
          />
        </div>
      );
    } else if (typeof value === "number") {
      return (
        <div key={fullPath}>
          <label>{key}</label>
          <input
            type="number"
            name={fullPath}
            value={value}
            onChange={handleChange}
          />
        </div>
      );
    } else if (typeof value === "string") {
      return (
        <div key={fullPath}>
          <label>{key}</label>
          <input
            type="text"
            name={fullPath}
            value={value}
            onChange={handleChange}
          />
        </div>
      );
    } else if (Array.isArray(value)) {
      return (
        <div key={fullPath}>
          <label>{key}</label>
          {value.map((item, index) => renderInput(`${index}`, item, fullPath))}
        </div>
      );
    } else if (typeof value === "object") {
      return (
        <fieldset key={fullPath}>
          <legend>{key}</legend>
          {Object.keys(value).map((nestedKey) =>
            renderInput(nestedKey, value[nestedKey], fullPath)
          )}
        </fieldset>
      );
    } else {
      return null;
    }
  };

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      <form onSubmit={handleSubmit}>
        {Object.keys(formState).map((key) =>
          renderInput(key, formState[key], "")
        )}
        <button type="submit">Submit</button>
      </form>
      <div>
        <h3>JSON Representation</h3>
        <textarea
          style={{ width: "400px", height: "600px" }}
          value={jsonInput}
          onChange={handleJsonChange}
        />
      </div>
    </div>
  );
};

export default DynamicForm;
