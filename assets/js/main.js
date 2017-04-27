var lastdate = "";
var host = "http://192.168.178.113:8080";

function addImage(time, id, width) {
    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    var date = new Date(time);

    var day = date.getDay() + 1;

    var suffix = "th";
    if (day.toString().slice(-1) === "1") {
        suffix = "st"
    }
    if (day.toString().slice(-1) === "2") {
        suffix = "nd"
    }
    if (day.toString().slice(-1) === "3") {
        suffix = "rd"
    }

    var displayDate = day + suffix + " " + monthNames[date.getMonth()];
    if (displayDate !== lastdate) {
        //$('.container').append("<div class='date'>" + displayDate + "</div>");
        lastdate = displayDate;
    }
    $('.container').append("<a class='img' target='_blank' href='single.php?photo=" + id + "' style='width:" + width + "%'><img src='getImage.php?photo=" + id + "'/></a>");
}

var loading = false;

var searchType = "";
var search = "";

var imageCollecton = [];
var totalWidth = 0;

function getPage(page) {
    loading = true;
    console.log(search);
    if (search) {
        $.ajax({
            method: "GET",
            url: host + "/photos/"+searchType+"/"+search+"/"+page
        })
            .done(function (data) {
                loading = false;
                data.forEach(function (v, i) {
                    imageCollecton.push(v);
                    totalWidth += v.width / v.height;
                    console.log(v.width / v.height);
                    if (totalWidth > $(document).width() / 300) {
                        imageCollecton.forEach(function (m, i) {
                            addImage(m.time, m.id, ((m.width / m.height) / totalWidth) * 100);
                        });
                        totalWidth = 0;
                        imageCollecton = [];
                    }
                    //addImage(v.time, v.id);
                });
                if (data.length < 50) {
                    imageCollecton.forEach(function (m, i) {
                        addImage(m.time, m.id, ((m.width / m.height) / totalWidth) * 100);
                    });
                }
            });
    } else {
        $.ajax({
            method: "GET",
            url: host + "/photos/" + page
        })
            .done(function (data) {
                loading = false;
                var imageCollecton = [];
                var totalWidth = 0;
                data.forEach(function (v, i) {
                    imageCollecton.push(v);
                    totalWidth += v.width / v.height;
                    console.log(v.width / v.height);
                    if (totalWidth > $(document).width() / 300) {
                        imageCollecton.forEach(function (m, i) {
                            addImage(m.time, m.id, ((m.width / m.height) / totalWidth) * 100);
                        });
                        totalWidth = 0;
                        imageCollecton = [];
                    }
                    //addImage(v.time, v.id);
                });
                if (data.length < 50) {
                    imageCollecton.forEach(function (m, i) {
                        addImage(m.time, m.id, ((m.width / m.height) / totalWidth) * 100);
                    });
                }
            });
    }
}

var pageCount = 0;

getPage(pageCount);

$(window).scroll(function () {
    if (!loading) {
        if ($(document).scrollTop() > $(document).height() - $(window).height() - 400) {
            pageCount++;
            getPage(pageCount);
        }
    }
});


// Search

$('#search').on('input', function (e) {
    totalWidth = 0;
    imageCollecton = [];
    if ($('#search').val() === "") {
        $('.suggestions').html("");
    } else {
        $.ajax({
            method: "GET",
            url: host + "/search/geo/" + $('#search').val()
        })
            .done(function (data) {
                $('.suggestions').html("");
                searchType = 'geo';
                search = $('#search').val();

                $('.container').html("");

                pageCount = 0;
                getPage(pageCount);
                data.forEach(function (v, i) {
                    $('.suggestions').append('<div class="suggestion place" data-searchType="geo" data-search="' + v['name'] + '"><img src="getImage.php?photo=' + v['photo_id'] + '" alt=""><span>' + v['name'] + ', ' + v['adminName'] + ', ' + v['countryName'] + '</span></div>')
                });
                $('.suggestion').click(function(e) {
                    e.preventDefault();
                    console.log(this.dataset);

                    searchType = this.dataset.searchtype;
                    search = this.dataset.search;

                    $('.suggestions').html("");
                    $('.container').html("");

                    pageCount = 0;
                    getPage(pageCount);
                })
            });
    }
});

$('#search').on('focusout', function (e) {
    $('.suggestions').html("");
});