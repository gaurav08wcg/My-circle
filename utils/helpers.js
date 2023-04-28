var moment = require("moment");

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
    return moment(input).format('MMMM Do YYYY, h:mm:ss a');
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
  }
};

module.exports = customHelper;