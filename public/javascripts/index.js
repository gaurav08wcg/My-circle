const listAllPostEvent = function () {
    

    this.init = function () {
        _this.editPostButton();
        _this.savedPostButton();
        _this.archivePostButton();
        _this.filterAndSearchPost();
        _this.sortPostByTitle();
        _this.sortPostByDateTime();
        _this.pagination();
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

            $.ajax({
                method: "post",
                url: `saved-post/${postId}`,
                success: function (response) {
                    console.log("response =>", response);
                    alert(response);
                },
                error: function (error) {
                    $(".page-body").html(error);
                }
            })
        })
    }

    // archive post event
    this.archivePostButton = function () {
        $(document).on("click", "#archive-post-btn", function (e) {
            e.preventDefault();
            const postId = $(this).attr("data-post-id");
            const url = `/?postId=${postId}&archive=true`;

            $.ajax({
                method: "get",
                url: url,
                success: function (response) {
                    $(".page-body").load(`${url} .page-body`);
                    window.history.pushState(null,null,url);
                },
                error: function (error) {

                }
            })
        });
    }

    // filer post event
    this.filterAndSearchPost = function () {
        $(document).off("click", "#search-post-btn").on("click", "#search-post-btn", function () {
            alert("search");
            // e.preventDefault();

            // filter select option value & search value
            const filter = encodeURIComponent($('#post-filter-drop-down :selected').val());
            const search = encodeURIComponent($("#search-post").val());
            const url = `/?filter=${filter}&search=${search}`;

            $(".page-body").load(`${url} .page-body`, function (){
                window.history.pushState(null,null,url);
            });  
            // $.ajax({
            //     url: url,
            //     method: "get",
            //     success: function (response) {
            //         // console.log(response);
            //         alert("search sucess")
            //         // method - 2 (Load Method)
            //         console.log(search);
            //         alert("after")
            //         window.history.pushState(null,null,url);
            //         alert("end")
            //     },
            //     error: function (response) {
            //     }
            // })
        })
    }

    // sort post by title
    this.sortPostByTitle = function () {
        
        let sortOrder = -1;
        $("#btn-sort-title").on("click", function () {

            console.log("query ", window.location.search);
            
            // toggle click logic
            sortOrder == -1 ? sortOrder =1 : sortOrder = -1;

            let url = `/?sortBy=title&order=${sortOrder}`;

                $.ajax({
                    url: url,
                    method: "get",
                    success: function (response) {
                        // console.log(response);
                        $(".page-body").load(`${url} .page-body`);
                        window.history.pushState(null, null, url)
                    }
                });
        
        });

    }

    // sort post by date time
    this.sortPostByDateTime = function () {
        
        let sortOrder = -1;
        $("#btn-sort-datetime").on("click", function () {

            console.log("query ", window.location.search);
            
            // toggle click logic
            sortOrder == -1 ? sortOrder =1 : sortOrder = -1;

            let url = `/?sortBy=dateTime&order=${sortOrder}`;

                $.ajax({
                    url: url,
                    method: "get",
                    success: function (response) {
                        // console.log(response);
                        $(".page-body").load(`${url} .page-body`);
                        window.history.pushState(null, null, url)
                    }
                });
        
        });
    }

    // pagination 
    this.pagination = function () {

        //  Query String -> Object
        function queryToObj(queryString) {
            const pairs = queryString.substring(1).split('&');
          
            var array = pairs.map((el) => {
              const parts = el.split('=');
              return parts;
            });
          
            return Object.fromEntries(array);
        }

        $(document).off("click", ".page-link").on("click", ".page-link", function () {
            // $(this).parent().addClass("acitve")
            const page = $(this).attr("data-page-no");
            const query = window.location.search;   // get query string
            // console.log("query", query);
            let url = `/?page=${page}`;
            const queryObj = queryToObj(window.location.search);    // query -> obj
            
            // when query in sort then carry it  
            if(query.includes("sortBy") || query.includes("filter") || query.includes('search')) {
                queryObj["page"] = page
                url = `/?${$.param(queryObj)}`;    // obj -> query
            }            
            console.log("url", url);
            
            $.ajax({
                method: 'get',
                url: url,
                success: function (response) {
                    $('.page-body').load(`${url} .page-body`,function(){
                        _this.sortPostByDateTime();
                    });
                    $("#total-post").load(`${url} #total-post`)
                    window.history.pushState(null,null,url);
                }
            })
        })
    }
    const _this = this;
    _this.init();
} 