require('dotenv').config();
const express = require("express")
const cors = require("cors")
const mainRouter = require("./routes/index")
const bodyParser = require("body-parser");
const app = express();

app.use(express.json());
app.use(cors());
 


app.use("/api/v1",mainRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`)
})
