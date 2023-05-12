const reportEvent = function () {
  this.init = function () {
    _this.searchUser();
  };

  // for delay search
  const debounce = (func, delay) => {
    let debounceTimer;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
  };

  // search user
  this.searchUser = function () {
    $(document).on(
      "keyup",
      "#search-user-field",
      debounce(function () {
        const search = encodeURIComponent($(this).val().trim());
        const url = `/report?search=${search}`;
        $("div#user-table-card-body").load(
          `${url} div#user-table-card-body`,
          function () {
            $("#all-statistic").load(`${url} #all-statistic`);
            window.history.pushState(null, null, url);
          }
        );
      }, 500)
    );
  };

  const _this = this;
  _this.init();
};
