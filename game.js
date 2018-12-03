//module.exports를 해놓으면 다른 스크립트에서 require로 불러올 수 있게 됨

/* 웹의 기본: 단방향 통신 == 정적인 갱신
<>
 * 웹에서 동적인 갱신: Event가 발생했을 때(변경사항이 있을 때) 컴퓨터가 알아서 확인 후 갱신하는 형태
 * ex) 실시간 검색어 순위 갱신 등

 *단점
 (1) 모든 클라이언트(브라우저)에서 동작하지 않음(크롬, 파폭, EX 등등 다양한 브라우저가 있는데...)
    > socket.io로 커버
    >> 동적인 갱신을 할 수 '없는' 클라이언트를 대상으로 정적인 방식의 대안도 있는 모듈(?) 플러그인(?)
 */
module.exports = function(server) {

    var io = require('socket.io')(server, {
        transports: ['websocket'], //유니티와 함께 사용하기 때문에(?) websocket만 사용하기로 함 + 다른 기능을 하는 소켓들도 있나?
    });

    //io.on 클라이언트가 접속했을 때 호출되는 이벤트
    //접속 시 수행해야하는 클라이언트의 동작을 정의할 수 있음
    io.on('connection', function(socket) {
        console.log('Connection: ' + socket.id); //socket.id를 통해 유저를 구분함


        socket.on('disconnect', function(reason) { //socket.on('이미 접속 된'각 유저 별 이벤트) <> io.on(모든 유저 대상 이벤트) 
            //유저의 접속이 끊겼는가
            console.log('Disconnected: ' + socket.id);

        });
    });
};