window.onload = function () {
    (function () {
        function deviceType() {
            var ua = navigator.userAgent.toLowerCase();
            if (/iphone|ipad|ipod/.test(ua)) {
                return '';
            } else if (/android/.test(ua)) {
                return 'http://a.app.qq.com/o/simple.jsp?pkgname=com.lwj.liwanjia';
            } else {
                return 'pc';
            }
        }
        var downUrl = deviceType(); //用户设备

        var ul = $('#slide_phoneNumber ul'),
            li = ul.querySelectorAll('li')[0],
            liHeight = li.offsetHeight;
        var numArr = ["139", "138", "137", "136", "135", "134", "159", "158", "157", "150", "151", "152", "188", "187", "182", "183", "184", "178", "130", "131", "132", "156", "155", "186", "185", "176", "133", "153", "189", "180", "181", "177"];
        var str = '',
            i = 0,
            len = numArr.length;
        for (; i < 50; i++) {
            var randomPhoneNumber = numArr[$my.randomNum(0, len - 1)] + '****' + $my.randomNum(1000, 9999);
            str += '<li>用户&nbsp;&nbsp;&nbsp;<span>' + randomPhoneNumber + '</span>&nbsp;&nbsp;&nbsp;注册成功!</li>';
        }
        ul.innerHTML = str;
        var top = 0,
            ulHeight = ul.offsetHeight;
        setInterval(function () {
            top += liHeight;
            if (top > ulHeight) {
                ul.style.top = liHeight + 'px';
                top = 0;
            }
            $my.animate(ul, {top: -top});
        }, 2000);
        function getUrl() {
            if(location.origin){
                return location.origin;
            }else{
                var protocol = location.protocol,
                    host = location.host;
                return protocol + host;
            }
        }
        var baseUrl = getUrl(),
            referrerName = $('#referrerName'),
            phoneNumber = $('#phoneNumber'),
            getCode = $('#getCode'),
            password = $('#password'),
            code = $('#code'),
            protocol = $('#protocol'),
            register_btn = $('#register_btn');
        var reg_phoneNumber = /^1\d{10}$/;
        getCode.addEventListener('click', function () {
            if (!reg_phoneNumber.test(phoneNumber.value)) {
                alert('手机号格式填写错误' + phoneNumber.value);
                return;
            }
            $my.ajax({
                url: baseUrl + '/user/sendSMS.do',
                data: {
                    name: phoneNumber.value
                },
                method: 'get',
                success: function (data) {
                    var data = JSON.parse(data);
                    if (data.state) {
                        alert('验证码发送成功');
                    }
                }
            });
        });
        register_btn.addEventListener('click', function () {
            if (!protocol.checked) {
                alert('您未同意《利万嘉协议》');
                return;
            }
            if (!reg_phoneNumber.test(phoneNumber.value)) {
                alert('手机号填写错误');
                return;
            }
            $my.ajax({
                url: baseUrl + '/user/refeRegist.do',
                data: {
                    name: phoneNumber.value,
                    password: password.value,
                    code: code.value,
                    referrerName: referrerName.value,
                },
                method: 'post',
                success: function (data) {
                    var data = JSON.parse(data),
                        isdown;
                    console.log(data);
                    function downLoad(url) {
                        if(url == 'pc'){
                            alert('请在手机上下载');
                        }else if(url){
                            location.href = url;
                        }else {
                            alert('暂未开放下载');
                        }
                    }
                    switch (data.state) {
                        case 0:
                            alert('注册失败');
                            break;
                        case 1:
                            isdown = confirm('注册成功! 是否立即下载app');
                            break;
                        case 2:
                            alert('手机号错误');
                            break;
                        case 3:
                            alert('密码错误');
                            break;
                        case 4:
                            isdown = confirm('该手机号已注册! 是否立即下载app');
                            break;
                        case 5:
                            alert('验证码错误');
                            break;
                    }
                    if(isdown){
                        downLoad(downUrl);
                    }
                }
            })
        });
    })();
};