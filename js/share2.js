window.onload = function () {
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
    function getRequest(){
        var url = location.search;
        var jsonList={};
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
    $my.ajax({
        url: baseUrl + '/user/getToken.do',
        data: {
            userId: requestData.userId
        },
        method: 'get',
        success: function (data) {
            var data = JSON.parse(data),
                token = data.data;
            if(data.state){
                document.cookie = 'token=' + token;
                $my.ajax({
                    url: baseUrl + '/marketGoods/loadGoodsDetails.do',
                    data: {
                        token: token,
                        commodityCode: requestData.commodityCode,
                        commodityType: requestData.commodityType
                    },
                    method: 'get',
                    success: function (data) {
                        var data =  JSON.parse(data);
                        if(data.state){
                            var goods = data.data[0],
                                goodsDetails = goods.goodsDetails,
                                localGoods = goods.localGoods
                            var header = new Vue({
                                el: '#header',
                                data: {
                                    imgs: goodsDetails.slideshowImg
                                }
                            });
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
                                                token: token,
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
                                            token: token,
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
                                    })
                                }
                            });
                            var same = new Vue({
                                el: '#same',
                                data: {
                                    localGoods: localGoods
                                }
                            });
                        }

                    }
                });
            }
        }
    });
    var footer = new Vue({
        el: '#footer',
        data: {
            ua: ''
        },
        computed: {
            downUrl: function () {
                switch(this.ua){
                    case 'ios':
                        return '';
                    case 'android':
                        return 'http://a.app.qq.com/o/simple.jsp?pkgname=com.lwj.liwanjia';
                }
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

    // if(location.href != 'http://localhost:63342/share/share2.html?token=0&userId=1&commodityType=2&commodityCode=3'){
    //     location.href = 'http://localhost:63342/share/share2.html?token=0&userId=1&commodityType=2&commodityCode=3';
    // }

    // $my.ajax({
    //     url: baseUrl +
    // })

    //轮播图组件
    Vue.component('public-carousel',{
        props: ['imgs'],
        template:
        '<div class="carousel">' +
            '<transition-group tag="ul" name="carousel" >' +
                '<li v-for="(img,index) in imgs" v-show="index == current_index" key="index">' +
                    '<img :src="img" alt="">'+
                '</li>'+
            '</transition-group>' +
            '<div class="bar"><span>{{current_index + 1}}</span>/<span>{{imgLength}}</span></div>'+
        '</div>',
        data: function () {
            return {
                current_index: 0,
                timer: null
            }
        },
        computed: {
            imgLength: function () {
                return this.imgs.length;
            }
        },
        methods: {
            autoPlay: function () {
                this.current_index ++;
                if(this.current_index == this.imgLength){
                    this.current_index = 0;
                }
            },
            play: function () {
                this.timer = setInterval(this.autoPlay, 3000);
            }
        },
        created: function () {
            if(this.imgLength == 1) return;
            this.play();
        }
    });
    // $my.ajax({
    //     url:
    // })

}
