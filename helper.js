let helper = {}

helper.Deserialize = function(pString){

      let str = pString
      let obj = {}

      str = str.split("&")

      for(let i of str){
        let pair = i.split("=")
        obj[pair[0]] = pair[1]

      }
      
      return obj
}


helper.Template = function(str){

  let pattern = /<%.*%>/gs
  let execStr = ""

  try{
    execStr = pattern.exec(str)[0]
  }catch(e){
    return str
  }
  

  let funcStr = execStr.replace(/<%|%>/g, "")
  let content = execStr.split(/<%.*?%>/g)
  let output = ""

  if(content.length > 2){
    content = content.slice(1, content.length -1)
  }else{
    return str
  }

  for(var i of content){

    funcStr = funcStr.replace(i, "output +='" + i.trim() + "'")
  }

  try{
    eval(funcStr)
  }catch(e){
    return str
  }  
  

  return str.replace(/<%.*%>/gs, output)

}


module.exports = helper
