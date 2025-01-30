const express = require("express");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./middlewares/auth");

const app = express();
app.use(express.json());
app.use(cors());

mongoose
    .connect("mongodb://localhost:27017/LanguageLearning", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to database"))
    .catch((err) => console.error("Database connection error:", err));

// User Schema & Model
const userSchema = new mongoose.Schema({
    id: String,
    name: String,
    email: String,
    password: String,
});

const User = mongoose.model("User", userSchema);

app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "Email Already Exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ id: uuidv4(), name, email, password: hashedPassword });
        await newUser.save();
        res.status(200).json({ message: "User created successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
  
    if (!user) {
      return res.status(404).json({ message: "Email does not exist." });
    }
  
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
  
    const token = jwt.sign({ id: user.id }, "Secret_key", { expiresIn: "1h" });
    res.status(200).json({ token });
  });
  


app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
