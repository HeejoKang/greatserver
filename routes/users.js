var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//사용자 등록
//get 방식으로 보내면 url에 정보가 모두 노출됨
router.post('/add', function(req,res,next) {
  
  var username = req.body.username;
  var password = req.body.password;
  var nickname = req.body.nickname;
  var score = req.body.score;
  
  var database = req.app.get("database");
  var users = database.collection('users'); //저장대상db

  users.insert([{"username": username, "password": password, "nickname": nickname, "score": score}], 
  function(err, result) {


  });
} 

module.exports = router;
