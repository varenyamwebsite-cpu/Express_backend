import "dotenv/config"
import express from "express"
import cors from "cors"
import V1Router from "./routes/v1/index.js";

const app = express();

app.use(express.json());
app.use(cors())
app.use("/v1", V1Router);

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found on server.` });
});

// 2. Global Error Handler (Prevents server crashes and dumps exact error as JSON)
app.use((err, req, res, next) => {
  console.error("Express Error:", err.message);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});


const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
