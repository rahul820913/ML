import express from "express";
import cors from "cors";
import connectDB from "./Config/Database.js";
import userRoutes from "./Routes/UserRoutes.js";
import bodyParser from "body-parser";
import multer from "multer";
import XLSX from "xlsx";
import dotenv from "dotenv";
const app = express();
dotenv.config();

const port = process.env.PORT || 4000
connectDB();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: "50mb" }));  // Increase JSON request size
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true })); // Increase URL-encoded request size



app.use("/api/users", userRoutes);

app.listen(port, () => console.log(`Server started on PORT:${port}`))
