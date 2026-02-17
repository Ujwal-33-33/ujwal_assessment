const jwt = require("jsonwebtoken");
const { config } = require("../config");

function authenticate(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "No token provided" });
    }

    try {
        req.user = jwt.verify(header.split(" ")[1], config.jwtSecret);
        next();
    } catch {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
}

function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "Not allowed" });
        }
        next();
    };
}

function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const errors = result.error.errors.map((e) => ({
                field: e.path.join("."),
                message: e.message,
            }));
            return res.status(400).json({ success: false, message: "Validation failed", errors });
        }
        req.body = result.data;
        next();
    };
}

module.exports = { authenticate, authorize, validate };

