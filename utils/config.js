
//配置域名,域名只修改此处。
//如果wordpress没有安装在网站根目录请加上目录路径,例如："www.watch-life.net/blog"
var DOMAIN = "www.iacblog.com";
var MINAPPTYPE="1";//小程序的类型，如果是企业小程序请填：0 ，如果是个人小程序请填：1
var WEBSITENAME="迷你喵"; //网站名称
var ABOUTID = 188; //wordpress网站"页面"的id,注意这个"页面"是wordpress的"页面"，不是"文章"
var PAGECOUNT='10'; //首页每页文章数目
var TOPPAGECOUNT = '10'; //热门文章每页文章数目
var HOTPAGECOUNT = '15'; //热门文章每页文章数目
var CATEGORIESID='all';  //专题页显示全部的分类
//var CATEGORIESID = '1,1059,98,416,189,374,6,463';//指定专题页显示的分类的id
var INDEXLISTTYPE="all"; //首页显示所有分类
//var INDEXLISTTYPE ="1" //指定首页显示分类的id
var PAYTEMPPLATEID = 'hzKpxuPF2rw7O-qTElkeoE0lMwr0O4t9PJkLyt6v8rk';//鼓励消息模版id
var REPLAYTEMPPLATEID = 'gxXlK0soqCHdoFvDqBtb9u2VPum0tXLnCMuVyNDAalI';//回复评论消息模版id
var ZANIMAGEURL = 'https://cdn.iacblog.com/iacblogimages/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20181017082833.jpg';//微信鼓励的图片链接，用于个人小程序的赞赏
var LOGO = "../../images/logo-icon.png"; // 网站的logo图片
var POSTERIMGURL ="../../images/logo700.png"; //生成海报如果没有首图，使用此处设置的图片作为海报图片。
//设置downloadFile合法域名,不带https ,在中括号([])里增加域名，格式：{id=**,domain:'www.**.com'}，用英文逗号分隔。
//此处设置的域名和小程序与小程序后台设置的downloadFile合法域名要一致。
var DOWNLOADFILEDOMAIN = [
  { id: 1, domain: 'www.wolzq.com' },
  { id: 2, domain: 'www.wolzq.com' },
  { id: 3, domain: 'www.wolzq.com' }
];
 //首页图标导航
 //参数说明：'name'为名称，'image'为图标路径，'url'为跳转的页面，'redirecttype'为跳转的类型，apppage为本小程序的页面，miniapp为其他微信小程序,webpage为web-view的页面
 //redirecttype 是 miniapp 就是跳转其他小程序  url 为其他小程序的页面
 //redirecttype 为 apppage 就是跳转本小程序的页面，url为本小程序的页面路径
 //redirecttype 为 webpage 是跳转网址，是通过web-view打开网址，url就是你要打开的网址，不过这个网址的域名要是业务域名
 //'appid' 当redirecttype为miniapp时，这个值为其他微信小程序的appid，如果redirecttype为apppage，webpage时，这个值设置为空。
 //'extraData'当redirecttype为miniapp时，这个值为提交到其他微信小程序的参数，如果redirecttype为apppage，webpage时，这个值设置为空。
var INDEXNAV = [
  { id: '1', name: '微慕', image: '../../images/nav-icon1.png', url: 'pages/index/index', redirecttype: 'miniapp', appid: 'wx3d887bdddb6c1fcf', extraData: '' },
  { id: '2', name: '企业版', image: '../../images/nav-icon2.png', url: 'pages/index/index', redirecttype: 'miniapp', appid: 'wx3d887bdddb6c1fcf', extraData: '' },
  { id: '3', name: '旅游版', image: '../../images/nav-icon3.png', url: 'pages/index/index', redirecttype: 'miniapp', appid: 'wx3d887bdddb6c1fcf', extraData: '' },
  { id: '4', name: '图片版', image: '../../images/nav-icon4.png', url: 'pages/index/index', redirecttype: 'miniapp', appid: 'wx3d887bdddb6c1fcf', extraData: ''},
  { id: '5', name: '微店', image: '../../images/nav-icon5.png', url: 'pages/shelf/shelf', redirecttype: 'miniapp', appid: 'wx3d887bdddb6c1fcf', extraData: ''}
  // { id: '6', name: '教程', image: '../../images/app.png', url: '../../pages/list/list?categoryID=1059', redirecttype: 'apppage', appid: '', extraData: ''}
    
    ];

export default {
  getDomain: DOMAIN,
  getWebsiteName: WEBSITENAME,
  getAboutId: ABOUTID,
  getPayTemplateId: PAYTEMPPLATEID,
  getPageCount: PAGECOUNT,
  getTopPageCount: TOPPAGECOUNT,
  getHotPageCount: HOTPAGECOUNT,
  getCategoriesID :CATEGORIESID,
  getIndexNav: INDEXNAV,
  getReplayTemplateId: REPLAYTEMPPLATEID,
  getMinAppType: MINAPPTYPE,
  getZanImageUrl: ZANIMAGEURL,
  getIndexListType: INDEXLISTTYPE,
  getLogo: LOGO,
  getPostImageUrl: POSTERIMGURL,
  getDownloadFileDomain: DOWNLOADFILEDOMAIN
}