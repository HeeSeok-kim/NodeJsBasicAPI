const express = require('express');
const router = express.Router();

const postRouter = require("./posts.js");
const commentRouter = require("./comments.js");


// const wrapAsyncController = (fn) => {
//     return (req,res,next) => {
//         fn(req,res,next).catch(next)
//     }
// }

router.use("/post",postRouter);
router.use("/comment",commentRouter);

module.exports = router;