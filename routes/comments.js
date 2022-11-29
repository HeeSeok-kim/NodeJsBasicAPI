const express = require("express");
const router = express.Router();
const comment = require("../schemas/comment");


const ERRORTYPE = {
    BadRequestError : 'BadRequestError',
    NotFound : 'NotFoundError'
}
const STATUS = {
    BadRequestError : 400,
    NotFound : 404
}

const COMMENT_ERROR = {...ERRORTYPE['BadRequestError'],...STATUS['BadRequestError'], message: '댓글 내용을 입력해주세요.' };
const DEFAULT_ERROR = {...ERRORTYPE['BadRequestError'],...STATUS['BadRequestError'], message:"데이터 형식이 올바르지 않습니다."};
const NODBSEARCH_ERROR = {...ERRORTYPE['NotFound'],...STATUS['NotFound'], message:"댓글 조회에 실패하였습니다."}
const PASSWORD_ERROR = {...ERRORTYPE['BadRequestError'],...STATUS['BadRequestError'], message:"잘못된 비밀번호"};

router.post("/:_postId",async (req,res,next) => {
    const postId = req.params;
    const { user, password, content } = req.body;
    if(!content){
        throw COMMENT_ERROR
    }
    //에러처리
    if(!user || !password || !postId){
        throw DEFAULT_ERROR;
    }
    try {
        const commentData = await comment.find({postId : {$eq: postId['_postId']}},{postId:0}).sort({createdAt:-1});
        if(commentData === null) throw DEFAULT_ERROR;
    }catch (error){
        throw DEFAULT_ERROR;
    }

    //시간 가져오기
    let nowDate= new Date();
    //한국시간 변환
    let createdAt = new Date(nowDate.getTime() - (nowDate.getTimezoneOffset() * 60000)).toISOString();

    //DB에 넣고 잘 성공했을시 200;
    await comment.create({ user, password, content,createdAt, postId:postId['_postId']});
    res.status(200).json({"message": "댓글을 생성하였습니다."});
});

router.get("/:_postId",async (req,res,next) => {
    const postId = req.params;
    console.log(postId)
    if(!postId){
        throw DEFAULT_ERROR;
    }
    try {
        const postData = await comment.find({postId : {$eq: postId['_postId']}},{postId:0}).sort({createdAt:-1});
        console.log(postData);
        let getPostData = [];
        postData.forEach((data) => {
            getPostData.push({
                commentId:String(data['_id']),
                user:data['user'],
                content:data['content'],
                createdAt:data['createdAt']
            })
        })
        res.status(200).json({data:getPostData})
    }catch (error){
        next(DEFAULT_ERROR)
    }
});

router.put("/:_commentId",async (req,res,next) => {
    const commentId = req.params;
    const {password, content } = req.body;
    let result = "";
    if(!content){
        throw COMMENT_ERROR
    }
    //내용이 없으면 에러처리
    if(!password || !commentId){
        throw DEFAULT_ERROR;
    }

    //DB검색
    try {
        result = await comment.findOne({_id : {$eq : commentId['_commentId']}},{password:1});
        if(result === null) throw NODBSEARCH_ERROR
    }catch (error){
        throw NODBSEARCH_ERROR;
    }

    if(result['password'] === password) {
        let nowDate= new Date();
        let createdAt = new Date(nowDate.getTime() - (nowDate.getTimezoneOffset() * 60000)).toISOString();
        await comment.updateOne({_id: {$eq:commentId['_commentId']}}, { $set: {content, createdAt} })
        res.status(200).json({  "message": "댓글을 수정하였습니다."});
    }else {
        throw PASSWORD_ERROR
    }
});

router.delete("/:_commentId",async (req,res,next) => {
    const commentId = req.params;
    const {password} = req.body;
    let result = "";
    //내용 없으면 에러
    if(!password || !commentId){
        throw DEFAULT_ERROR;
    }

    //DB에 일치하는 commentId없으면 에러
    try {
        result = await comment.findOne({_id : {$eq : commentId['_commentId']}},{password:1});
        if(result === null) {throw DEFAULT_ERROR}
    }catch (error) {
        throw DEFAULT_ERROR
    }

    if(result['password'] === password){
        await comment.deleteOne({_id:{$eq:commentId['_commentId']}});
        res.status(200).json({"message":"댓글을 삭제하였습니다."})
    }else {
        throw PASSWORD_ERROR;
    }
});

router.use('/',(req,res)=>{
    if(req.method){
        throw DEFAULT_ERROR;
    }
})

module.exports = router;