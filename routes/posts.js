const express = require("express");
const router = express.Router();
const post = require("../schemas/post");

const DEFAULT_ERROR = {error:"BadRequestError",status:400, message:"데이터 형식이 올바르지 않습니다."};
const PASSWORD_ERROR = {error:"BadRequestError",status:400, message:"잘못된 비밀번호"};
const NODBSEARCH_ERROR = {error:"BadRequestError",status:404, message:"게시글 조회에 실패하였습니다."}
router.get("/user",async (req,res,next)=> {
    try {
        //password, content 필드 제외 하고 날짜로 내림차순 정렬하기
        const user = await User.find({});
        let getUserData = [];
        user.forEach((data) => {
            getUserData.push({
                userId:String(data['_id']),
                name:data['name'],
                ID:data['id'],
                pw:data['pw']
            })
        })
        res.status(200).json({result:getUserData})
    }catch (error){
        next({error: "BadRequestError", status:400, message: "회원 목록 조회 실패"})
    }
})

router.get("/:userId",async (req,res,next) => {
    //DB에서 찾고 데이터 보내주기
    const userId = req.params;
    if(!userId){
        throw {error:"BadRequestError",status:400, message:"회원 상세 조회 실패"};
    }
    try {
        const result = await User.findOne({_id : {$eq : userId['userId']}});
        if(result === null) throw {error:"BadRequestError",status:400, message:"회원 상세 조회 실패"}
        const detail = {
            userId:String(result['_id']),
            name:result['name'],
            ID:result['id'],
            pw:result['pw']
        }
        res.status(200).json({
            message:{result:detail}
        });
    }catch (error){
        next({error:"BadRequestError",status:400, message:"회원 상세 조회 실패"});
    }
});


router.get("/",async (req,res,next) => {
    try {
        //password, content 필드 제외 하고 날짜로 내림차순 정렬하기
        const postData = await post.find({});
        let getPostData = [];
        postData.forEach((data) => {
            getPostData.push({
                userId:String(data['_id']),
                name:data['name'],
                ID:data['id'],
                pw:data['pw']
            })
        })
        res.status(200).json({result:getPostData})
    }catch (error){
        next({DEFAULT_ERROR})
    }
});

router.post("/",async (req,res) => {
    //유저에게 받아올값
    const { user, password, title, content } = req.body;
    //에러처리
    if(!user || !password || !title || !content){
        // throw new Error("BadRequestError");
        throw DEFAULT_ERROR;
    }

    //시간 가져오기
    let nowDate= new Date();

    //한국시간 변환
    let createdAt = new Date(nowDate.getTime() - (nowDate.getTimezoneOffset() * 60000)).toISOString();

    //DB에 넣고 잘 성공했을시 200;
    const createdPost = await post.create({ user, password, title, content,createdAt});
    res.status(200).json({ message: "게시글을 생성하였습니다." });
})

router.get("/:_postId",async (req,res,next) => {
    //DB에서 찾고 데이터 보내주기
    const postId = req.params;
    if(!postId){
        throw DEFAULT_ERROR;
    }
    try {
        const result = await post.findOne({_id : {$eq : postId['_postId']}},{password:0});
        if(result === null) throw NODBSEARCH_ERROR
        const detail = {
            postId:result['_id'],
            user:result['user'],
            content:result['content'],
            title:result['title'],
            createdAt:result['createdAt']
        }
        res.status(200).json({
            message:detail
        });
    }catch (error){
        next(NODBSEARCH_ERROR);
    }
});

router.put("/:_postId",async (req,res,next) => {
    //DB에서 데이터 수정해서 보내주기!
    const postId = req.params;
    const {password, title, content } = req.body;

    let result = "";
    //내용이 없으면 에러처리
    if(!password || !title || !content || !postId){
        throw DEFAULT_ERROR;
    }
    //DB에 일치하는 postId가 없으면 에러처리
    try {
        result = await post.findOne({_id : {$eq : postId['_postId']}},{password:1});
        if(result === null) throw NODBSEARCH_ERROR
    }catch (error){
        throw NODBSEARCH_ERROR;
    }
    //비밀번호가 다르면 에러처리
    if(result['password'] === password){
        let nowDate= new Date();
        let createdAt = new Date(nowDate.getTime() - (nowDate.getTimezoneOffset() * 60000)).toISOString();
        await post.updateOne({postId}, { $set: { title, content, createdAt} })
        res.status(200).json({"message": "게시글을 수정하였습니다."});
    }else {
        throw PASSWORD_ERROR;
    }
});

router.delete("/:_postId",async (req,res,next) => {
    //DB에서 지우기
    const postId = req.params;
    const {password} = req.body;
    let result = "";
    //내용 없으면 에러처리
    if(!password || !postId){
        throw DEFAULT_ERROR;
    }
    //DB에 일치하는 postId 없으면 에러처리
    try {
        result = await post.findOne({_id : {$eq : postId['_postId']}},{password:1});
        if(result === null) throw NODBSEARCH_ERROR
    }catch (error){
        throw NODBSEARCH_ERROR;
    }
    if(result['password'] === password){
        await post.deleteOne({_id : {$eq : postId['_postId']}});
        res.status(200).json({"message": "게시글을 삭제하였습니다."});
    }else{
        throw PASSWORD_ERROR;
    }
})

// /api/posts/ 주소로 DELETE, PUT보냈을때 예외처리
router.use('/',(req,res)=>{
    if(req.method === 'DELETE' || req.method === 'PUT'){
        throw DEFAULT_ERROR;
    }
})


module.exports = router;