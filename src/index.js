import "dotenv/config"
import express from "express"
import cors from "cors"
import V1Router from "./routes/v1/index.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors())
app.use("/v1", V1Router);

app.listen(PORT, () => { console.log("server running on port: ", PORT) });