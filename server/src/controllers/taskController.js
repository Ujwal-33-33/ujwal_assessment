const Task = require("../models/Task");

exports.createTask = async (req, res, next) => {
    try {
        const taskData = {
            ...req.body,
            assignedUser: req.body.assignedUser || req.user.id,
        };

        if (req.user.role !== "admin" && taskData.assignedUser !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You can only create tasks assigned to yourself",
            });
        }

        const task = await Task.create(taskData);
        res.status(201).json({ success: true, data: task });
    } catch (err) {
        next(err);
    }
};

exports.getTasks = async (req, res, next) => {
    try {
        const filter = req.user.role === "admin" ? {} : { assignedUser: req.user.id };
        const tasks = await Task.find(filter)
            .populate("assignedUser", "name email")
            .sort({ createdAt: -1 });

        res.json({ success: true, count: tasks.length, data: tasks });
    } catch (err) {
        next(err);
    }
};

exports.getTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id).populate("assignedUser", "name email");

        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        if (req.user.role !== "admin" && task.assignedUser._id.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Not authorized to view this task" });
        }

        res.json({ success: true, data: task });
    } catch (err) {
        next(err);
    }
};

exports.updateTask = async (req, res, next) => {
    try {
        let task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        if (req.user.role !== "admin" && task.assignedUser.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Not authorized to update this task" });
        }

        if (req.user.role !== "admin" && req.body.assignedUser && req.body.assignedUser !== req.user.id) {
            return res.status(403).json({ success: false, message: "You cannot reassign tasks" });
        }

        task = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).populate("assignedUser", "name email");

        res.json({ success: true, data: task });
    } catch (err) {
        next(err);
    }
};

exports.deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        if (req.user.role !== "admin" && task.assignedUser.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this task" });
        }

        await Task.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Task deleted successfully" });
    } catch (err) {
        next(err);
    }
};
