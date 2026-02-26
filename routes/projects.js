const router = require("express").Router();
const Project = require("../models/Project");
const cloudinary = require("../config/cloudinary");
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // temp storage

// GET all projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().populate("createdBy", "name email");
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST create project with multiple images
router.post("/", upload.array("images"), async (req, res) => {
  try {
    let imagesUrls = [];
    if (req.files) {
      for (let file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, { folder: "projects" });
        imagesUrls.push(result.secure_url);
      }
    }

    const project = new Project({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      location: req.body.location,
      budget: req.body.budget,
      status: req.body.status || "planning",
      createdBy: req.body.createdBy,
      images: imagesUrls
    });

    await project.save();
    res.status(201).json(project);
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE project with optional new images
router.put("/:id", upload.array("images"), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Update basic fields
    project.title = req.body.title || project.title;
    project.description = req.body.description || project.description;
    project.category = req.body.category || project.category;
    project.location = req.body.location || project.location;
    project.budget = req.body.budget || project.budget;
    project.status = req.body.status || project.status;

    // Upload new images if provided
    if (req.files && req.files.length > 0) {
      let imagesUrls = [];
      for (let file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, { folder: "projects" });
        imagesUrls.push(result.secure_url);
      }
      project.images = imagesUrls;
    }

    await project.save();
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update project" });
  }
});

// DELETE PROJECT
router.delete("/:id", async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);
    if (!deletedProject) return res.status(404).json({ message: "Project not found" });
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete project" });
  }
});

module.exports = router;