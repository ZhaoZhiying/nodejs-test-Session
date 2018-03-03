window.jQuery = function(nodeOrSelector){
    let nodes = {}
    nodes.addClass = function(){}
    nodes.html = function(){}
    return nodes
}

window.$ = window.jQuery

// ES6 析构赋值
window.jQuery.ajax = function({url, method, body, headers}){
    // Promise
    return new Promise(function(resolve, reject){
        let request = new XMLHttpRequest()
        request.open(method, url) // 配置 request
        for(let key in headers){
            let value = headers[key]
            request.setRequestHeader(key, value)
        }
        request.onreadystatechange = ()=>{ 
            if(request.readyState === 4){     
                if(request.status >= 200 && request.status < 300){
                    resolve.call(undefined, request.responseText) // call 给使用方叫 callback （回调）
                }else if(request.status >= 400){
                    reject.call(undefined, request)
                }
            }
        }
        request.send(body) 
    })
}

// 使用方代码
myButton.addEventListener('click', (e)=>{
    window.jQuery.ajax({
        url: '/xxx', 
        method: 'post', 
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'frank': '18'
        }
    }).then(
        (text)=>{console.log(text)},
        (request)=>{console.log(request)}
    )
})