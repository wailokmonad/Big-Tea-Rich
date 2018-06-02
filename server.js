let http = require("http")
let url = require('url');
let fs = require('fs');
let EventEmitter = require('events');
let helper = require('./helper').default;
let StringDecoder = require('string_decoder').StringDecoder;
let decoder = new StringDecoder('utf-8');
let server = {}
let route = {}
let ViewPath
let StaticPath
let MiddleWare = 0
let MiddleWareCount = 0
let middleExclude = []

class MyEmitter extends EventEmitter {}
let e = new MyEmitter();

server.init = function(){

        http.createServer(function(req, res){
            ServerFunc(req,res)
        })
        .listen(3000,function(){
            console.log("Listening.....");
        });
}

let ServerFunc = function(req, res){

    let path;
    req.method = req.method.toLowerCase()

    if(req.url.indexOf(StaticPath) > -1){

        let filename = req.url.replace("/" + StaticPath + "/", "")
        let content_type = ""

        if(filename.indexOf(".jpg") > -1){
            content_type = 'image/jpeg'
        }else if(filename.indexOf(".png") > -1){
            content_type = 'image/png'
        }else if(filename.indexOf(".css") > -1){
            content_type = 'text/css'
        }else if(filename.indexOf(".txt") > -1){
            content_type = 'text/plain'
        }

        if(!content_type){
            res.end()
            return
        }

        fs.readFile(StaticPath + "/" + filename, function(err, content){
            res.setHeader('Content-Type', content_type);
            res.end(content)
        })

        return

    }

    if(req.url == "/" && req.method == "get"){

        path = "/"

    }else if(route.hasOwnProperty(req.url)){

        if(route[req.url] == req.method){

            path = req.url

        }else{

            path = "error"
        }

    }else{

        path = "error"
    }

    res.render = function(html, data){

        fs.readFile(ViewPath + "/" + html + ".html", 'utf8', function(err, content){

            if(err){
                res.end()
            }else{

                let _content = content

                if(data && typeof data == "object" && Object.keys(data).length > 0){
                    for(let key in data){
                        _content = _content.replace("{{" + key + "}}", data[key])
            
                    }
                }

                res.setHeader('Content-Type', 'text/html');
                res.writeHead(200);
                res.end(_content)

            }

        })
    }

    let parsedUrl = url.parse(req.url, true);
    let buffer = '';

    req.query = parsedUrl.query;

    req.on('data', function(data) {
        buffer += decoder.write(data);
    });

    req.on('end', function() {
        buffer += decoder.end();

        try{
            req.form = JSON.parse(buffer)
        }catch(e){
            try{
                req.form = helper.Deserialize(buffer)
            }catch(e){
                req.form = {}
            }

        }

        if(MiddleWare > 0 && path != "error" && middleExclude.indexOf(path) == -1){

            MiddleWareCount += 1
            try{
                e.emit("MiddleWare_1", req, res, Next)
            }catch(e){
                res.end()
            }
            
            return
        }
        

        try{
            e.emit(path, req, res)
        }catch(e){
            res.end()
        }

    });

}


server.get = function(path, callback){

    if(path.trim() == "/"){
        route["/"] = "get"
    }else{
        route[path] = "get"
    }

    e.on(path, function(req, res){
        callback(req, res)
    })
}

server.post = function(path, callback){

    route[path] = "post"

    e.on(path, function(req, res){
        callback(req, res)
    })
}

server.middleExclude = function(arr){
    middleExclude = arr
}


server.middleware = function(callback){

    MiddleWare += 1

    e.on("MiddleWare_" + MiddleWare, function(req, res, next){
        callback(req, res, next)
    })
}

server.view = function(folder){
    ViewPath = folder
}

server.static = function(folder){
    StaticPath = folder
}

server.error = function(callback){

    e.on("error", function(req, res){
        callback(req, res)
    })

}


let Next = function(req, res, stop){

    if(MiddleWareCount < MiddleWare && !stop){
        MiddleWareCount += 1
        e.emit("MiddleWare_" + MiddleWareCount, req, res, Next)
    }else{
        MiddleWareCount = 0
        e.emit(req.url, req, res)
    }
}

module.exports = server
