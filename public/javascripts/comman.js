const commanEvents = function (){

    this.init = function(){
        _this.notificationBtnEvent();
        // _this.socketEvent();
    }

    // notification button click event
    this.notificationBtnEvent = function(){
        $("#notification-btn").on("click", function(){
            _this.fetchNotifications();
        })
    }

    // fetch all notifications of users
    this.fetchNotifications = function(){
        $(".list-group").load(`/notification .list-group-item`);
        // $.ajax({
        //     method:"get",
        //     url:"/notification",
        //     success: function(response){
        //         console.log(response);
        //         $("#notification-list").empty();
        //         for(let  notification of response.data){
        //             const element = `<div class="list-group-item">
        //             <div class="row align-items-center">
        //                 <div class="col-auto"><span class="status-dot status-dot-animated bg-red d-block"></span></div>
        //                 <div class="col text-truncate">
        //                 <a href="#" class="text-body d-block">${notification?.savedUserName?.firstName} ${notification?.savedUserName?.lastName}</a>
        //                 <div class="d-block text-muted text-truncate mt-n1">
        //                     Saved Your Post
        //                 </div>
        //                 </div>
        //                 <div class="col-auto">
        //                 <a href="#" class="list-group-item-actions">
        //                     <!-- Download SVG icon from http://tabler-icons.io/i/star -->
        //                     <svg xmlns="http://www.w3.org/2000/svg" class="icon text-muted" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" /></svg>
        //                 </a>
        //                 </div>
        //             </div>
        //             </div>`;
        //            $("#notification-list").append(element);
        //         }
        //     }
        // }); 
    }

    // socket Event (notification on save post)
    socket.on("notify", (message) =>{
        console.log(message);
        _this.fetchNotifications();
    })
    // this.socketEvent = function(){
    // }

    const _this = this;
    _this.init();
}
