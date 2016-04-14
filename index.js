const hoxy = require('hoxy');
const fs = require('fs');
const adapt = require('ugly-adapter');

var proxy = hoxy.createServer({
  certAuthority: {
    key: fs.readFileSync(`${__dirname}/xp.key`),
    cert: fs.readFileSync(`${__dirname}/xp.cert`)
  }
}).listen(8000);

proxy.intercept({
  phase: 'request'
},function*(req, resp) {
  var url = req.fullUrl();
  console.log(url)
  var socket = get_socket(url);
  if(socket){
    resp.string = yield adapt((event,data,callback)=>{
      var cb = data=>callback.call(this,void(0),data);
      return socket.emit.call(socket,event,data,cb);
    },'request',{
      method: req._data.method,
      url: url
    });
  }
});

var app = require('http').createServer();
var io = require('socket.io')(app);

var get_origin = url=>{
  var url_obj = require('url').parse(url);
  return url_obj.protocol+url_obj.host;
};

var get_socket = url=>{
  var origin = get_origin(url);
  var socket = Object.keys(io.sockets.sockets)
    .map((k)=>io.sockets.sockets[k])
    .filter(s=> {
      return s.origins.filter(o=>o==origin).length
    })[0];
  return socket;
};

io.on('connection', function (socket) {
  console.log(`Online XSSHost: ${get_origin(socket.handshake.headers.origin)}`);
  socket.origins = [get_origin(socket.handshake.headers.origin)]
});

app.listen(8001);