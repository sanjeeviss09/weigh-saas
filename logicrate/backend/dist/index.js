"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
dotenv_1.default.config();
const auth_1 = __importDefault(require("./routes/auth"));
const forms_1 = __importDefault(require("./routes/forms"));
const feedback_1 = __importDefault(require("./routes/feedback"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/auth', auth_1.default);
app.use('/api/forms', forms_1.default);
app.use('/api/feedback', feedback_1.default);
app.use('/api/analytics', analytics_1.default);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Logicrate API is running!' });
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
