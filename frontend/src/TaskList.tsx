import { sql } from "@orbitinghail/sqlsync-solid-js";
import { JournalId } from "@orbitinghail/sqlsync-worker";
import { ConnectionStatus } from "./ConnectionStatus";
import { useMutate, useQuery } from "./doctype";
import { Task, TaskItem } from "./TaskItem";
import { TaskForm } from "./TaskForm";
import { For } from "solid-js";

interface Props {
  docId: JournalId;
}

export const TaskList = (props: Props) => {
  const queryState = useQuery<Task>(
    () => props.docId,
    () => sql`select id, description, completed from tasks order by description`
  );

  const tasks = () => queryState().rows ?? [];
  const mutate = useMutate(props.docId);

  return (
    <div class="flex flex-col gap-2 mb-6">
      <div class="flex items-center justify-between">
        <div>Tasks</div>
        <ConnectionStatus docId={props.docId} />
      </div>
      <For each={tasks()}>
        {(task) => {
          return <TaskItem task={task} mutate={mutate} />;
        }}
      </For>
      <TaskForm mutate={mutate} />
    </div>
  );
};
