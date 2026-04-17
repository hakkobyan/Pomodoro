import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import "./styles.css";

const STORAGE_KEYS = {
  tasks: "pomodoro.tasks",
};

function readStoredItems(key) {
  try {
    const storedItems = window.localStorage.getItem(key);
    return storedItems ? JSON.parse(storedItems) : [];
  } catch {
    return [];
  }
}

function useStoredList(key) {
  const [items, setItems] = useState(() => readStoredItems(key));

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(items));
  }, [items, key]);

  return [items, setItems];
}

function createItem(text) {
  return {
    id: crypto.randomUUID(),
    text,
    createdAt: new Date().toISOString(),
  };
}

export default function App() {
  const [tasks, setTasks] = useStoredList(STORAGE_KEYS.tasks);
  const [taskText, setTaskText] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  function addTask(event) {
    event.preventDefault();
    const text = taskText.trim();

    if (!text) {
      return;
    }

    setTasks((currentTasks) => [createItem(text), ...currentTasks]);
    setTaskText("");
  }

  function removeTask(taskId) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
  }

  return (
    <main className="app-shell" aria-label="Pomodoro dashboard">
      <header className="top-menu" aria-label="Main menu">
        <div className="menu-title">Pomodoro</div>
        <div className="settings-area">
          <button
            className="settings-button"
            type="button"
            aria-expanded={settingsOpen}
            aria-controls="settings-popup"
            onClick={() => setSettingsOpen((isOpen) => !isOpen)}
          >
            Settings
          </button>
          {settingsOpen ? (
            <div id="settings-popup" className="settings-popup" role="dialog">
              <div className="settings-popup-title">Settings</div>
              <button type="button" onClick={() => setSettingsOpen(false)}>
                Close
              </button>
            </div>
          ) : null}
        </div>
      </header>
      <section className="board" aria-label="Pomodoro board frame">
        <div className="board-row board-row-top">
          <section className="panel panel-small" aria-label="Focus summary space" />
          <section className="panel panel-wide" aria-labelledby="tasks-title">
            <div className="panel-header">
              <h1 id="tasks-title">Tasks</h1>
              <span>{tasks.length}</span>
            </div>
            <form className="entry-form" onSubmit={addTask}>
              <div className="entry-row">
                <Input
                  id="task-input"
                  type="text"
                  label="Add task"
                  value={taskText}
                  onChange={setTaskText}
                  placeholder="What needs focus?"
                />
                <button type="submit">Add</button>
              </div>
            </form>
            <ul className="item-list" aria-label="Saved tasks">
              {tasks.map((task) => (
                <li key={task.id}>
                  <span>{task.text}</span>
                  <button type="button" onClick={() => removeTask(task.id)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <div className="board-row board-row-bottom">
          <section className="panel panel-half" aria-label="Focus data space" />
          <section className="panel panel-half" aria-label="Smart focus space" />
        </div>
      </section>
    </main>
  );
}
