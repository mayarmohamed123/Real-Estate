// imports
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

//configurations
dotenv.config();
const app = express();
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(cors());
app.use(helmet());
app.use(
  helmet.crossOriginResourcePolicy({
    policy: "same-origin",
  }),
);
app.use(morgan("dev"));

//routes
app.get("/", (req, res) => {
  res.send(
    "Hello World! This is the backend API for the Real Estate Platform.",
  );
});

//server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`server is working on port ${PORT}`);
});
