const express = require('express');
const connect = require("./schemas");
require('dotenv').config();
require('express-async-errors');
const app = express();
const PORT = process.env.PORT;
//DB연결
connect();

//바디
app.use(express.json());

//라우터
const router = require("./routes/index.js");
app.use("/api",router);


app.use((error,req, res, next) => {
    res.status(error.status || 400).json({message: error.message})
});

app.listen(PORT, () => {
    console.log(PORT, "서버가 실행되었습니다.");
});

