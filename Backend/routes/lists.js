const express = require("express");
const List = require("../models/list");
const Project = require("../models/project");
const auth = require("../middleware/auth");

const router = express.Router();

// Create List (Column)
router.post("/", auth, async (req, res) => {
  try {
    const { name, projectId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user is member of project
    if (!project.members.includes(req.user._id)) {
      return res.status(403).json({ message: "Not a project member" });
    }

    const list = await List.create({
      name,
      project: projectId,
      order: 0,
    });

    res.status(201).json(list);
  } catch (error) {
    console.error("CREATE LIST ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
