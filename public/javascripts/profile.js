const profileEvent = function () {
    const _this = this;

    _this.init = function () {
        _this.clickEditBtn();
    }

    // edit profie btn
    _this.clickEditBtn = function () {
        $("#edit-profile-btn").on("click", function (e) {
            e.preventDefault();
            return console.log("click");
        });
    }

    _this.init();
}