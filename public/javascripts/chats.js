const chatsEvent = function () {

    this.init = function () {
        _this.chatBtnEvent();
        _this.msgSendBtnEvent();
    }

    // chat btn event
    this.chatBtnEvent = function () {
        $(document).on("click", "#chat-btn", function () {
            const oppositeUserId = $(this).data("chat-user-id");
            $("#chat-page-body").load(`/chats/${oppositeUserId} #chat-page-body`, function () {
                window.history.pushState(null, null, `/chats/${oppositeUserId}`);
            });
        })
    }

    // send chat message btn
    this.msgSendBtnEvent = function () {
        $(document).on("click", "#msg-send-btn", function () {

            // when message length is zero return error message
            if ($("#message-send-field").val().length == 0) {
                return toastr.error("please enter message");
            }
            const userId = $(this).data("opposite-user-id");
            console.log(userId, "userId");

            $.ajax({
                method: "post",
                url: `${userId}/send-message`,
                data: {
                    chatMessage: $("#message-send-field").val().trim()
                },
                success: function (response) {
                    // success
                    if (response.type == "success") {
                        toastr.success(response.message);
                        $("#chat-msg-list").load(`/chats/${userId} #chat-msg-list`, function () {
                            $("#message-send-field").val("");
                        })
                    }

                    // error
                    if (response.type == "error") {
                        toastr.error(response.message);
                    }
                }
            })

        });
    }

    const _this = this;
    _this.init();
}