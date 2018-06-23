"use strict";

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

module.exports = helper
