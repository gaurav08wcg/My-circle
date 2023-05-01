const listAllPostEvent = function () {


    this.init = function () {
        _this.editPostButton();
        _this.savedPostButton();
        _this.archivePostButton();
        _this.filterAndSearchPost();
        _this.sortPostByTitle();
        _this.sortPostByDateTime();
        _this.pagination();
        _this.resetButton();
    }

    //  Query String -> Object converter function
    function queryToObj(queryString) {
        const pairs = queryString.substring(1).split('&');

        var array = pairs.map((el) => {
            const parts = el.split('=');
            return parts;
        });

        return Object.fromEntries(array);
    }

    // edit post model open
    this.editPostButton = function () {
        $(document).on("click", "#edit-post-btn", function (e) {
            e.preventDefault();

            const postId = $(this).attr("data-post-id");

            $.ajax({
                method: "get",
                url: `/post/edit/${postId}`,
                success: function (response) {

                    $(".modal .edit-post-modal").html(response);
                },
                error: function (error) {
                    $("body").html(error);
                }
            })
        });
    }

    // post save event
    this.savedPostButton = function () {
        $(document).on("click", "#saved-post-btn", function (e) {
            e.preventDefault();
            // console.log("click");

            const postId = $(this).attr("data-post-id");
            const postBy = $(this).attr("data-postBy-id");
            $.ajax({
                method: "post",
                url: `saved-post/${postId}?postBy=${postBy}`,
                success: function (response) {
                    console.log("response =>", response);
                    toastr.success(response, "Success", { timeOut: 1000 });
                    // alert(response);
                },
                error: function (error) {
                    $(".page-body").html(error);
                }
            })
        })
    }

    // archive post event
    this.archivePostButton = function () {
        
        $(document).off("click", "#archive-post-btn").on("click", "#archive-post-btn", function (e) {
            e.preventDefault();

            const postId = $(this).attr("data-post-id");

            $.ajax({
                method: "put",
                url: `/post/archive/${postId}`,
                success: function(response){
                    console.log(response);
                    toastr.success(response?.message, response?.type, { timeOut: 1000 });
                    $(".page-wrapper").load("/ .ajax-res");
                }
            });

            /* code working but without using put route of post  */ 
            // const url = `/?postId=${postId}&archive=true`;
            // $(".page-body").load(`${url} .page-body`, function () {
            //     window.history.pushState(null, null, url);
            // });
            // toastr.success('Post Archived','Success', { timeOut: 1000 })
        });
    }

    // filer post event
    this.filterAndSearchPost = function () {
        $(document).off("click", "#search-post-btn").on("click", "#search-post-btn", function () {
            // e.preventDefault();

            // filter select option value & search value
            const filter = encodeURIComponent($('#post-filter-drop-down :selected').val());
            const search = encodeURIComponent($("#search-post").val());
            const url = `/?filter=${filter}&search=${search}`;

            $(".page-body").load(`${url} .page-body`, function () {
                window.history.pushState(null, null, url);
            });
        })
    }

    // sort post by title
    this.sortPostByTitle = function () {

        let sortOrder = -1;
        $("#btn-sort-title").on("click", function () {

            const query = window.location.search;
            console.log("query ", window.location.search);

            // toggle click logic
            sortOrder == -1 ? sortOrder = 1 : sortOrder = -1;
            let url = `/?sortBy=title&order=${sortOrder}`;

            // when sort with filter & search
            if (query.includes("search")) {
                const queryObject = queryToObj(query);
                // console.log("queryObject", queryObject);

                url = `/?sortBy=title&order=${sortOrder}&search=${queryObject.search}&filter=${queryObject.filter}`;
            }


            $(".page-body").load(`${url} .page-body`, function () {
                window.history.pushState(null, null, url);
            });
            // $.ajax({
            //     url: url,
            //     method: "get",
            //     success: function (response) {
            //         // console.log(response);
            //         $(".page-body").load(`${url} .page-body`, function(){
            //             window.history.pushState(null, null, url);
            //         });
            //     }
            // });

        });

    }

    // sort post by date time
    this.sortPostByDateTime = function () {

        let sortOrder = -1;
        $("#btn-sort-datetime").on("click", function () {

            const query = window.location.search;
            console.log("query ", window.location.search);

            // toggle click logic
            sortOrder == -1 ? sortOrder = 1 : sortOrder = -1;

            let url = `/?sortBy=dateTime&order=${sortOrder}`;

            // when sort with filter & search
            if (query.includes("search")) {
                const queryObject = queryToObj(query);
                // console.log("queryObject", queryObject);

                url = `/?sortBy=dateTime&order=${sortOrder}&search=${queryObject.search}&filter=${queryObject.filter}`;
            }

            $(".page-body").load(`${url} .page-body`, function () {
                window.history.pushState(null, null, url);
            });

            // $.ajax({
            //     url: url,
            //     method: "get",
            //     success: function (response) {
            //         // console.log(response);
            //     }
            // });

        });
    }

    // pagination 
    this.pagination = function () {

        $(document).off("click", ".page-link").on("click", ".page-link", function () {
            const page = $(this).attr("data-page-no");
            const query = window.location.search;   // get query string
            // console.log("query", query);
            let url = `/?page=${page}`;
            const queryObj = queryToObj(window.location.search);    // query -> obj

            // when query in sort then carry it  
            if (query.includes("sortBy") || query.includes("filter") || query.includes('search')) {
                queryObj["page"] = page
                url = `/?${$.param(queryObj)}`;    // obj -> query
            }
            console.log("url", url);

            $('.page-body').load(`${url} .page-body`, function () {
                _this.sortPostByDateTime();
                _this.sortPostByTitle();                
                $(`#page-no-${page}`).addClass("active");   // selected page no set active
                window.history.pushState(null, null, url);
            });
            // $("#total-post").load(`${url} #total-post`);
        })
    }

    // reset all filter & search btn 
    this.resetButton = function (){
        
        $(document).on("click", "#reset-btn", function(){
            const queryObj = queryToObj(window.location.search);
            let url = `/`;
            // console.log("reset url",url);

            $("#timeline-page-content").load(`${url} #timeline-page-content`, function(){
                window.history.pushState(null,null,url);
            });
        })
    }

    const _this = this;
    _this.init();
} 