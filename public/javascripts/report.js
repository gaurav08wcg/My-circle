const reportEvent = function () {
  this.init = function () {
    _this.searchUser();
  };

  // search user
  this.searchUser = function () {
    $(document).on("keyup", "#search-user-field", function () {
      const search = encodeURIComponent($(this).val().trim());
      const url = `/report?search=${search}`;
      $("div#user-table-card-body").load(`${url} div#user-table-card-body`, function () {
        window.history.pushState(null, null, url);
      });
    });
  };

  const _this = this;
  _this.init();
};
