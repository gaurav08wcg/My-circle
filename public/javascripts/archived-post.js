const archivedPostEvent = function (){
    const _this = this;

    _this.init = function (){
        _this.unarchiveButtonEvent();
    }

    // unarchive post event
    _this.unarchiveButtonEvent = function(){
        $(document).on("click", "#unarchive-post-btn", function(){
            const postId = $(this).attr("data-post-id");

            $.ajax({
                method:"get",
                url:`/archived-post?postId=${postId}&archive=false`,
                success: function(response){
                    $('.page-body').load(`/archived-post?postId=${postId}&archive=false .page-body`)
                    $('#total-post').load(`/archived-post?postId=${postId}&archive=false #total-post`)
                }
            })
        })        
    }

    _this.init();
}