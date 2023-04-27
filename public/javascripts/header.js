
const headerEvent = function (){

    this.init = function(){
        _this.navigate()
    }

    // click on nav menu
    this.navigate = function(){
        // $(document).on("click",".nav-item", function(e){
        //     e.preventDefault();
        //     $(".nav-item").removeClass("active");
        //     $(this).addClass("active")
        //     // const url = `${$(this).children("a").attr("href")}`;
        //     // if(url.includes("/")) $(".page-wrapper").load(`${url} .page-wrapper`);
        // });
    }

    const _this = this;
    _this.init();
}