import { resolve } from 'path';

var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if(!port){
  console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
  process.exit(1)
}

//Session
let sessions = {}

var server = http.createServer(function(request, response){
  var parsedUrl = url.parse(request.url, true)
  var pathWithQuery = request.url 
  var queryString = ''
  if(pathWithQuery.indexOf('?') >= 0){ queryString = pathWithQuery.substring(pathWithQuery.indexOf('?')) }
  var path = parsedUrl.pathname
  var query = parsedUrl.query
  var method = request.method

  /******** 从这里开始看，上面不要看 ************/

  console.log('方方说：含查询字符串的路径\n' + pathWithQuery)

  if(path === '/'){
    let string = fs.readFileSync('./index.html', 'utf8')
    let cookies = '' 
    if(request.headers.cookie.split){
      cookies = request.headers.cookie.split(';')
    }
    let hash = {};
    for(let i=0; i<cookies.length; i++){
      let parts = cookies[i].split('=')
      let key = parts[0]
      let value = parts[1]
      hash[key] = value
    }
    //服务器通过 sessionId 去读取对应的 session ，得到用户的隐私信息。
    let mySession = sessions[hash.sessionId]
    let email;
    if(mySession){
      email = mySession.sign_in_email
    }
    let users = fs.readFileSync('./data/users', 'utf8')
    let foundUser;
    users = JSON.parse(users)
    for(let i=0; i<users.length; i++){
      if(users[i].email === email){
        foundUser = users[i]
        break;
      }
    }
    if(foundUser){
      string.replace('__password__', foundUser.password)
    }else{
      string.replace('__password__', '不知道')
    }

    response.statusCode = 200
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write(string)
    response.end()
  }else if(path === '/sign_up' && method === 'GET'){
    let string = fs.readFileSync('./sign_up.html', 'utf8')
    response.statusCode = 200
    response.setHeader('Content-Type','text/html;charset=utf-8' )
    response.write(string)
    response.end()
  }else if(path === '/sign_up' && method === 'POST'){
    readBody(request).then((body)=>{
      let strings = body.split('&')
      let hash = {}
      strings.forEach((string)=>{
        let parts = string.split('=')
        let key = parts[0]
        let value = parts[1]
        hash[key] = decodeURIComponent(value)
      })
      let {email, password, password_confirmation} = hash
      if(email.indexOf('@') === -1){
        response.statusCode = 400
        response.setHeader('Content-Type','applictaion/json;charset=utf-8' )
        response.write(`{
          "errors": {
            "email": "invalid"
          }
        }`)
      }else if(password !== password_confirmation){
        response.statusCode = 400
        response.write('password not match')
      }else{
        var users = fs.readFileSync('./data/users', 'utf8')
        try{
          users = JSON.parse(users)
        }catch(exception){
          users = []
        }
        let inUse;
        for(let i=0; i<users.length; i++){
          let users = users[i]
          if(user.email === email){
            inUse = true
            break;
          } 
        }
        if(inUse){
          response.statusCode = 400
          response.write('email in use')
        }else{
          users.push({email: email, password: password})
          var usersString = JSON.stringify(users) 
          fs.writeFileSync('./data/users', usersString)
          response.statusCode = 200
        }
      } 
      response.end()
    })
  }else if(path === '/sign_in' && method === 'GET'){
    let string = fs.readFileSync('./sign_in.html', 'utf8')
    response.statusCode = 200
    response.setHeader('Content-Type','text/html;charset=utf-8' )
    response.write(string)
    response.end()
  }else if(path === '/sign_in' && method === 'POST'){
    readBody(request).then((body)=>{
      let strings = body.split('&')
      let hash = {}
      strings.forEach((string)=>{
        let parts = string.split('=')
        let key = parts[0]
        let value = parts[1]
        hash[key] = decodeURIComponent(value) 
      })
      let {email, password, password_confirmation} = hash 
      var users = fs.readFileSync('./data/users', 'utf8')
        try{
          users = JSON.parse(users)
        }catch(exception){
          users = []
        }
        let found;
        for(let i=0; i<users.length; i++){
          if(users[i].email === email && users[i].password === password){
            found = true
            break;
          }
        }
        if(found){
          //Session
          let sessionId = Math.random() * 100000 
          sessions[sessionId] = {sign_in_email: email}
          //Set-Cookie
          response.setHeader('Set-Cookie',`sessionId = ${sessionId}`)
          response.statusCode = 200
        }else{
          response.statusCode = 401
        }
      response.end()
    })
  }else if(path === '/main.js'){
    let string = fs.readFileSync('./main.js', 'utf8')
    response.statusCode = 200
    response.setHeader('Content-Type','text/javascript;charset=utf-8' )
    response.write(string)
    response.end()
  }else if(path === '/xxx'){
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/json;charset=utf-8')
    response.setHeader('Access-Control-Allow-Origin', 'http://frank.com:8001')
    response.write(`
    {
      "note":{
        "to": "糖糖",
        "from": "照照",
        "heading": "哈喽",
        "content": "你好吗"
      }
    }
    `)
    response.end()
  }else{
    response.statusCode = 404
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write('呜呜呜')
    response.end()
  }

  /******** 代码结束，下面不要看 ************/
})

function readBody(request){
  return new Promise((resolve, reject)=>{
    let body = []
    request.on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(body).toString();
      resolve(body)
    })
  })
}

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)


