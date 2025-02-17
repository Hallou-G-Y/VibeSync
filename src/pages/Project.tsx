import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import {
  Plus,
  Image as ImageIcon,
  Link as LinkIcon,
  Calendar,
} from "lucide-react";
import type { Project, Task, MoodboardItem } from "../types";

export default function Project() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [moodboardItems, setMoodboardItems] = useState<MoodboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTask, setShowNewTask] = useState(false);
  const [showNewMoodboardItem, setShowNewMoodboardItem] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "todo" as const,
    dueDate: "",
  });
  const [newMoodboardItem, setNewMoodboardItem] = useState({
    type: "image" as const,
    content: "",
  });

  useEffect(() => {
    async function fetchProjectData() {
      if (!id || !currentUser) return;

      try {
        // Fetch project details
        const projectDoc = await getDoc(doc(db, "projects", id));
        if (!projectDoc.exists()) {
          throw new Error("Project not found");
        }
        setProject({ id: projectDoc.id, ...projectDoc.data() } as Project);

        // Fetch tasks
        const tasksQuery = query(
          collection(db, "tasks"),
          where("projectId", "==", id)
        );
        const tasksSnapshot = await getDocs(tasksQuery);
        const tasksData = tasksSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[];
        setTasks(tasksData);

        // Fetch moodboard items
        const moodboardQuery = query(
          collection(db, "moodboardItems"),
          where("projectId", "==", id)
        );
        const moodboardSnapshot = await getDocs(moodboardQuery);
        const moodboardData = moodboardSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as MoodboardItem[];
        setMoodboardItems(moodboardData);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching project data:", error);
        setLoading(false);
      }
    }

    fetchProjectData();
  }, [id, currentUser]);

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser || !id) return;

    try {
      const taskRef = await addDoc(collection(db, "tasks"), {
        ...newTask,
        projectId: id,
        assignedTo: currentUser.uid,
        status: "todo",
        createdAt: serverTimestamp(),
        dueDate: new Date(newTask.dueDate),
      });

      const newTaskData: Task = {
        id: taskRef.id,
        projectId: id,
        title: newTask.title,
        description: newTask.description,
        status: "todo",
        assignedTo: currentUser.uid,
        dueDate: new Date(newTask.dueDate),
        createdAt: new Date(),
      };

      setTasks([...tasks, newTaskData]);
      setNewTask({ title: "", description: "", status: "todo", dueDate: "" });
      setShowNewTask(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  }

  async function handleCreateMoodboardItem(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser || !id) return;

    try {
      const moodboardRef = await addDoc(collection(db, "moodboardItems"), {
        ...newMoodboardItem,
        projectId: id,
        createdBy: currentUser.uid,
        position: { x: Math.random() * 500, y: Math.random() * 500 },
        createdAt: serverTimestamp(),
      });

      const newItemData: MoodboardItem = {
        id: moodboardRef.id,
        projectId: id,
        type: newMoodboardItem.type,
        content: newMoodboardItem.content,
        position: { x: Math.random() * 500, y: Math.random() * 500 },
        createdBy: currentUser.uid,
        createdAt: new Date(),
      };

      setMoodboardItems([...moodboardItems, newItemData]);
      setNewMoodboardItem({ type: "image", content: "" });
      setShowNewMoodboardItem(false);
    } catch (error) {
      console.error("Error creating moodboard item:", error);
    }
  }

  async function handleDragEnd(result: any) {
    if (!result.destination || !currentUser) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId) {
      // Reordering within the same status column
      const newTasks = Array.from(tasks);
      const [removed] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, removed);
      setTasks(newTasks);
    } else {
      // Moving to a different status column
      const task = tasks.find((t) => t.id === draggableId);
      if (!task) return;

      const newStatus = destination.droppableId as
        | "todo"
        | "in-progress"
        | "done";

      try {
        await updateDoc(doc(db, "tasks", draggableId), {
          status: newStatus,
        });

        const updatedTasks = tasks.map((t) =>
          t.id === draggableId ? { ...t, status: newStatus } : t
        );
        setTasks(updatedTasks);
      } catch (error) {
        console.error("Error updating task status:", error);
      }
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
        <p className="mt-2 text-gray-600">{project.description}</p>
      </div>

      {/* Tasks Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Tasks</h2>
          <button
            onClick={() => setShowNewTask(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Task
          </button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {["todo", "in-progress", "done"].map((status) => (
              <Droppable key={status} droppableId={status}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-gray-50 p-4 rounded-lg"
                  >
                    <h3 className="text-lg font-medium text-gray-900 mb-4 capitalize">
                      {status.replace("-", " ")}
                    </h3>
                    <div className="space-y-3">
                      {tasks
                        .filter((task) => task.status === status)
                        .map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-white p-4 rounded-md shadow-sm"
                              >
                                <h4 className="font-medium text-gray-900">
                                  {task.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {task.description}
                                </p>
                                <div className="flex items-center mt-2 text-sm text-gray-500">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Moodboard Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Moodboard</h2>
          <button
            onClick={() => setShowNewMoodboardItem(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Item
          </button>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg min-h-[400px] relative">
          {moodboardItems.map((item) => (
            <div
              key={item.id}
              className="absolute bg-white p-2 rounded-md shadow-sm"
              style={{
                left: `${item.position.x}px`,
                top: `${item.position.y}px`,
                maxWidth: "200px",
              }}
            >
              {item.type === "image" ? (
                <img
                  src={item.content}
                  alt=""
                  className="w-full h-auto rounded"
                />
              ) : (
                <a
                  href={item.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  {item.content}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* New Task Modal */}
      {showNewTask && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Create New Task
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  required
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Due Date
                </label>
                <input
                  type="date"
                  required
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask({ ...newTask, dueDate: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewTask(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Moodboard Item Modal */}
      {showNewMoodboardItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add Moodboard Item
            </h3>
            <form onSubmit={handleCreateMoodboardItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  value={newMoodboardItem.type}
                  onChange={(e) =>
                    setNewMoodboardItem({
                      ...newMoodboardItem,
                      type: e.target.value as "image" | "link",
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="image">Image</option>
                  <option value="link">Link</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {newMoodboardItem.type === "image" ? "Image URL" : "Link URL"}
                </label>
                <input
                  type="url"
                  required
                  value={newMoodboardItem.content}
                  onChange={(e) =>
                    setNewMoodboardItem({
                      ...newMoodboardItem,
                      content: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder={
                    newMoodboardItem.type === "image"
                      ? "https://example.com/image.jpg"
                      : "https://example.com"
                  }
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewMoodboardItem(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
