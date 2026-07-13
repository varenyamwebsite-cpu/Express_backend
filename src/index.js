import "dotenv/config"
import express from "express"
import cors from "cors"
import V1Router from "./routes/v1/index.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors())
app.use("/v1", V1Router);

const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
