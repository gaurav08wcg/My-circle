const archivedPostEvent = function () {
    const _this = this;

    _this.init = function () {
        _this.unarchiveButtonEvent();
        _this.paginationFun();
    }

    //  Query String -> Object cunverter function
    function queryToObj(queryString) {
        const pairs = queryString.substring(1).split('&');

        var array = pairs.map((el) => {
            const parts = el.split('=');
            return parts;
        });

        return Object.fromEntries(array);
    }

    // unarchive post event
    _this.unarchiveButtonEvent = function () {
        $(document).on("click", "#unarchive-post-btn", function () {
            const postId = $(this).attr("data-post-id");
            console.log("sdfsdf");
            $.ajax({
                method: "put",
                url : `/post/unarchive/${postId}`,
                success: function(response){
                    console.log(response);
                    toastr.success(response?.message, response?.type, { timeOut: 1000 });
                    $('.page-wrapper').load(`/archived-post .page-wrapper`)
                }
            })

            // const url = `/archived-post?postId=${postId}&archive=false`;
            // $('.page-wrapper').load(`${url} .page-wrapper`, function () {
            //     window.history.pushState(null, null, url)
            // });
            // toastr.success('Post unarchive', 'Success',{ timeOut: 1000 });     // unarchive message
        })
    }

    // pagination
    _this.paginationFun = function () {
        $(document).off("click", ".page-link").on("click", ".page-link", function () {
            const page = $(this).attr("data-page-no");
            console.log(page);
            let url = `/archived-post?page=${page}`;

            const queryObj = queryToObj(window.location.search);
            console.log("queryObj",queryObj);

            $(".page-wrapper").load(`${url} .page-wrapper`, function () {
                $(`#page-no-${page}`).addClass("active");   // selected page no set active
                window.history.pushState(null, null, url);
            });

            // $.ajax({
            //     method:"get",
            //     url:url,
            //     success: function(response){
            //         $(".page-wrapper").load(`${url} .page-wrapper`, function(){
            //             window.history.pushState(null, null, url);
            //         });
            //         $('#total-post').load(`${url} #total-post`);
            //     }
            // })
        })
    }
    _this.init();
}