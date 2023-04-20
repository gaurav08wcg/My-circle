const listAllPostEvent = function() {
    const _this = this;

    _this.init = function (){
        _this.editPostButton();    
        _this.savedPostButton();
    }

    // edit post model open
    _this.editPostButton = function (){
        $(document).on("click", "#edit-post-btn", function (e){
            e.preventDefault();

            const postId = $(this).attr("data-post-id");
            
            $.ajax({
                method:"get",
                url:`/post/edit/${postId}`,
                success: function (response) {
                    
                    $(".modal .edit-post-modal").html(response);
                },
                error: function(error){
                    $("body").html(error);
                }
            })
        });
    }

    // post save event
    _this.savedPostButton = function (){
        $(document).on("click","#saved-post-btn", function(e){
            e.preventDefault();
            // console.log("click");

            const postId = $(this).attr("data-post-id");

            $.ajax({
                method:"post",
                url:`saved-post/${postId}`,
                success: function (response){
                    console.log("response =>", response);
                    if(!response){
                       return alert("This post is already saved.") 
                    }
                    alert("this post successfully saved...")
                },
                error: function(error){
                    $("body").html(error);
                }
            })
        })
    }
    _this.init();
} 