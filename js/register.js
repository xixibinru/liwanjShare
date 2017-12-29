window.addEventListener('load',function () {
    //获得省市区
    var baseUrl = localStorage.baseUrl;
    var register = new Vue({
        el: '#register',
        data: {
            state: 0, //短信是否已发送  0未发送 1已发送
            sendTxt: '发送验证码',
            reloadTxt: '已发送 (60s)',
            timer: null, //存放定时器
            vcode: '', //通过canvas获得的验证码
            userVcode: '', //用户输入的验证码
            userData: { //存放用户注册时的数据
                name: '',
                password: '',
                code: '',
                referrerName: '',
                oneAddress: '',
                twoAddress: '',
                threeAddress: '',
                fourAddress: '',
            },
            mustFill:['name','password','code','oneAddress','twoAddress','threeAddress','fourAddress']
        },
        computed: {
            txt: function () { //短信验证码中的文本内容
                if(!this.state){
                    return this.sendTxt;
                }else {
                    return this.reloadTxt;
                }
            },
            classObj: function() { //短信验证码样式
                return {
                    sendClass: !this.state,
                    reloadClass: this.state
                }
            },
        },
        watch: {
            state: function () {
                if(this.state){
                    this.countdown();
                }
            },
        },
        methods: {
            sendSMS: function () { //发送短信验证码
                var self = this;
                  $my.ajax({
                      url: baseUrl + '/user/sendSMS.do',
                      data: {
                          name: this.userData.name
                      },
                      method: 'post',
                      success: function (data) {
                          var data = JSON.parse(data);
                          console.log(data);
                          if(data.state && data.data.length < 7){
                              self.state = 1;
                          }else {
                              alert(data.data)
                          }
                      }
                  })
            },
            countdown: function () {
                var self = this,
                    time = 3;
                this.timer = setInterval(function () {
                    console.log(time);
                    time -= 1;
                    if(time < 0) {
                        clearInterval(self.timer);
                        self.state = 0;
                        return;
                    }
                    self.reloadTxt = '已发送('+time+'s)';
                },1000);
            },
            register: function () { //注册
                var self = this;
                if(!this.$pass_vcode(this.vcode,this.userVcode)){
                    alert('图形验证码输入有误');
                    return;
                }
                if(this.$isNotFilled(this.userData,this.mustFill)) return;
                $my.ajax({
                    url: baseUrl + '/user/regist.do',
                    data: this.userData,
                    method: 'post',
                    success: function (data) {
                        var data = JSON.parse(data);
                        console.log(data);
                        localStorage.id = data.data.id;
                        localStorage.name = data.data.name;
                        localStorage.password = self.userData.password;
                        localStorage.address = data.data.address;
                        localStorage.loginState = 0; //登录状态 是否登录中
                        localStorage.isRegister = 1; // 是否已注册  0未注册 1已注册
                        location.href = './login.html';
                    }
                })
            }
        },
        created: function () {
            console.log(this.classObj);
        }
    });
});
