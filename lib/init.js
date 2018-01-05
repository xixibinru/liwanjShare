document.addEventListener('DOMContentLoaded', function () {
    var html = document.documentElement || window || document.body;
    var windowWidth = html.clientWidth;
    windowWidth = windowWidth > 750 ? 750 : windowWidth;
    html.style.fontSize = windowWidth / 7.5 + 'px';

    //返回按钮
    if(!document.querySelector('.goBack')) return;
    var goback = document.querySelector('.goBack');
    goback.addEventListener('click', function (event) {
        console.log(1);
        event.preventDefault();
        if(event.preventDefault){

        }else {
            event.returnValue = false;
        }
        window.history.go(-1);
    },false);
}, false);