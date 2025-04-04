import express from "express";
import cors from "cors";
import connectDB from "./Config/Database.js";
import userRoutes from "./Routes/UserRoutes.js";
import bodyParser from "body-parser";
// import dotenv from "dotenv";
const app = express();
// dotenv.config();

const port = process.env.PORT || 3000
connectDB();

app.use(cors({
  origin: process.env.CLIENT_URL || "*",  
  credentials: true
}));
app.use(express.json());
app.use(bodyParser.json({ limit: "50mb" }));  
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true })); 



app.use("/api/users", userRoutes);

// app.listen(port, () => console.log(`Server started on PORT:${port}`))
export default app;
