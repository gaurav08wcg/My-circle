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
    return moment(input).startOf('minute').fromNow();
  },
  sumByNumber: function (number, sum) {
    return number + sum;
  },
  arrIndex: function (arr, index) {
    return arr[index];
  }
};

module.exports = customHelper;