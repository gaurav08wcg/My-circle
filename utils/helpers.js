var moment = require("moment");
const ObjectId = require("mongoose").Types.ObjectId;

const customHelper = {
  section: function (name, options) {
    if (!this._sections) this._sections = {};
    this._sections[name] = options.fn(this);
    return null;
  },
  log: function (data) {
    console.log(`handlebar logs  => `, data);
  },
  moment: function (input) {
    return moment(input).fromNow();
  },
  sumByNumber: function (number, sum) {
    return number + sum;
  },
  arrIndex: function (arr, index) {
    return arr[index];
  },
  sumOfArrElements: function(array, key){
    let total =0;
    for(let element of array){
      total += parseInt(element[key]);
    }
    return total;
  },
  stringSlicing : function(string){
    return string.slice(0,57) + "...";
  },
  stringLength : function(string){
    return string.length;
  },
  ObjectId: function(id){
    return new ObjectId(id);
  }
};

module.exports = customHelper;