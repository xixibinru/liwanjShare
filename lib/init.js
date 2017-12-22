document.addEventListener('DOMContentLoaded', function () {
    var html = document.documentElement || window || document.body;
    var windowWidth = html.clientWidth;
    windowWidth = windowWidth > 750 ? 750 : windowWidth;
    html.style.fontSize = windowWidth / 7.5 + 'px';
}, false);