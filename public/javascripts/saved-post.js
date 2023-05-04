
const savedPostEvent = function () {
    const _this = this;

    _this.init = function () {
        // un-save post event (when Post in landing page) 
        // _this.unSavedEventHandler = new listAllPostEvent();

        // un-save post (when post in saved-post page)
        _this.unSavePostButton();
        _this.paginationFun();
    }

    _this.unSavePostButton = function () {
        $(document).on("click", "#unsave-post-btn", function () {
            const postId = $(this).attr("data-post-id");
            const url = `/saved-post?postId=${postId}&unSave=true`;
            $(".page-wrapper").load(`${url} .page-wrapper`);
            toastr.success('Post unsaved', 'Success', { timeOut: 1000 });

            // $.ajax({
            //     method: "get",
            //     url: `/saved-post?postId=${postId}&unSave=true`,
            //     success: function (response) {
            //         $(".page-body").load(`/saved-post?postId=${postId}&unSave=true .page-body`);
            //         $("#total-post").load(`/saved-post?postId=${postId}&unSave=true #total-post`)
            //     }
            // })
        })
    }

    _this.paginationFun = function () {
        $(document).off("click", ".page-link").on("click", ".page-link", function () {
            const page = $(this).attr("data-page-no");
            console.log(page);
            const url = `/saved-post?page=${page}`;

            $(".page-wrapper").load(`${url} .page-wrapper`, function () {
                $(`#page-no-${page}`).addClass("active");   // selected page no set active
                window.history.pushState(null, null, url);
            });
        })
    }

    _this.init();
}