const app = require("./app");
const { config, connectDB } = require("./config");

(async () => {
    await connectDB();
    app.listen(config.port, () => {
        console.log(`Server running on port ${config.port}`);
        console.log(`Docs: http://localhost:${config.port}/api-docs`);
    });
})();
