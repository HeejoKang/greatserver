var express = require('express');
var router = express.Router();

var ResponseType = {
  INVALID_USERNAME: 0,
  INVALID_PASSWORD: 1,
  SUCCESS: 2
}

//npm mongoose: 서버- DB-클라 간 전송을 미리 만들어둔 모듈

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
/* 데이터 저장방식
(1) 메모리 파일(클라) -- 쿠키
(2) DB
(3) 세션(서버)*/

/* 쿠키
- 필요한 이유
> 주소가 달라짐 == 이전 라우터와의 연결고리가 끊어짐. 서로 독립적인 관계의 페이지에서도 사용자 정보를 불러오기 위해 필요함
> 계속해서 사용자 요청을 받아 자료를 전달해주는 과정을 단축시킬 수 있음(쿠키가 없다면 매 페이지마다 다시 로그인 해야할 것)
- 서버는 쿠키데이터를 통해 사용자를 식별하고 바로바로 요청에 대응할 수 있게 됨
(1) 장점
- 
(2) 단점
- 클라이언트가 정보를 저장하고 있다 (보안 상 취약함)
- 보안 상 취약하기 때문에 중요한 정보들(회원정보, 결제정보 등)은 쿠키를 사용하기 힘들다
>> 보완점: 세션session 기능: 유저의 정보를 서버에 저장해 둠 */

/* 세션 
- 쿠키에 저장된 키워드(ID라던지)를 통해 서버 내 정보에 접근하는 방식
*/

// 닉네임 팝업 기능
// 쿠키를 통해 클라이언트를 식별하는 라우터(로그인 히스토리가 있는 클라이언트 식별)
////1129 세션기능이 추가되어 사용하지 않는 코드////
/*router.get('/info', function(req, res, next) {
  var cookies = req.cookies;
  if(cookies.username !== undefined) {
    res.send('Welcome ' + cookies.username);
  }
  else{
    res.send('Who are you?'); //쿠키가 없다면 접속한 적이 없는 사람
  }
})*/

router.get('/info', function(req, res, next){
   //req.session.isAuthenticated 이거 play씬에서 새로 생성된 세션이라서 안 ㅗ대요 안 되요겠지
  if(req.session.isAuthenticated) { 
    res.json({
      username: req.session.username,
      nickname: req.session.nickname
    });
   }
  else{
    res.json({
      username: '',
      nickname: ''
    });
   }
});



// 로그인 기능
// 서버주소/users/signin 요청시 주소
router.post('/signin', function(req, res, next) {
  var username = req.body.username; //body에 있는 username이라는 변수의 값을 읽어서 var username에 전달
  var password = req.body.password;
  var sessionID;
  var database = req.app.get("database"); //app에 연결된 database를 읽어옴
  var users = database.collection('users'); //데이터베이스 내에 있는 users 콜렉션을 읽어옴

  
  //(1) 유저아이디가 DB상에 존재하는지 확인
  if(username !== undefined && password !== undefined) {
    users.findOne({ username: username }, function( err, result){

      //== 형변환이 일어날 수 있음 ===자료형까지 일치하는지 확인
      // result 값이 null인 경우 서버가 죽는 버그를 걸러줄 수 있음(intresult에 값이 없을 경우 그대로 failure 송출)
      if(result){
        if(password === result.password) {
          ////세션에 값을 저장하는 방식////
          req.session.isAuthenticated = true; //인증을 한 번 받았는가?
          req.session.username = result.username;
          req.session.nickname = result.nickname;
          

          res.writeHead(200, {'Session-ID':['sessionID=' + sessionID + '; Path=/']});
          var ret = Json.stringify({result: ResponseType.SUCCESS});
          res.write(ret);
          res.end();
          
          //res.writeHead(200, { 'Set-Cookie':['username=' + result.username + '; Path=/']});
          //쿠키는 해당폴더를 기준으로 발급이 되기 때문에 최상위 폴더에서는 쿠키에 접근할 수 없는 문제가 있음
          // Path=/를 지정해줌으로서 최상위 서버(localhost:3000)에서도 접속 가능하게 됨
          //res.json({result: ResponseType.SUCCESS});
          //var ret = JSON.stringify({ result: ResponseType.SUCCESS });
          //res.write(ret); 
          //write함수: 클라이언트에게 문자열을 전달하는 함수 최종적으로 res.end()와 함께 사용하여야 온전히 전송 가능
          //res.end();
        }
        else{
          res.json({result: ResponseType.INVALID_PASSWORD});
        }
      }
      else{
        res.json({result: ResponseTyped.INVALID_USERNAME});
      }
      
    });


    

  }


});
//json파일로 받아 enum타입으로 정수를 설정하여 보냄: 일반 스트링자료보다 더욱 다양한 정보를 전달할 수 있음(결과값 + @)

//사용자 등록
//get 방식으로 보내면 url에 정보가 모두 노출됨
router.post('/add', function(req,res,next) {
  
  var username = req.body.username;
  var password = req.body.password;
  var nickname = req.body.nickname;
  //var score = req.body.score;
  
  var database = req.app.get("database");
  var users = database.collection('users'); //저장대상db

  //에러 대비 기능: DB상 항목(?)에 해당하는 변수에 값을 넣어 보내줍니다
  if(username !== undefined && password !== undefined && 
    nickname !== undefined /*&& score !== undefined*/)
    {  
      users.insert([{"username": username, "password": password, "nickname": nickname /*"score": score*/}], 
      function(err, result) { 
        res.status(200).send("success");
      });
  }

}); 

module.exports = router;
