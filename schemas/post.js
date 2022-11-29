const mongoose = require("mongoose");

/*
{
"user": "Developer",
"password": "1234",
"title": "안녕하세요",
"content": "안녕하세요 content 입니다."
}
* */
const post = new mongoose.Schema({
    user: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date
    }
},{versionKey : false});

module.exports = mongoose.model("post", post);