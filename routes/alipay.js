/**
 * route index.js
 * author: willian12345@126.com
 * github: https://github.com/willian12345/wechat-JS-SDK-demo
 * time: 2015-1-27
 */
var request = require('request');
var http = require("http");
var https = require("https");

var crypto = require('crypto');
var fs = require('fs');
var moment = require('moment');
var HashMap = require('hashmap').HashMap;

//支付宝服务窗－－获取access_token 然后 获取用户信息
exports.getAlipayUserInfo = function(req, res) {
    var code = req.body.code;
    var appId = req.body.appId;
    var timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    var url ='https://openapi.alipay.com/gateway.do';
    //获取token参数
    var sign_config = new HashMap();
    sign_config.set('app_id', appId);
    sign_config.set('method', 'alipay.system.oauth.token'); 
    sign_config.set('charset', 'utf-8'); 
    sign_config.set('timestamp', timestamp); 
    sign_config.set('version', '1.0'); 
    sign_config.set('sign_type', 'RSA'); 
    sign_config.set('grant_type', 'authorization_code'); 
    sign_config.set('code', code); 
    //获取参数及－－－签名
    var signed_params = getSignParams(sign_config);
    //第一步获取  post获取token
    postToAlipayUrl( url, signed_params, function(err, callback_result) {

        if (err) {
            console.log('err',err);
            result = {
                'code': 401,
                'success': false,
                'message':'签名错误',
                'error': err
            };
            res.header("Access-Control-Allow-Origin", "*");
            res.json(result);
        };
        console.log(11111)
        console.log(callback_result)
        //获取用户信息参数
        timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
        var share_config = new HashMap();
        share_config.set('app_id', appId);
        share_config.set('charset', 'utf-8'); 
        share_config.set('version', '1.0'); 
        share_config.set('sign_type', 'RSA');
        share_config.set('method', 'alipay.user.userinfo.share'); 
        share_config.set('timestamp', timestamp); 
        if ( null!=callback_result && null!=callback_result.alipay_system_oauth_token_response &&
            null != callback_result.alipay_system_oauth_token_response.access_token ) {
            // console.log(callback_result)
            share_config.set('auth_token', callback_result.alipay_system_oauth_token_response.access_token); 
        };
        //获取参数及－－－签名
        var share_params = getSignParams(share_config);
        //第一步获取  用户信息
        postToAlipayUrl( url, share_params, function(err, share_result) {

            if (err) {
                console.log('err',err);
                result = {
                    'code': 402,
                    'success': false,
                    'message':'获取用户信息错误',
                    'error': err
                };
                res.header("Access-Control-Allow-Origin", "*");
                res.json(result);
            };
            console.log(22222)
            console.log(share_result);
            if (null!=share_result && null!=share_result.alipay_user_userinfo_share_response) {
                result = {
                    'code': 200,
                    'success': true,
                    'message':'获取用户信息成功',
                    'data': share_result.alipay_user_userinfo_share_response
                };
                res.header("Access-Control-Allow-Origin", "*");
                res.jsonp(result);
            };
        })
        
    });

    
}




function postToAlipayUrl(url, map, next) {

    var jsonArray = {};
   
    map.forEach(function(value, key) {
        jsonArray[key] = value;
    });
    console.log('jsonArray',jsonArray);
    request({
        uri: url,
        method: "POST",
        form: jsonArray
    }, function(error, response, body) {

        if (error) {
            return next(error);
        } else {
            var decoded_str = decodeURIComponent(body);
            var jsonObject = JSON.parse(decoded_str);
            return next(null, jsonObject);
        }

    });

}

/*
 *  Encrypt Related Module for Common Use
 *  RSA / MD5
 */
function getSignParams(map_params) {
    // 使用参数
    var content = '';
    var params_arr_sort = new Array();
    // ASCii码 从小到大 排序
    map_params.forEach(function(value, key) {
        params_arr_sort.push(key); 
    });
    params_arr_sort.sort(); 
    // 拼接字符串
    var final_map_params = new HashMap();
    for (var i = 0; i < params_arr_sort.length; ++i) {
        // console.log("params_arr_sort["+i+"] is: ",params_arr_sort[i]);
        if (i == 0) {
            content = content + params_arr_sort[i] + "=" + map_params.get(params_arr_sort[i]);
        } else {
            content = content + "&" + params_arr_sort[i] + "=" + map_params.get(params_arr_sort[i]);
        }
        final_map_params.set(params_arr_sort[i], map_params.get(params_arr_sort[i]));
    }
    console.log("content is: " + content);
    // sha1加密计算签名
    var sign = sha1Sign(content);
    console.log('sha1--content',sign);

    final_map_params.set('sign', sign);
    return final_map_params;
}

// sha1 计算签名
function sha1Sign(content) {

    var key =fs.readFileSync('configs/alipay-private.pem');
    console.log(key);
    var shasum = crypto.createSign('RSA-SHA1');
    shasum.update(content,'utf8');
    var sign = shasum.sign(key, 'base64');

    return sign;

}

