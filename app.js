let app = require("./server")

app.init();

app.middleExclude(["/"])

app.middleware(function(req, res, next){
    console.log("middleware 1..........")
    req.lok = 1
    console.log(req.lok)
    next(req, res)
})

app.middleware(function(req, res, next){
  console.log("middleware 2....")
  req.lok += 1
  console.log(req.lok)
  
  next(req, res, true)
})

app.middleware(function(req, res, next){
  console.log("middleware 3....")
  req.lok += 1
  console.log(req.lok)
  next(req, res)
})





app.get("/", function(req ,res){

  res.render("index")
})

app.get("/index", function(req ,res){

  res.render("index", {"name":"Lok","age":28,"job":"programmer","address":"Hong Kong"})

})

app.post("/book", function(req ,res){

  res.end("******** post")
})

app.view("View")
app.static("static")

app.error(function(req, res){

  res.render("error")
})