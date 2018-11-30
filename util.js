// 서버와 연동할 때 필요한 기능들을 모아놓을 것(로그인 Auth 기능이나.. 등등)

var util = {};

//Request의 인증 확인
util.isLogined = function(req, res, next){ //next (1)번 무명함수의 역할이 끝나면 다음 함수 순서로 전달하는 명령어
    //로그인 여부 확인 
    if(req.session.isAuthenticated) {
        return next();
    } 
    res.status(403).send();
};

module.exports = util; //required로 util안의 값/함수에 접근하고 사용할 수 있음