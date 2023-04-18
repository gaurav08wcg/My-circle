const signupEvent = function () {
  const _this = this;

  _this.init = function () {
    _this.validateForm();
    // _this.formSubmitEvent();
  };

  /* ========== form validation ========== */
  _this.validateForm = function () {

    // password regex
    $.validator.addMethod("pwcheck", function (value, element) {
        return /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/.test(value);
    });

    $("#signup-form").validate({
      //   validation rules
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
        password: {
          required: true,
          pwcheck: true,
        },
        confirm_password: {
          required: true,
          equalTo: "#password",
        },
      },
      //   validation message
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
        password: {
          required: "password is required",
          pwcheck: "enter valid password",
        },
        confirm_password: {
          required: "confirm password is required",
          equalTo: "this password not match to above password",
        },
      },
    });
  };

  /* ========== after form submit ========== */
  // _this.formSubmitEvent = function (){
  //   console.log()
  //     $("#signup-form").submit( function(e){
  //       return alert("sign up successfully")
  //       e.preventDefault();
  //     })
  // }

  _this.init();
};
