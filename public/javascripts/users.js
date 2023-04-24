const listUsersEvent = function (){
    const _this = this;

    _this.init = function (){
        _this.sortUser();
        _this.searchUser();
    }

    // filter & search event
    _this.sortUser = function (){
        let click = 1;
        $("#btn-sort-datetime").on("click", function(){
    
            // odd click
            if (click % 2 == 1) {
                // console.log("on");

                $.ajax({
                    url: `/users?sortOrder=1`,
                    method: "get",
                    success: function (responce) {
                        // console.log(responce);
                        $(".page-body").load(`/users?sortOrder=1 div.page-body`);
                    }
                });
            }

            // even click
            else {
                // console.log("off");

                $.ajax({
                    url: `/users?sortOrder=-1`,
                    method: "get",
                    success: function (responce) {
                        // console.log(responce);
                        $(".page-body").load(`/users?sortOrder=-1 div.page-body`);
                    }
                });
            };
            click += 1;
        })
    }

    // search event
    _this.searchUser = function (){
        $("#search-user-btn").on("click", function(){
            const search = $("#search-user").val();
            console.log(search);
            $.ajax({
                method:"get",
                url:`/users?search=${search}`,
                success: function(response){
                    $('.page-body').load(`/users?search=${search} .page-body`);
                    $("#total-users").load(`/users?search=${search} #total-users`)
                }
            })
        });
    }

    _this.init();
}