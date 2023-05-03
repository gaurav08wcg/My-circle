const viewPostEvent = function () {
  this.init = function () {
    _this.commentAddBtn();
    _this.commentDeleteBtn();
    _this.countCharacter();
  };


  // count commented character length
  this.countCharacter = function () {
    $("#comment-field").on("input", function () {
      let Characters =  $("#characters").text($("#comment-field").val().split(" ").join("").length);
      $("#comment-label").load(`/post/view/${postId} #comment-label`, function(){
        $("#characters").text(Characters);
      });
    });
  };

  // comment add event
  this.commentAddBtn = function () {
    $("#add-comment-form").validate({
      rules: {
        commentText: {
          required: true,
          maxlength: 100,
        },
      },
      message: {
        commentText: {
          required: "Please enter some text",
          maxlength: "Max 100 Characters allowed",
        },
      },
      submitHandler: function () {
        const bodyData = {};
        const loadUrl = `/post/view/${postId}`;
        console.log("postId", postId);
        bodyData["commentText"] = $("#comment-field").val().trim();

        $.ajax({
          method: "post",
          url: `/post/add-comment/${postId}`,
          data: bodyData,
          success: function (response) {
            // success response
            if (response.type == "success") {
              toastr.success(response.message, { timeOut: 500 });
              $("#comment-field").val("");
              $("#characters").text("0")
              $("#comment-container").load(
                `${loadUrl} #comment-container`,
                function () {
                  window.history.pushState(null, null, loadUrl);
                }
              );
            }

            // error response
            if (response.type == "error") {
              toastr.error(response.message, { timeOut: 1000 });
            }
          },
        });
      },
    });
  };

  this.commentDeleteBtn = function () {
    $(document).on("click", "#comment-delete-btn", function () {
      // Sweet alert CONFIRM DELETE
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to cancel this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {

        //when click on confirm 
        if (result.isConfirmed) {
          const loadUrl = `/post/view/${postId}`;
          $.ajax({
            method: "post",
            url: `/post/delete-comment/${$(this).attr("data-comment-id")}`,
            success: function (response) {
              // success response
              if (response.type == "success") {
                toastr.success(response.message, { timeOut: 1000 });
                $("#comment-container").load(
                  `${loadUrl} #comment-container`,
                  function () {
                    window.history.pushState(null, null, loadUrl);
                  }
                );
              }

              // error response
              if (response.type == "error") {
                toastr.error(response.message, { timeOut: 1000 });
              }
            },
          });

          Swal.fire("Deleted!", "Comment has been deleted.", "success");
        }
      });
    });
  };

  const _this = this;
  _this.init();
};
