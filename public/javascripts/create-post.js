const createPostEvent = function (){
    const _this = this;
    _this.init = function(){
        _this.validateCreatePostForm();
    }

    // form validation
    _this.validateCreatePostForm = function(){

        // add filesize method
        $.validator.addMethod('filesize', function(value, element, param) {
            return this.optional(element) || (element.files[0].size <= param) 
        });

        // jQuery.validator.setDefaults({
        //     debug: true,
        //     success: "valid"
        // });

       $("#create-post-form").validate({
            rules:{
                title:{
                    required: true,
                    maxlength: 30
                },
                description:{
                    required: true,
                    maxlength: 300
                },
                postImage:{
                    required: true,
                    accept: "image/jpeg,image/png,image/gif",
                    filesize: 3097152
                }
            },
            messages:{
                title:{
                    required: "Title is required",
                    maxlength: "Max 30 Characters allowed"
                },
                description:{
                    required: "description is required",
                    maxlength: "Max 300 Characters allowed"
                },
                postImage:{
                    required: "Image is required",
                    accept: "allow only .jepg, .png, .gif format",
                    filesize: "Select image less then 2MB"
                }
            }     
       })
    }

    _this.init();
}