
const savedPostEvent = function () {
    const _this = this;

    _this.init = function () {
        // un-save post event (when Post in landing page) 
        _this.unSavedEventHandler = new listAllPostEvent();

        // un-save post (when post in saved-post page)
        _this.unSavePostButton();
    }

    _this.unSavePostButton = function(){
        $(document).on("click", "#unsave-post-btn", function(){
            const postId = $(this).attr("data-post-id");
            
            $.ajax({
                method:"get",
                url:`/saved-post?postId=${postId}&unSave=true`,
                success: function (response){
                    $(".page-body").load(`/saved-post?postId=${postId}&unSave=true .page-body`);
                    $("#total-post").load(`/saved-post?postId=${postId}&unSave=true #total-post`)
                }
            })
        })
    }

    _this.init();
}