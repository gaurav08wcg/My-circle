const listUsersEvent = function (){
    const _this = this;

    _this.init = function (){
        _this.sortUser();
        _this.searchUser();
        _this.pagination();
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
    _this.sortUser = function (){
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
    _this.searchUser = function (){
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
    _this.pagination = function(){
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

    _this.init();
}