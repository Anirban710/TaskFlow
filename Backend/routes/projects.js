const express = require("express");
const Project = require("../models/project");
const User = require("../models/user");
const auth = require("../middleware/auth");

const router = express.Router();

// Get project activity
router.get("/:projectId/activity", auth, async (req, res) => {
  try {
    const Activity = require("../models/activity");

    const activities = await Activity.find({
      project: req.params.projectId,
    })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(activities);
  } catch (error) {
    console.error("ACTIVITY ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// -------------------- GET MY PROJECTS --------------------
router.get("/", auth, async (req, res) => {
  try {
    const projects = await Project.find({
      members: req.user._id,
    });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------- CREATE PROJECT --------------------
router.post("/", auth, async (req, res) => {
  try {
    const { name } = req.body;

    const project = await Project.create({
      name,
      owner: req.user._id,
      members: [req.user._id],
    });

    res.status(201).json(project);
  } catch (error) {
    console.error("CREATE PROJECT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------- ADD MEMBER --------------------
router.post("/:projectId/members", auth, async (req, res) => {
  try {
    const { email } = req.body;

    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (project.members.includes(user._id)) {
      return res.status(400).json({ message: "User already in project" });
    }

    project.members.push(user._id);
    await project.save();

    res.json({ message: "Member added" });
  } catch (error) {
    console.error("ADD MEMBER ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------- GET FULL BOARD --------------------
router.get("/:projectId/board", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!project.members.includes(req.user._id)) {
      return res.status(403).json({ message: "Not a project member" });
    }

    const List = require("../models/list");
    const Task = require("../models/task");

    const lists = await List.find({ project: project._id });

    const board = [];

    for (let list of lists) {
      const tasks = await Task.find({ list: list._id });
      board.push({
        _id: list._id,
        name: list.name,
        tasks,
      });
    }

    res.json({
      project,
      lists: board,
    });
  } catch (error) {
    console.error("FETCH BOARD ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
