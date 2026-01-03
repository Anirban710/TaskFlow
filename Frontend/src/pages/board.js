import { useEffect, useState, useCallback } from "react";
import API from "../api/api";
import {
  DndContext,
  closestCenter,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableTask({ task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-3 rounded shadow-sm hover:shadow-md cursor-grab"
    >
      {task.title}
    </div>
  );
}

function DroppableColumn({ id, children }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-200 rounded-lg p-4 w-64 flex-shrink-0 ${
        isOver ? "ring-2 ring-blue-500" : ""
      }`}
    >
      {children}
    </div>
  );
}

function Board({ project, goBack }) {
  const [lists, setLists] = useState([]);
  const [activity, setActivity] = useState([]);
  const [newTask, setNewTask] = useState("");

  const loadBoard = useCallback(() => {
    API.get(`/projects/${project._id}/board`)
      .then((res) => setLists(res.data.lists))
      .catch(() => alert("Failed to load board"));

    API.get(`/projects/${project._id}/activity`)
      .then((res) => setActivity(res.data));
  }, [project]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  const addTask = async (listId) => {
    try {
      await API.post("/tasks", {
        title: newTask,
        listId,
        projectId: project._id,
      });
      setNewTask("");
      loadBoard();
    } catch {
      alert("Failed to add task");
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const overId = over.id;

    let targetListId = null;

    for (let list of lists) {
      if (list.tasks.find((t) => t._id === overId)) {
        targetListId = list._id;
      }
      if (list._id === overId) {
        targetListId = list._id;
      }
    }

    if (!targetListId) return;

    try {
      await API.patch(`/tasks/${taskId}/move`, {
        listId: targetListId,
      });
      loadBoard();
    } catch {
      alert("Failed to move task");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex">
      {/* Kanban */}
      <div className="flex-1">
        <button
          onClick={goBack}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Back
        </button>

        <h2 className="text-3xl font-bold mb-6">{project.name}</h2>

        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 overflow-x-auto">
            {lists.map((list) => (
              <DroppableColumn key={list._id} id={list._id}>
                <h4 className="font-semibold mb-4">{list.name}</h4>

                <SortableContext
                  items={list.tasks.map((t) => t._id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3 mb-4">
                    {list.tasks.map((task) => (
                      <SortableTask key={task._id} task={task} />
                    ))}
                  </div>
                </SortableContext>

                <input
                  className="w-full p-2 border rounded mb-2"
                  placeholder="New task..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                />

                <button
                  onClick={() => addTask(list._id)}
                  className="w-full bg-blue-500 text-white py-1 rounded hover:bg-blue-600"
                >
                  Add
                </button>
              </DroppableColumn>
            ))}
          </div>
        </DndContext>
      </div>

      {/* Activity Feed */}
      <div className="w-80 bg-white ml-6 p-4 rounded shadow">
        <h3 className="font-bold mb-4">Activity</h3>

        <div className="space-y-3 text-sm">
          {activity.map((a) => (
            <div key={a._id} className="border-b pb-2">
              <b>{a.user?.name}</b> {a.action}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Board;
