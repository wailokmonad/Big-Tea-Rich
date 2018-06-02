let app = require("./server")
let cluster = require('cluster');
let numCPUs = require('os').cpus().length;

// if(require.main === module){
//   app.init(function(){});
// }

if(cluster.isMaster){

  console.log(`Master ${process.pid} is running`);
  for(var i = 0; i < numCPUs; i++){
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });

}else{
  app.init();
  console.log(`Worker ${process.pid} started`);
  
}

app.middleExclude(["/"])

app.middleware(function(req, res, next){
    console.log("middleware 1....")
    req.count = 1
    console.log(req.count)
    next(req, res)
})

app.middleware(function(req, res, next){
  console.log("middleware 2....")
  req.count += 1
  console.log(req.count)
  next(req, res, true)
})

app.middleware(function(req, res, next){
  console.log("middleware 3....")
  req.count += 1
  console.log(req.count)
  next(req, res)
})





app.get("/", function(req ,res){

  res.render("index")
})

app.get("/index", function(req ,res){

  res.render("index", {"name":"Lok","age":28,"job":"programmer","address":"Hong Kong"})

})

app.post("/book", function(req ,res){

  res.end(JSON.stringify(req.form))
    
})

app.view("View")
app.static("static")

app.error(function(req, res){

  res.render("error")
})
