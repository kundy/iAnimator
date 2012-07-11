/*
 * Copy Right: Tencent ISUX
 * Project: QAM（Qzone模块化页面搭建平台）
 * Description: 常用函数集合
 * Author: Tysonpan
 * date: 2011-11-30
 */


/******************************
 **********常用函数**********
 ******************************/
var functions = {

    /* 获取url参数 */
    getRequest:function (paras) {
        var url = location.href;
        var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
        var paraObj = {}
        for (i = 0; j = paraString[i]; i++) {
            paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=") + 1, j.length);
        }
        var returnValue = paraObj[paras.toLowerCase()];
        if (typeof(returnValue) == "undefined") {
            return "";
        } else {
            return returnValue.replace(/#/g, '');      //过滤#号，一个或多个;
        }
    },

    //将数组转成字符串并加密
    requestToString:function (data_area) {
        var ret = "";
        for (var i = 0; i < data_area.length; i++) {
            ret += "&" + data_area[i][0];
            ret += "=" + encodeURIComponent(data_area[i][1]);
        }
        ret += "&rand=" + Math.round((Math.random() * 1000000));
        return ret;
    },

    //检查字符串
    checkAlnum:function (str) {
        var alnum = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
        for (var i = 0; i < str.length; i++) {
            if (alnum.indexOf(str.charAt(i)) == -1) {
                return false;
            }
        }
        return true;
    },

    //textarea内容控制
    textareaInsertText:function (obj, str) {
        if (document.selection) {
            var sel = document.selection.createRange();
            sel.text = str;
        } else if (typeof obj.selectionStart === 'number' && typeof obj.selectionEnd === 'number') {
            var startPos = obj.selectionStart,
                endPos = obj.selectionEnd,
                cursorPos = startPos,
                tmpStr = obj.value;
            obj.value = tmpStr.substring(0, startPos) + str + tmpStr.substring(endPos, tmpStr.length);
            cursorPos += str.length;
            obj.selectionStart = obj.selectionEnd = cursorPos;
        } else {
            obj.value += str;
        }
    },
    textareaMoveEnd:function (obj) {
        obj.focus();
        var len = obj.value.length;
        if (document.selection) {
            var sel = obj.createTextRange();
            sel.moveStart('character', len);
            sel.collapse();
            sel.select();
        } else if (typeof obj.selectionStart == 'number' && typeof obj.selectionEnd == 'number') {
            obj.selectionStart = obj.selectionEnd = len;
        }
    },


    //html转义
    HtmlEncode:function (text) {
        return text.replace(/&/g, '&amp').replace(/\"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },

    HtmlDecode:function (text) {
        return text.replace(/&amp;/g, '&').replace(/&quot;/g, '\"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    },

    //js复制到剪贴板
    //页面引用方式，使用onmouseover来触发flash加载
    //<a id="copy_area" onmouseover="functions.copy_clip('copy_area','abcd');" href="javascript:void(0)">复制</a>
    copy_clip:function (input_id, copy_content) {
        //需要先在页面引入 <script src="js/ZeroClipboard.js" type="text/javascript"></script>
        ZeroClipboard.setMoviePath("js/ZeroClipboard.swf");
        var clip = new ZeroClipboard.Client(); // 新建一个对象
        clip.setHandCursor(true); // 设置鼠标为手型
        clip.setText(copy_content);
        clip.glue(input_id);
        clip.addEventListener("complete", function () {
            message.show("message_div", "", "已复制到剪贴板！", 3);
        });
    },

    /* 颜色值转换：rga转hex */
    rgb2hex:function (rgb) {
        //nnd, Firefox / IE not the same, fxck
        if (rgb.charAt(0) == '#')
            return rgb;
        var n = Number(rgb);
        var ds = rgb.split(/\D+/);
        var decimal = Number(ds[1]) * 65536 + Number(ds[2]) * 256 + Number(ds[3]);
        return  functions.zero_fill_hex(decimal, 6);
    },

    //转到固定长度的十六进制字符串，不够则补0
    zero_fill_hex:function (num, digits) {
        var s = num.toString(16);
        while (s.length < digits)
            s = "0" + s;
        return s;
    }
}


/******************************
 原型重定义
 ******************************/
Array.prototype.delRepeat = function () {//数组去重
    var newArray = [];
    var provisionalTable = {};
    for (var i = 0, item; (item = this[i]) != null; i++) {
        if (!provisionalTable[item]) {
            newArray.push(item);
            provisionalTable[item] = true;
        }
    }
    return newArray;
}

Array.prototype.delNull = function () {//数组去空
    var newArray = [];
    var provisionalTable = {};
    for (var i = 0; i < this.length; i++) {
        if (this[i] != "")newArray.push(this[i]);
    }
    return newArray;
}

/******************************
 **********cookie对象**********
 objName:键名
 objValue:值
 objHours:有效时间（小时）
 ******************************/
var cookie = {

    /* 添加cookie */
    set:function (objName, objValue, objHours) {
        var str = objName + "=" + escape(objValue);
        if (objHours > 0) {//为0时不设定过期时间，浏览器关闭时cookie自动消失
            var date = new Date();
            var ms = objHours * 3600 * 1000;
            date.setTime(date.getTime() + ms);
            str += "; expires=" + date.toGMTString();
        }
        document.cookie = str;
    },

    get:function (objName) {//获取指定名称的cookie的值
        var arrStr = document.cookie.split("; ");
        for (var i = 0; i < arrStr.length; i++) {
            var temp = arrStr[i].split("=");
            if (temp[0] == objName) return unescape(temp[1]);
        }
    }
}


/******************************
 **********弹框组件**********
 _obj_id:弹框div，已废除
 _title:标题
 _content:内容
 _type:弹框类型
 1确认按钮
 2确认+取消按钮
 3 无按钮，成功提示，自动消失
 4 无按钮，失败提示，自动消失
 5 无按钮，警告提示，自动消失

 _width:弹框宽度
 _callback:确定按钮回调函数(字符串)

 示例
 message.show("message_div","提示","确实要删除吗？",2,"","project.del(123);")

 ******************************/



var message = {
    obj_id:"message_div",
    title:"提示",
    content:"无内容",
    type:1,
    width:376,
    callback:"message.close();",

    //默认显示对话框
    show:function (_obj_id, _title, _content, _type, _width, _callback) {
        this.obj_id = _obj_id || "message_div";
        this.title = _title || "提示";
        this.content = _content || "无内容";
        this.type = _type || 1;
        this.width = _width || 376;
        this.callback = _callback + ";message.close()";
        //this.callback += ";message.close();";


        var ret = "<div id=\"qam_message_area\">";

        if (this.type == 1 || this.type == 2) {
            ret += "<div class=\"qam_message_mask\"></div>";//遮罩层
            ret += "<div id=\"qam_popup_box\" class=\"qam_popup\" style=\"width:" + this.width + "px;margin-left:-" + this.width / 2 + "px;\"><div class=\"qam_popup_inner\">";
            ret += "<div class=\"qam_popup_hd\"><div class=\"qam_popup_hd_inner\"><h3>" + this.title + "</h3><a href=\"javascript:void(0)\" onclick=\"message.close()\" class=\"ico_x\"></a></div></div>";
            ret += "<div class=\"qam_popup_bd\">" + this.content + "</div>";
            ret += "<div class=\"qam_popup_ft\"><div class=\"global_tip_button\">";
            if (this.type == 1 || this.type == 2)ret += "<a class=\"bt_tip_hit\" title=\"确定\" href=\"javascript:void(0)\" onclick=\"" + this.callback + "\">确定</a>";
            if (this.type == 2)ret += "<a class=\"bt_tip_normal\" title=\"取消\" href=\"javascript:void(0)\" onclick=\"message.close()\">取消</a>";
            ret += "</div></div></div></div>";
        }
        else if (this.type == 3 || this.type == 4 || this.type == 5) {
            ret += "<div id=\"qam_msgbox\" class=\"qam_msgbox_layer_wrap\"><span class=\"qam_msgbox_layer\">";
            if (this.type == 3)ret += "<span class=\"gtl_ico_succ\"></span>";
            else if (this.type == 4)ret += "<span class=\"gtl_ico_fail\"></span>";
            else if (this.type == 5)ret += "<span class=\"gtl_ico_hits\"></span>";
            ret += this.content;
            ret += "<span class=\"gtl_end\"></span></span></div>";
        }
        ret += "</div>";

        if (typeof($("#qam_message_area") == "object")) {
            $("#qam_message_area").remove();
        }

        $(document.body).append(ret);

        if (this.type == 1 || this.type == 2) {
            $("#qam_popup_box").css("top", $(window).height() / 2 + $(parent).scrollTop() - 100);
        }
        else if (this.type == 3 || this.type == 4 || this.type == 5) {
            setTimeout(function () {
                eval(message.callback);
            }, 1500);
        }

    },

    close:function () {
        $("#qam_message_area").remove();
    }

}

/******************************
 **********消息提示组件**********
 _content:内容
 _type:弹框类型
 1小白条，带菊花，一般用于等待
 2小红条，当出现某种错误当前操作无法进行时采用红条
 3小黄条，当系统正在后台处理，当前操作无反映采用黄色条显示！

 示例
 notify.show(1,"正在加载，请稍候");

 ******************************/

var notify = {
    type:1,
    content:"无内容",
    show:function (_type, _content) {
        this.type = _type || 1;
        this.content = _content || "无内容";

        var ret = "";
        ret = "<p>";
        if (this.type == 1)ret += "<img src=\"css/img/loading_16.gif\" />"
        ret += "<span>" + this.content + "</span></p>"
        $("#qam_notify_area").find(".sys_notify_pane_inner").html(ret);
        $("#qam_notify_area").removeClass("pane_w").removeClass("pane_r").removeClass("pane_y");
        if (this.type == 1)$("#qam_notify_area").addClass("pane_w");
        else if (this.type == 2)$("#qam_notify_area").addClass("pane_r");
        else if (this.type == 3)$("#qam_notify_area").addClass("pane_y");

        $("#qam_notify_area").show();
    },
    close:function () {
        $("#qam_notify_area").hide();

    }
}

/**/
var iframe_flag = true;
$(document).ready(function () {
    if (iframe_flag) {
        setTimeout('cookie.set("win_href",window.location.href,1);', 500);
        var top_href = window.top.location.href;
        if (top_href != qam_path && top_href.length < 150) {
            window.top.location.href = qam_path;
        }
    }
});











