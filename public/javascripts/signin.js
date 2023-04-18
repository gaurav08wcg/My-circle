const signIn = function(){  
    const _this=this;
    
    _this.init = function (){
        _this.validateForm();
    }

    // form validation
    _this.validateForm = function(){
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

    _this.init();
}