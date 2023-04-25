const archivedPostEvent = function () {
    const _this = this;

    _this.init = function () {
        _this.unarchiveButtonEvent();
    }

    // unarchive post event
    _this.unarchiveButtonEvent = function () {
        $(document).on("click", "#unarchive-post-btn", function () {
            const postId = $(this).attr("data-post-id");
            const url = `/archived-post?postId=${postId}&archive=false`;
            $('.page-wrapper').load(`${url} .page-wrapper`, function () {
                window.history.pushState(null, null, url)
            });

            // $.ajax({
            //     method:"get",
            //     url:url,
            //     success: function(response){
            //         $('.page-body').load(`${url} .page-body`, function(){ window.history.pushState(null, null, url) });
            //         $('#total-post').load(`/archived-post?postId=${postId}&archive=false #total-post`)
            //     }
            // })
        })
    }

    _this.init();
}