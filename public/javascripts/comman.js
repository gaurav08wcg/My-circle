const commanEvents = function (){

    this.init = function(){
        _this.notificationBtnEvent();
        _this.notificationIconLoadEvent();
        _this.notificationSeenBtnEvent();
    }

    // notification button click event
    this.notificationBtnEvent = function(){
        $(document).on("click","#notification-btn", function(){
            _this.fetchNotifications();
        })
    }

    // fetch all notifications of users
    this.fetchNotifications = function(){ 
        $(".list-group").load(`/notification .list-group-item`);
    }

    // notification icon load event
    this.notificationIconLoadEvent = function (){
        $("#load-notification-icon").load(`/notification/count #notification-btn`);
    }

    // notification seen btn event
    this.notificationSeenBtnEvent = function(){
        $(document).on("click", "#notification-seen-btn", function(e){
            console.log($(this).closest("#notification-btn > #notification-drop-down"));
            let notificationCount = $("#notification-count").text();
            
            $.ajax({
                method:"put",
                url:`/notification/${$(this).data("notification-id")}/seen`,
                success: function(response){
                    if(response.type == "success"){
                        // Decrease the notification count
                        notificationCount = Number(notificationCount) - 1;
                        $("#notification-count").text(notificationCount);
                        
                        // remove notification block
                        $(`.${$(this).data("notification-id")}`).remove();
                        $(document).find("#notification-drop-down").addClass("show").attr("data-bs-popper","static");
                    }
                }
            })
        })
    }

    // socket Event (show notification to post owner when save their post by other)
    socket.on("notify", (message) =>{
        _this.fetchNotifications();
        _this.notificationIconLoadEvent()
        toastr.success(message, { timeOut: 1000 });
    })
    

    const _this = this;
    _this.init();
}
