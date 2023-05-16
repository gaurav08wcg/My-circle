const listUsersEvent = function (){

    this.init = function (){
        _this.sortUser();
        _this.searchUser();
        _this.pagination();
        _this.resetButton();
        _this.exportCsvBtn();
    }

    //  Query String -> Object cunverter function
    function queryToObj(queryString) {
        const pairs = queryString.substring(1).split('&');

        var array = pairs.map((el) => {
            const parts = el.split('=');
            return parts;
        });

        return Object.fromEntries(array);
    }

    // filter & search event
    this.sortUser = function (){
        let sortOrder = -1;
        $(document).on("click","#btn-sort-datetime", function(){
            const query = window.location.search;
            
            sortOrder  == -1 ? sortOrder=1 : sortOrder=-1;
            let url = `/users?sortOrder=${sortOrder}`;

            // when searching user and after their sorting
            if(query.includes("search")){
                const queryObject = queryToObj(query);      // query string -> object
                url = `/users?sortOrder=${sortOrder}&search=${queryObject.search}`
            }

            $(".page-wrapper").load(`${url} div.page-wrapper`, function(){
                window.history.pushState(null, null, url);
            });
        })

    }

    // search event
    this.searchUser = function (){
        $(document).on("click","#search-user-btn", function(){
            
            // encodeURIComponent convert space -> %20 (for space full string )
            const search = encodeURIComponent($("#search-user").val());
            console.log("search", search);
            let url = `/users?search=${search}`;

            $('.page-wrapper').load(`${url} .page-wrapper`, function(){
                window.history.pushState(null, null, url);
            });
        });
    }

    // pagination event
    this.pagination = function(){
        $(document).off("click", ".page-link").on("click", ".page-link", function () {
            const page = $(this).attr("data-page-no");
            const query = window.location.search;   // get query string
            // console.log("query", query);
            // console.log("page", page);

            let url = `/users?page=${page}`;
            const queryObj = queryToObj(window.location.search);    // query -> obj

            // when select page with sort & search
            if (query.includes("sortBy") || query.includes('search')) {
                queryObj["page"] = page
                url = `/users?${$.param(queryObj)}`;    // obj -> query
            }
            console.log("url", url);

            $('.page-wrapper').load(`${url} .page-wrapper`, function () {
                _this.sortUser();
                $(`#page-no-${page}`).addClass("active");   // selected page no set active
                window.history.pushState(null, null, url);
            });
        })
    }

    // reset all filter & search btn 
    this.resetButton = function (){
    
        $(document).on("click", "#reset-btn", function(){
            const queryObj = queryToObj(window.location.search);
            let url = `/users`;
            // console.log("reset url",url);

            $("#user-list-page").load(`${url} #user-list-page`, function(){
                window.history.pushState(null,null,url);
            });
        })
    }
    
    // Export CSV btn event
    this.exportCsvBtn = function(){
        $(document).on("click", "#export-user-csv-btn", function(){
            const queryObject = queryToObj(window.location.search);
            let url = `/users/export-csv`;

            // when search & sort user
            if(queryObject){
                if(queryObject.search) url = `/users/export-csv?search=${queryObject?.search}`;
                if(queryObject.sortOrder) url = `/users/export-csv?sortOrder=${queryObject?.sortOrder}`
                if(queryObject.sortOrder && queryObject.search) url = `/users/export-csv?sortOrder=${queryObject?.sortOrder}&search=${queryObject?.search}`
            }

            // call export csv route
            $.ajax({
                method:"get",
                url: url,
                success: function(data) {
                    // download csv file
                    var blob=new Blob([data]);
                    var link=document.createElement('a');
                    link.href=window.URL.createObjectURL(blob);
                    link.download="My-Circle-Users.csv";
                    link.click();
                }
            });
        });
    }

    const _this = this;
    _this.init();
}