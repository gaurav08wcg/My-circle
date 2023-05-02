const viewPostEvent = function (){

    this.init = function(){
        // _this.commentButton();
        _this.commentValidation();
    }

    // comment add btn event
    // this.commentButton = function(){
    //     $(document).on("click","#comment-btn", function(){
    //         // console.log("postId =>", $(this).attr("data-post-id")); 
    //         // console.log("commentBy =>", $(this).attr("data-user-id"));
    //         // console.log("comment text =>", $("#comment-field").val().trim());x
            
    //         const bodyData ={};
    //         const loadUrl = `/post/view/${$(this).attr("data-post-id")}`
    //         bodyData["postId"] = $(this).attr("data-post-id");
    //         bodyData["commentBy"] = $(this).attr("data-user-id");
    //         bodyData["commentText"] = $("#comment-field").val().trim();
    //         console.log(bodyData);

    //         $.ajax({
    //             method: "post",
    //             url:`/post/add-comment`,
    //             data: bodyData,
    //             success: function(response){
    //                 toastr.success(response.message, response.type, { timeOut: 500 });
    //                 $("#view-post").load(`${loadUrl} #view-post`, function(){
    //                     window.history.pushState(null,null,loadUrl);
    //                 })
    //             }
    //         })

    //     });
    // }

    // comment add event
    this.commentValidation = function(){
        $("#add-comment-form").validate({
            rules:{
                commentText:{
                    required: true,
                    maxlength: 100
                }
            },
            message:{
                commentText:{
                    required: "Please enter some text",
                    maxlength: "Max 100 Characters allowed"
                }
            },
            submitHandler: function(){
                const bodyData ={};
                const loadUrl = `/post/view/${postId}`
                console.log("postId", postId);
                bodyData["commentText"] = $("#comment-field").val().trim();

                $.ajax({
                    method: "post",
                    url:`/post/add-comment/${postId}`,
                    data: bodyData,
                    success: function(response){
                        toastr.success(response.message, { timeOut: 500 });
                        $("#comment-field").val('');
                        $("#comment-container").load(`${loadUrl} #comment-container`, function(){
                            window.history.pushState(null,null,loadUrl);
                        })
                    }
                })
            }
        })
    }

    const _this = this;
    _this.init();
}