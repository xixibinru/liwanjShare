function My() {}
var fn = My.prototype = {
    getStyle: function (obj,attr) {
        if(obj.currentStyle){
            return obj.currentStyle[attr];
        }else {
            return window.getComputedStyle(obj,null)[attr];
        }
    },
    animate: function (obj,json,fn) {
        var self = this;
        clearInterval(obj.timer);
        obj.timer = setInterval(function(){
            var flag = true;
            for(var attr in json){
                var current = 0 , step = 0 ;
                if(attr == "opacity"){
                    current = parseFloat(self.getStyle(obj,attr))*100;
                    step = (json[attr]*100 - current) / 10;
                }else{
                    current = parseFloat(self.getStyle(obj,attr));
                    step = (json[attr] - current)/10;
                }
                step = step > 0 ? Math.ceil(step) : Math.floor(step);
                if(attr == "opacity"){
                    if("opacity" in obj.style){
                        current = current / 100;
                        obj.style.opacity = current + step / 100;
                    }else{
                        obj.style.filter = "alpha(opacity = " + (current + step) + ")";
                    }
                }else if(attr == "zIndex"){
                    obj.style[attr] = json[attr];
                }else{
                    obj.style[attr] = current + step + "px";
                }
                if(json[attr] != current){
                    flag = false;
                }
            }
            if(flag){
                clearInterval(obj.timer);
                if(fn) {fn()};
            }
        },30);
    },
    ajax: function (opt) {
        var self = this;
        opt = opt || {};
        opt.method = opt.method.toUpperCase() || 'POST';
        opt.url = opt.url || '';
        opt.async = opt.async || true;
        opt.data = opt.data || null;
        opt.success = opt.success || function () {
            };
        var xmlHttp = null;
        if (XMLHttpRequest) {
            xmlHttp = new XMLHttpRequest();
        }
        else {
            xmlHttp = new ActiveXObject('Microsoft.XMLHTTP');
        }
        var params = [];
        for (var key in opt.data) {
            params.push(key + '=' + opt.data[key]);
        }
        var postData = params.join('&');
        self.data = postData;
        if (opt.method.toUpperCase() === 'POST') {
            xmlHttp.open(opt.method, opt.url, opt.async);
            xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
            xmlHttp.send(postData);
        }
        else if (opt.method.toUpperCase() === 'GET') {
            xmlHttp.open(opt.method, opt.url + '?' + postData, opt.async);
            xmlHttp.send(null);
        }
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                opt.success(xmlHttp.responseText);
            }
        };
    },
    randomNum: function (min, max) {
        var num = Math.floor(Math.random() * ( max - min ) + min);
        return num;
    }
}
var $my = new My();
function $(el) {
    return  document.querySelector(el);
}
