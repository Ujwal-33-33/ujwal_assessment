const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { config } = require("../config");

function signToken(user) {
    return jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
    );
}

exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(409).json({ success: false, message: "Email already registered" });
        }

        const user = await User.create({ name, email, password, role });
        const token = signToken(user);

        res.status(201).json({
            success: true,
            data: {
                token,
                user: { id: user._id, name: user.name, email: user.email, role: user.role },
            },
        });
    } catch (err) {
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select("+password");
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: "Wrong email or password" });
        }

        const token = signToken(user);

        res.json({
            success: true,
            data: {
                token,
                user: { id: user._id, name: user.name, email: user.email, role: user.role },
            },
        });
    } catch (err) {
        next(err);
    }
};

exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.json({
            success: true,
            data: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        next(err);
    }
};
