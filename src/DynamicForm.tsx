import React, { useState, useEffect } from "react";
import { Controlled as CodeMirror } from "react-codemirror2";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/javascript/javascript"; // Import the JavaScript mode for JSON support

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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    try {
      const parsedJson = JSON.parse(jsonInput);
      setFormState(parsedJson);
    } catch (e) {
      // Invalid JSON, ignore updates to prevent crashing
    }
  }, [jsonInput]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formState.name) {
      newErrors.name = "Name is required";
    }
    if (!formState.email) {
      newErrors.email = "Email is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form Submitted:", formState);
    }
  };

  const handleAddKey = (path: string) => {
    const newKey = prompt("Enter new key:");
    if (!newKey) return;

    const type = prompt("Enter type (string, number, boolean, object, array):");
    if (!type) return;

    setFormState((prevState) => {
      const newState = { ...prevState };
      const keys = path.split(".");
      let target = newState;
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (i === keys.length - 1) {
          if (Array.isArray(target)) {
            // Ensure target is an array and assign based on the type
            target.push(
              type === "number"
                ? 0
                : type === "boolean"
                ? false
                : type === "object"
                ? {}
                : type === "array"
                ? []
                : ""
            );
          } else if (typeof target === "object" && target !== null) {
            // Ensure target is an object and assign the new key-value pair
            target[newKey] =
              type === "number"
                ? 0
                : type === "boolean"
                ? false
                : type === "object"
                ? {}
                : type === "array"
                ? []
                : "";
          }
        } else {
          // If the key does not exist, create an empty object
          if (!target[key]) {
            target[key] = {};
          }
        }
      }
      return newState;
    });
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
          {errors[fullPath] && (
            <span style={{ color: "red" }}>{errors[fullPath]}</span>
          )}
        </div>
      );
    } else if (Array.isArray(value)) {
      return (
        <div key={fullPath}>
          <label>{key}</label>
          {value.map((item, index) => renderInput(`${index}`, item, fullPath))}
          <button type="button" onClick={() => handleAddKey(fullPath)}>
            Add Key
          </button>
        </div>
      );
    } else if (typeof value === "object") {
      return (
        <fieldset key={fullPath}>
          <legend>{key}</legend>
          {Object.keys(value).map((nestedKey) =>
            renderInput(nestedKey, value[nestedKey], fullPath)
          )}
          <button type="button" onClick={() => handleAddKey(fullPath)}>
            Add Key
          </button>
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
        <CodeMirror
          value={jsonInput}
          options={{
            mode: { name: "javascript", json: true },
            theme: "material",
            lineNumbers: true,
            tabSize: 2,
          }}
          onBeforeChange={(editor, data, value) => {
            setJsonInput(value);
          }}
          onChange={(editor, data, value) => {
            try {
              const parsedJson = JSON.parse(value);
              setFormState(parsedJson);
            } catch (e) {
              // Handle JSON parsing error if necessary
            }
          }}
        />
      </div>
    </div>
  );
};

export default DynamicForm;
