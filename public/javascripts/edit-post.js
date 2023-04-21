const editPostEvent = function (){ 
        
    this.init = function(){
        console.log("hello");
        _this.editPostValidate();    
    } 

        //  edit post validation 
    this.editPostValidate = function (){
        // add filesize method
        $.validator.addMethod('filesize', function(value, element, param) {
            return this.optional(element) || (element.files[0].size <= param) 
        });
        
        $("#edit-post-form").validate({
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
                    // required: true,
                    // accept: "image/jpeg,image/png,image/gif",
                    filesize: 2097152
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
                    // required: "Image is required",
                    // accept: "allow only .jepg, .png, .gif format",
                    filesize: "Select image less then 2MB"
                }
            } 
                
        });
        
    }
    const _this = this;
    _this.init();
}