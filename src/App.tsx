import DynamicForm from "./DynamicForm";

const jsonObject = {
  name: "John Doe",
  email: "john.doe@example.com",
  age: 30,
  newsletter: true,
  address: {
    street: "123 Main St",
    city: "Anytown",
    zip: {
      one: "test",
      two: [3, 5, 68],
    },
  },
  hobbies: ["reading", "traveling", "swimming"],
};

function App() {
  return <DynamicForm initialJsonObject={jsonObject} />;
}

export default App;
