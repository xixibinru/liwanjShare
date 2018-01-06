
window.addEventListener('load',function () {
    localStorage.share2Url = location.href;
    function getUrl() {
        if(location.origin){
            return location.origin;
        }else{
            var protocol = location.protocol,
                host = location.host;
            return protocol + host;
        }
    }
    var baseUrl = getUrl();
    localStorage.baseUrl = baseUrl;
    function getRequest(){
        var url = location.search;
        var jsonList = {};
        if(url.indexOf('?') != -1){
            var str = url.slice(url.indexOf("?") + 1);
            var strs = str.split("&");
            for(var i = 0; i < strs.length; i++){
                jsonList[strs[i].split("=")[0]] = strs[i].split("=")[1];
            }
        }
        return jsonList;
    }
    var requestData = getRequest();
    requestData.commodityType = requestData.commodityType == 1? '商品': '超市';

    // $my.ajax({
    //     url: baseUrl + '/user/getToken.do',
    //     data: {
    //         userId: requestData.userId
    //     },
    //     method: 'get',
    //     success: function (data) {
    //         var data = JSON.parse(data),
    //             token = data.data;
    //         if(data.state){
    //             // document.cookie = 'token=' + token;
    //
    //         }
    //     }
    // });
    // var token = '7f9e4581-0d8f-43f9-95d1-6e09a3f98ff1';
    if(localStorage.token){
        var token = localStorage.token;
    }
    $my.ajax({
        url: baseUrl + '/marketGoods/loadGoodsDetails.do',
        data: {
            // token: token,
            commodityCode: requestData.commodityCode,
            commodityType: requestData.commodityType
        },
        method: 'get',
        success: function (data) {
            var data =  JSON.parse(data);
            console.log(data);
            if(data.state){
                var goods = data.data[0],
                    goodsDetails = goods.goodsDetails,
                    localGoods = goods.localGoods;
                var header = new Vue({
                    el: '#header',
                    data: {
                        imgs: goodsDetails.slideshowImg
                    }
                });
                // 分享的商品
                var commodity = new Vue({
                    el: '#commodity',
                    data: {
                        label: [], //label标签数组
                        label_index: null, //当前选择label对应的index 默认先不显示
                        commentType_arr: [], // label标签的中文数组
                        type: 0, //商品描述和评价
                        limit: null, //评分
                        goodsDetails: goodsDetails,
                        comment: [], //评论数组
                    },
                    methods: {
                        cutTab: function (e) {
                            if(e.target.className == 'tab') return;
                            var clickName = e.target.innerText;
                            this.type = clickName === '商品描述' ? 0 : 1;
                        },
                        initEvaluation: function () {
                            this.label_index = 0;
                        },
                        changeLabel: function (index) {
                            this.label_index = index;
                        }
                    },
                    watch: {
                        //根据点击的标签请求评论
                        label_index: function () {
                            var self = this;
                            $my.ajax({
                                url: baseUrl + '/marketGoods/loadGoodsComment.do',
                                data: {
                                    commodityCode: requestData.commodityCode,
                                    commodityType: requestData.commodityType,
                                    commentType: this.commentType_arr[this.label_index]
                                },
                                method: 'get',
                                success: function (data) {
                                    var data = JSON.parse(data);
                                    self.comment = data.data;
                                }
                            });
                        }
                    },
                    beforeCreate: function () {
                        var self = this;
                        //加载标签
                        $my.ajax({
                            url: baseUrl + '/marketGoods/loadCommentLabel.do',
                            method: 'get',
                            data: {
                                commodityCode: requestData.commodityCode,
                                commodityType: requestData.commodityType
                            },
                            success: function (data) {
                                var data = JSON.parse(data);
                                if(data.state){
                                    self.label = data.data[0].label;
                                    self.limit = data.data[0].limit;
                                    self.commentType_arr = self.label.map(function (item) {
                                        return item.substring(0,item.indexOf('('));
                                    });
                                }
                            }
                        });
                    }
                });
                // 相似的商品
                var same = new Vue({
                    el: '#same',
                    data: {
                        localGoods: localGoods
                    }
                });
                // 点击立即购买选择大小
                var selectSize = new Vue({
                    el: '#selectSize',
                    data: {
                        show: false,
                        commodityCode: goodsDetails.commodityCode,
                        nowPrice: goodsDetails.commodityPrice,
                        commodityType: goodsDetails.commodityType,
                        commodity: {},//商品信息
                        labelArr:[], //存放选择的label
                        num: 1, //购买数量
                        have: 0,
                    },
                    methods: {
                        //选择标签,选择时获取价格
                        selectLabel: function (title,type,index) {
                            var self = this;
                            this.labelArr[index].title = title;
                            this.labelArr[index].type = type;
                            console.log({
                                token: token,
                                commodityCode: this.commodityCode,
                                label: JSON.stringify(this.labelArr),
                                nowPrice: this.nowPrice
                            });
                            var selected =  this.labelArr.some(function (item) {
                                return !item.type;
                            });
                            console.log(selected);
                            if(selected) return;

                            $my.ajax({
                                url: baseUrl + '/shopCart/loadNewCommodityPrice.do',
                                data: {
                                    token: token,
                                    commodityCode: this.commodityCode,
                                    label: JSON.stringify(this.labelArr),
                                    nowPrice: this.nowPrice
                                },
                                method: 'post',
                                success: function (data) {
                                    var data = JSON.parse(data)
                                    console.log(data);
                                    if(data.state){
                                        if(data.data.have){
                                            self.commodity.nowPrice = data.data.nowPrice;
                                            self.commodity.stock = data.data.stock;
                                            self.commodity.commodityCode = data.data.commodityCode;
                                            self.commodity.commodityType = data.data.commodityType;
                                        }else {
                                            self.commodity.nowPrice = '暂无库存';
                                        }
                                        self.have = data.data.have;
                                    }
                                }
                            });
                        },
                        buyNow: function () {
                            if(!this.have) return;
                            console.log({
                                token: token,
                                nowPrice: this.commodity.nowPrice,
                                commodityCode: this.commodityCode,
                                commodityType: this.commodityType,
                                num: this.num,
                                dataList: JSON.stringify(this.labelArr)
                            });
                            // 点击立即购买 => 确定 后 将购买到的商品存到 localStorage

                            $my.ajax({
                                url: baseUrl + '/shopCart/nowBuyAllGoods.do',
                                data: {
                                    token: token,
                                    nowPrice: this.commodity.nowPrice,
                                    commodityCode: this.commodity.commodityCode || this.commodityCode,
                                    commodityType: this.commodity.commodityType,
                                    num: this.num,
                                    dataList: JSON.stringify(this.labelArr)
                                },
                                method: 'post',
                                success: function (data) {
                                    var data = JSON.parse(data);
                                    console.log(this.data);
                                    console.log(data);
                                    if(data.state){
                                        localStorage.confirmAnOrder = JSON.stringify(data.data);
                                        location.href = './confirmAnOrder.html';
                                    }else {
                                        Vue.prototype.$goLogin();
                                    }
                                }
                            });
                        }
                    },
                    created: function () {
                        if(!token) return;
                        var self = this;
                        console.log(this.commodityCode+','+
                            this.commodityPrice+','+
                            this.commodityType);

                        $my.ajax({
                            url: baseUrl + '/shopCart/loadCommodityAddShopCart.do',
                            data: {
                                commodityCode: this.commodityCode,
                                nowPrice: this.nowPrice,
                                commodityType: this.commodityType,
                            },
                            method: 'post',
                            success: function (data) {
                                var data = JSON.parse(data);
                                console.log(data);
                                if(data.state){
                                    var  label = data.data.lable; //用于填充label数组
                                    label.forEach(function (item,index,arr) {
                                        arr[index].type = item.type.split(';');
                                    });
                                    self.labelArr = label.map(function (item,index) {
                                        return {
                                            title: item.title, //label的标题
                                            type: null, //label的内容
                                        }
                                    });
                                    console.log(data.data);
                                    self.commodity = data.data;
                                }else {
                                    Vue.prototype.$goLogin();
                                }
                            }
                        })
                    }
                });
                var footer = new Vue({
                    el: '#footer',
                    data: {
                        ua: '' //设备类型
                    },
                    computed: {
                        downUrl: function () {
                            switch(this.ua){
                                case 'ios':
                                    return '';
                                case 'android':
                                    return 'http://a.app.qq.com/o/simple.jsp?pkgname=com.lwj.liwanjia';
                            }
                        },
                        userName: function () {
                            return localStorage.userName || '';
                        },
                        password: function () {
                            return localStorage.password || '';
                        },
                        isRegister: function () { //用户是否注册过
                            return + localStorage.isRegister || 0;
                        },
                        token: function () { //用户是否登录中 0为登录 1已登录
                            return localStorage.token;
                        }
                    },
                    methods: {
                        download: function () {
                            var isdown = confirm('是否立即下载app');
                            if(isdown){
                                if(!this.downUrl){
                                    alert(this.ua + '端暂未开放下载');
                                    return;
                                }
                                location.href = this.downUrl;
                            }
                        },
                        handleEvent: function (txt) {
                            if(!this.isRegister && !this.token){
                                location.href = './register.html';
                                return;
                            }
                            if(!this.token){
                                location.href = './login.html';
                                return;
                            }
                            switch (txt){
                                case '个人中心':
                                    location.href = './personCenter.html';
                                    break;
                                case '我的订单':
                                    location.href = './myOrder.html';
                                    break;
                                case '立即购买':
                                    if(goodsDetails.commodityType == '超市'){

                                    }else {
                                        selectSize.show = true;
                                    }
                                    break;
                            }
                        }
                    },
                    created: function () {
                        var ua = navigator.userAgent.toLowerCase();
                        if (/iphone|ipad|ipod/.test(ua)) {
                            this.ua = 'ios';
                        } else if (/android/.test(ua)) {
                            this.ua = 'android';
                        } else {
                            this.ua = 'pc';
                        }
                    }
                });
            }

        }
    });









});