import { Component, JSX } from "solid-js";
import { Mutation } from "./doctype";

export interface Task {
  id: string;
  description: string;
  completed: boolean;
}

interface Props {
  task: Task;
  mutate: (m: Mutation) => Promise<void>;
}

export const TaskItem: Component<Props> = (props) => {
  const task = () => props.task;

  const handleDelete = () => {
    props.mutate({ tag: "DeleteTask", id: task().id }).catch((err) => {
      console.error("Failed to delete", err);
    });
  };

  const handleToggleCompleted = () => {
    props.mutate({ tag: "ToggleCompleted", id: task().id }).catch((err) => {
      console.error("Failed to toggle completed", err);
    });
  };

  return (
    <div class="flex">
      <input
        type="checkbox"
        checked={task().completed}
        onChange={handleToggleCompleted}
      />
      <div>{task().description}</div>
      <ActionIcon color="red" onClick={handleDelete}>
        <IconX />
      </ActionIcon>
    </div>
  );
};

const ActionIcon = (props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    style={{
      border: "none",
      background: "none",
      cursor: "pointer",
      padding: 0,
      margin: 0,
    }}
  />
);

const IconX = () => (
  <svg
    viewBox="0 0 24 24"
    stroke="currentColor"
    fill="none"
    style={{ width: "1rem", height: "1rem" }}
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M6 18L18 6M6 6l12 12"
    ></path>
  </svg>
);
