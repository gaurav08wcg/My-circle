const signIn = function(){  
    
    this.init = function (){
        _this.validateForm();
        _this.flashMessage()
    }

    // show flash message (sign up successfully)
    this.flashMessage = function (){
        setTimeout(() => { 
            $(".flash-msg").empty()
        },4000)
    }

    // form validation
    this.validateForm = function(){
        $("#sign-in-form").validate({
            rules:{
                email:{
                    required: true,
                    email: true,
                },
                password:{
                    required:true,
                }
            },
            messages:{
                email:{
                    required: "email is required",
                    email: "enter valid email",
                },
                password:{
                    required:"password is required",
                }
            }
        })
    }
    const _this=this;
    _this.init();
}