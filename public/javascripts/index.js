const listAllPostEvent = function () {
    const _this = this;

    _this.init = function () {
        _this.editPostButton();
        _this.savedPostButton();
        _this.archivePostButton();
        _this.filterPost()
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
                    
                    // change tooltip title
                    // $(this).attr("data-bs-original-title", response);
                    
                    alert(response);

                    // after save refresh current page
                    // window.location.href = $(location).attr('href');
                },
                error: function (error) {
                    $("body").html(error);
                }
            })
        })
    }

    // archive post event
    _this.archivePostButton = function(){
        $(document).on("click","#archive-post-btn", function(e){
            e.preventDefault();
            const postId = $(this).attr("data-post-id");

            $.ajax({
                method:"post",
                url:`/post/archive/${postId}`,
            })
            window.location.href = $(location).attr('href');
        });
    }

    // filer post event
    _this.filterPost = function(){
        $(document).off("click","#search-post-btn").on("click","#search-post-btn", function(){
            // e.preventDefault();
            
            // filter select option value & search value
            const filter = $('#post-filter-drop-down :selected').val();
            const search = $("#search-post").val();

            $.ajax({
                method:"get",
                url:`/?filter=${filter}&search=${search}`,
                success: function(response){
                    console.log(response);

                    // method 1 - for Ajax response load
                    // const element  = $(response).find(".page-body")
                    // $(".page-body").html(element);
                    
                    // method - 2
                    const url = `/?filter=${filter}&search=${search}`;
                    const element = `div.page-body`;
                    $(".page-body").load(`${url} ${element}`);

                },
                error: function(response){
                }
            })
        })
    }

    _this.init();
} 