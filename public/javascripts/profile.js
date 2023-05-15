const profileEvent = function () {

  this.init = function () {
    _this.validateEditProfileFrom();
    _this.mailVerifyBtn();
  };

  // toastr options
  toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-top-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "4000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
  }

  // form validate
  this.validateEditProfileFrom = function () {

    // add filesize method
    $.validator.addMethod('filesize', function(value, element, param) {
        return this.optional(element) || (element.files[0].size <= param) 
    });

    $("#edit-profile-form").validate({
        rules: {
          firstName: "required",
          lastName: "required",
          email: {
            required: true,
            email: true,
            remote:{
              url:`/validate/email?userId=${$("#edit-btn").attr("data-user-id")}`,
              method:"get"
            }
          },
          profilePicture:{
            extension: "png|jpeg|jpg",
            filesize: 5242880,
          }
        },
        messages: {
          firstName: {
            required: "first name is required",
          },
          lastName: {
            required: "last name is required",
          },
          email: {
            required: "email is required",
            email: "enter valid email",
            remote: "email already existed"
          },
          profilePicture:"File must be JPEG or PNG, less than 5MB" 
        },
      });
    // $(document).on("click", "#edit-btn", function(e){
    //     e.preventDefault();
    //      console.log("click-edit")
        
    // })
  };

  // mail verification btn event
  this.mailVerifyBtn = function (){
    $(document).on("click", "#email-verification-btn", function(){
      $.ajax({
        method:"post",
        url: `users/${loggedInUserId}/email-verification/resend-link`,
        success: function(response){
          // success
          if(response.type =="success"){
            $("#remaining-attempt-total").load("/profile #remaining-attempt-total", function(){
              toastr.success(response.message);
            });
          }

          // warning
          if(response.type == "warning"){
            toastr.warning(response.message);
          }

          // error
          if(response.type == "error"){
            toastr.error(response.message);
          }
        }
      })
    })
  }

  const _this = this;
  _this.init();
};
