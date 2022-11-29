const mongoose = require("mongoose");
const post = require("../schemas/post");
const Schema = mongoose.Schema;

const comment = new mongoose.Schema({
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
    createdAt: {
        type: Date
    },
    postId:{
        type: Schema.Types.ObjectId,
        ref: post,
        required: true
    }
},{versionKey : false});

module.exports = mongoose.model("comment", comment);