const express = require("express");
const Task = require("../models/task");
const List = require("../models/list");
const Project = require("../models/project");
const auth = require("../middleware/auth");
const Activity = require("../models/activity");

const router = express.Router();

// Create Task
router.post("/", auth, async (req, res) => {
    try {
        const { title, description, listId, projectId, assignedTo } = req.body;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Check if user is member
        if (!project.members.includes(req.user._id)) {
            return res.status(403).json({ message: "Not a project member" });
        }

        const list = await List.findById(listId);
        if (!list) {
            return res.status(404).json({ message: "List not found" });
        }

        const task = await Task.create({
            title,
            description,
            list: listId,
            project: projectId,
            assignedTo,
            createdBy: req.user._id,
        });

        res.status(201).json(task);
    } catch (error) {
        console.error("CREATE TASK ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Move task to another list
router.patch("/:taskId/move", auth, async (req, res) => {
    try {
        const { listId } = req.body;

        const task = await Task.findById(req.params.taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const project = await Project.findById(task.project);
        if (!project.members.includes(req.user._id)) {
            return res.status(403).json({ message: "Not a project member" });
        }

        task.list = listId;
        await task.save();

        // Log activity
        await Activity.create({
            user: req.user._id,
            project: task.project,
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
