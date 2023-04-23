const listAllPostEvent = function () {
    const _this = this;

    _this.init = function () {
        _this.editPostButton();
        _this.savedPostButton();
        _this.archivePostButton();
        _this.filterPost();
        _this.sortPostByTitle();
        _this.sortPostByDateTime()
    }

    // edit post model open
    _this.editPostButton = function () {
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
    _this.savedPostButton = function () {
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
    _this.archivePostButton = function () {
        $(document).on("click", "#archive-post-btn", function (e) {
            e.preventDefault();
            const postId = $(this).attr("data-post-id");

            $.ajax({
                method: "post",
                url: `/post/archive/${postId}`,
            })
            window.location.href = $(location).attr('href');
        });
    }

    // filer post event
    _this.filterPost = function () {
        $(document).off("click", "#search-post-btn").on("click", "#search-post-btn", function () {
            // e.preventDefault();

            // filter select option value & search value
            const filter = $('#post-filter-drop-down :selected').val();
            const search = encodeURIComponent($("#search-post").val().trim());
            console.log(search);


            $.ajax({
                method: "get",
                url: `/?filter=${filter}&search=${search}`,
                success: function (response) {
                    // console.log(response);

                    // method - 2 (Load Method)
                    const url = `/?filter=${filter}&search=${search}`;
                    const element = `div.page-body`;
                    $(".page-body").load(`${url} ${element}`);  // posts
                    $("#total-post").load(`${url} div#total-post`);     // total post count

                },
                error: function (response) {
                }
            })
        })
    }

    // sort post by title
    _this.sortPostByTitle = function () {
        let click = 1;
        $("#btn-sort-title").on("click", function () {

            // odd click
            if (click % 2 == 1) {
                // console.log("on");

                $.ajax({
                    url: `/?sortBy=title&order=1`,
                    method: "get",
                    success: function (responce) {
                        // console.log(responce);
                        $(".page-body").load(`/?sortBy=title&order=1 div.page-body`);
                    }
                });
            }

            // even click
            else {
                // console.log("off");

                $.ajax({
                    url: `/?sortBy=title&order=-1`,
                    method: "get",
                    success: function (responce) {
                        // console.log(responce);
                        $(".page-body").load(`/?sortBy=title&order=-1 div.page-body`);
                    }
                });
            };
            click += 1;
        });

    }

    // sort post by date time
    _this.sortPostByDateTime = function () {
        let click = 1;
        $("#btn-sort-datetime").on("click", function () {

            // odd click
            if (click % 2 == 1) {
                // console.log("on");

                $.ajax({
                    url: `/?sortBy=dateTime&order=1`,
                    method: "get",
                    success: function (responce) {
                        // console.log(responce);
                        $(".page-body").load(`/?sortBy=dateTime&order=1 div.page-body`);
                    }
                });
            }

            // even click
            else {
                // console.log("off");

                $.ajax({
                    url: `/?sortBy=dateTime&order=-1`,
                    method: "get",
                    success: function (responce) {
                        // console.log(responce);
                        $(".page-body").load(`/?sortBy=dateTime&order=-1 div.page-body`);
                    }
                });
            };
            click += 1;
        });

    }

    _this.init();
} 