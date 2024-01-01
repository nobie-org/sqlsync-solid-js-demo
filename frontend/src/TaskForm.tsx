import { Mutation } from "./doctype";
import { v4 as uuidv4 } from "uuid";
import { Component, JSX, createSignal } from "solid-js";

interface TaskFormProps {
  mutate: (m: Mutation) => Promise<void>;
}

interface InputProps {
  onChange?: JSX.CustomEventHandlersCamelCase<HTMLInputElement>["onChange"];
  value?: string;
  name: string;
  label: string;
  error?: string;
  placeholder?: string;
}

const Input: Component<InputProps> = (props) => {
  return (
    <>
      <label for={props.name}>{props.label}</label>
      <input
        required
        name={props.name}
        value={props.value}
        placeholder={props.placeholder}
        onChange={props.onChange}
      />
      <span>{props.error}</span>
    </>
  );
};

export const TaskForm = ({ mutate }: TaskFormProps) => {
  const [inputValue, setInputValue] = createSignal("");

  const handleSubmit: JSX.EventHandler<HTMLFormElement, SubmitEvent> = async (
    e
  ) => {
    e.preventDefault();

    if (inputValue().trim().length === 0) {
      alert("Please enter a task with a non-empty description");
      return;
    }

    const id = crypto.randomUUID ? crypto.randomUUID() : uuidv4();
    return mutate({
      tag: "CreateTask",
      id,
      description: inputValue(),
    })
      .then(() => {
        setInputValue("");
      })
      .catch((err) => {
        console.error(
          "Failed to create task with description: ",
          inputValue(),
          err
        );
      });
  };

  return (
    // @ts-ignore
    <form onSubmit={handleSubmit}>
      <div class="gap-2">
        <Input
          placeholder="Add a task"
          name="task"
          label="task"
          value={inputValue()}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button onSubmit={(e) => e.preventDefault()} type="submit">
          Add
        </button>
      </div>
    </form>
  );
};
