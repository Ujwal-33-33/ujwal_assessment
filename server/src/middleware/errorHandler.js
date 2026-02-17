const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: "Validation Error",
            errors: Object.values(err.errors).map((e) => e.message),
        });
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(409).json({
            success: false,
            message: `Duplicate value for '${field}'. This ${field} is already taken.`,
        });
    }

    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: `Invalid ${err.path}: ${err.value}`,
        });
    }

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
};

module.exports = errorHandler;
