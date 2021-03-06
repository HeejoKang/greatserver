/*이 항목은 모두 단방향 통신이었음! */
var express = require('express'); //npm패키지들은 path설정 없이 이름만으로 불러올 수 있음
var util = require('../util');
const { ObjectId } = require('mongodb'); //문자열을 objectID타입으로 변환하려 함
var router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;


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

router.get('/info', util.isLogined, function(req, res, next){ //util.isLogined를 통해 로그인 했을 때만 기능할 것임
   //req.session.isAuthenticated 
    res.json({
      username: req.session.username,
      nickname: req.session.nickname
    });
   
});



// 로그인 기능
// 서버주소/users/signin 요청시 주소
router.post('/signin', function(req, res, next) {
  var username = req.body.username; //body에 있는 username이라는 변수의 값을 읽어서 var username에 전달
  var password = req.body.password;
  //var sessionID;
  var database = req.app.get("database"); //app에 연결된 database를 읽어옴
  var users = database.collection('users'); //데이터베이스 내에 있는 users 콜렉션을 읽어옴
  
  //(1) 유저아이디가 DB상에 존재하는지 확인
  if(username !== undefined && password !== undefined) {
    users.findOne({ username: username }, function( err, result){
      //== 형변환이 일어날 수 있음 ===자료형까지 일치하는지 확인
      // result 값이 null인 경우 서버가 죽는 버그를 걸러줄 수 있음(intresult에 값이 없을 경우 그대로 failure 송출)
      if(result){
        var compareResult = bcrypt.compareSync(password, result.password);
        if(compareResult) {
          ////세션에 값을 저장하는 방식////
          req.session.isAuthenticated = true; //인증을 한 번 받았는가?
          req.session.userid = result._id.toString(); //파일로 저장해야하기 때문에 스트링타입으로 바꿔줌
          // userid는 절대 중복되지 않는 참조값이므로 개개인을 확실하게 식별 가능함
          req.session.username = result.username;
          req.session.nickname = result.nickname;
          res.json({result: ResponseType.SUCCESS});
        }
        else{
          res.json({result: ResponseType.INVALID_PASSWORD});
        }
      }
      /* #Region 수업 시간 중 수정된 사항 */
        // if(password === result.password) {
        //   ////세션에 값을 저장하는 방식////
        //   req.session.isAuthenticated = true; //인증을 한 번 받았는가?
        //   req.session.userid = result._id.toString(); //파일로 저장해야하기 때문에 스트링타입으로 바꿔줌
        //   // userid는 절대 중복되지 않는 참조값이므로 개개인을 확실하게 식별 가능함
        //   req.session.username = result.username;
        //   req.session.nickname = result.nickname;
          

        //   //res.writeHead(200, {'Session-ID':['sessionID=' + sessionID + '; Path=/']});
        //   //var ret = Json.stringify({result: ResponseType.SUCCESS});
        //   //res.write(ret);
        //   //res.end();
          
        //   //res.writeHead(200, { 'Set-Cookie':['username=' + result.username + '; Path=/']});
        //   //쿠키는 해당폴더를 기준으로 발급이 되기 때문에 최상위 폴더에서는 쿠키에 접근할 수 없는 문제가 있음
        //   // Path=/를 지정해줌으로서 최상위 서버(localhost:3000)에서도 접속 가능하게 됨
        //   res.json({result: ResponseType.SUCCESS});
        //   //var ret = JSON.stringify({ result: ResponseType.SUCCESS });
        //   //res.write(ret); 
        //   //write함수: 클라이언트에게 문자열을 전달하는 함수 최종적으로 res.end()와 함께 사용하여야 온전히 전송 가능
        //   //res.end();
        // }

        /* #endRegion */
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

  //JS는 기본적으로 모든 함수가 비동기적으로 움직임
  // 함수명Sync를 붙이면 동기적으로 움직이게 되면서 해당함수가 모두 처리될 때까지 프로그램이 멈춤(다음라인으로 넘어가지X)
  var salt = bcrypt.genSaltSync(saltRounds);
  var hash = bcrypt.hashSync(password, salt);
  
  var database = req.app.get("database");
  var users = database.collection('users'); 
  
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
  
  /* Post와 Get
  (1) 전달하려는 값이 '저장'의 목적인가? = Post
  (2) 전달하려는 값이 '링크' '검색'의 목적인가? = Get */

  /*Node.js 서버는 자주 죽을 수 있으나 다시 켜주는 utilty가 존재함
  (1) node에서의 핵심은 구조의 탄탄함 x
  (2) 회원의 정보나 기능을 복구 가능하게끔 짜는 방식이 필요 */

  ///Score 추가///
  router.get('/addscore/:score', function(req, res, next) {
    var score = req.params.score;
    var userid = req.session.userid;
    //현재 username의 중복을 검사하지 않기 때문에 오류가 나타날 가능성이 있음

    var database = req.app.get("database");
    var users = database.collection('users');

    if(userid != undefined) {
      result = users.updateOne({_id: ObjectId(userid)},
        {$set: { //$set score항목만 업데이트 하시오
        score: Number(score),
        updatedAt: Date.now() //DB변경 날짜 추가
      }}, {upsert: true }, function(err) {
        if(err) {
          res.status(200).send("failure");
        }
        res.status(200).send("success");
      }); //upsert 기존 DB자료에 score항목이 없을 경우 새 항목으로 만들어 DB에 추가
    }
  });

  ///Score 불러오기///
  router.get('/score', function(req, res, next){
    var userid = req.session.userid;
    var database = req.app.get("database");
    var users = database.collection('users');

    users.findOne({_id: ObjectId(userid)}, function(err, result) {
      if(err) throw err; //상위 에러처리 함수에게 전달

      var resultObj = {
        id: result._id.toString(),
        score: result.score
      };

      res.json(resultObj);
    });
  });

  /* 해시처리와 해시함수
  (1) 특정 길이로 만들어 사용하려 할 때 해시를 사용함
  (2) 패스워드를 그냥 그대로 저장한다면 정보탈취나 보안의 위험이 커짐
  md5처럼 해시처리를 하면 암호화된다고 볼 수 있음
  
  <암호화의 방식>
  (1) 대칭형 암호화
  같은 입력 -> 같은 결과 호출
  1234 -> asdf
  1234 -> asdf
  해시처리 된 값 -> 변경 전 값으로 되돌릴 수 X
  하지만 유저의 비밀번호를 통해 동일한 값을 항상 호출할 수 있음
  (2) 비대칭형 암호화
  같은 입력이라도 -> 다른 결과 호출
  1234 -> wedg
  1234 -> hfdd*/
  module.exports = router;
