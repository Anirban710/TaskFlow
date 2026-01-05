const express = require("express");
const Task = require("../models/task");
const List = require("../models/list");
const Project = require("../models/project");
const Activity = require("../models/activity");
const auth = require("../middleware/auth");

const router = express.Router();

// -------------------- CREATE TASK --------------------
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, listId, assignedTo } = req.body;

    if (!title || !listId) {
      return res.status(400).json({ message: "Title and listId are required" });
    }

    // Find list
    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    // Find project from list
    const project = await Project.findById(list.project);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Permission check
    if (!project.members.includes(req.user._id)) {
      return res.status(403).json({ message: "Not a project member" });
    }

    // Create task
    const task = await Task.create({
      title,
      description,
      list: list._id,
      project: project._id,
      assignedTo,
      createdBy: req.user._id,
    });

    // Log activity
    await Activity.create({
      user: req.user._id,
      project: project._id,
      action: "created task",
      entityType: "task",
      entityId: task._id,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("CREATE TASK ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------- MOVE TASK --------------------
router.patch("/:taskId/move", auth, async (req, res) => {
  try {
    const { listId } = req.body;

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    const project = await Project.findById(task.project);
    if (!project.members.includes(req.user._id)) {
      return res.status(403).json({ message: "Not a project member" });
    }

    task.list = list._id;
    await task.save();

    await Activity.create({
      user: req.user._id,
      project: project._id,
      action: "moved task",
      entityType: "task",
      entityId: task._id,
    });

    res.json(task);
  } catch (error) {
    console.error("MOVE TASK ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
