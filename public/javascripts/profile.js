const profileEvent = function () {
  const _this = this;

  _this.init = function () {
    _this.validateEditProfileFrom();
  };

  // form validate
  _this.validateEditProfileFrom = function () {

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
            // remote:{
            //     url:"/email",
            //     method:"get"
            // }
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
          },
          profilePicture:"File must be JPEG or PNG, less than 5MB" 
        },
      });
    // $(document).on("click", "#edit-btn", function(e){
    //     e.preventDefault();
    //      console.log("click-edit")
        
    // })
  };

  _this.init();
};
