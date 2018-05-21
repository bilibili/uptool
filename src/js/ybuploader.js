/**
 *
 * Ybuploader.js
 *
 * Copyright (C) 2017 bilibili. All Rights Reserved.
 * Released under GPL License.
 * 
 * @author tangjunxing, yangshangxin
 * 
 */

var ybuploader = WebUploader;

ybuploader.get_upcdns = function(callback){
    function ping(url, _, callback) {
        var img = document.createElement('img');
        img.src = url + '?_=' + Date.now();
        var called = false;
        var start = Date.now();
        function onload() {
            if (!called) {
                callback(null, Date.now() - start);
                called = true;
            }
        }
        img.onload = onload;
        img.onerror = onload;
    }
    var timeout = 500;
    var upcdns = [];
    $.each([{
        os: "kodo",
        query:"os=kodo&bucket=bvcupcdnkodobm", 
        url: "//upload-na0.qbox.me",
    }, {
        os: "kodo",
        query:"os=kodo&bucket=bvcupcdnkodohd", 
        url: "//upload.qbox.me",
    }, {
        os: "kodo",
        query:"os=kodo&bucket=bvcupcdnkodohb", 
        url: "//upload-z1.qbox.me",
    }, {
        os: "kodo",
        query:"os=kodo&bucket=bvcupcdnkodohn", 
        url: "//upload-z2.qbox.me",
    }, {
        os: "upos",
        query:"os=upos&upcdn=ws", 
        url: "//upos-hz-upcdnws.acgvideo.com",
    }, {
        os: "upos",
        query:"os=upos&upcdn=bsy", 
        url: "//upos-hz-upcdnbsy.acgvideo.com",
    }, {
        os: "upos",
        query:"os=upos&upcdn=ali", 
        url: "//upos-hz-upcdnali.acgvideo.com",
    }, {
        os: "upos",
        query:"os=upos&upcdn=tx", 
        url: "//upos-hz-upcdntx.acgvideo.com",
    }, {
        os: "upos",
        query:"os=upos&upcdn=qn", 
        url: "//upos-hz-upcdnqn.acgvideo.com",
    }, {
        os: "cos",
        query:"os=cos&bucket=bvcupcdncoshn", 
        url: "//bvcupcdncoshn-1252693259-cn-south.acgvideo.com",
    }, {
        os: "cos",
        query:"os=cos&bucket=bvcupcdncoshb", 
        url: "//bvcupcdncoshb-1252693259-cn-north.acgvideo.com",
    }, {
        os: "cos",
        query:"os=cos&bucket=bvcupcdncoshd", 
        url: "//bvcupcdncoshd-1252693259-cn-east.acgvideo.com",
    }, {
        os: "cos",
        query:"os=cos&bucket=bvcupcdncosxn", 
        url: "//bvcupcdncosxn-1252693259-cn-southwest.acgvideo.com",
    }, {
        os: "cos",
        query:"os=cos&bucket=bvcupcdncosxjp", 
        url: "//bvcupcdncosxjp-1252693259-sg.acgvideo.com",
    // }, {
    //     os: "bos",
    //     query:"os=bos&bucket=bvcupcdnboshn", 
    //     url: "//gz.bcebos.com",
    // }, {
    //     os: "bos",
    //     query:"os=bos&bucket=bvcupcdnboshb", 
    //     url: "//bj.bcebos.com",
    // }, {
    //     os: "bos",
    //     query:"os=bos&bucket=bvcupcdnboshd", 
    //     url: "//su.bcebos.com",
    // }, {
    //     os: "bos",
    //     query:"os=bos&bucket=bvcupcdnbosxg", 
    //     url: "//hk-2.bcebos.com",
    }], function(_, line){
        ping(line.url, _, function(_, cost) {
            line.cost = cost;
            upcdns.push(line);
        })
    });
    setTimeout(function(){
        upcdns.sort(function(a, b) {
            return a.cost - b.cost;
        });
        callback(upcdns.concat());
    }, timeout);
}

ybuploader.Ybuploader = function (os, options, profile, preupload, upcdn_query = "") {

    if (!WebUploader.Uploader.support()) {
        alert('暂不支持您的浏览器，推荐使用Chrome浏览器！如有疑问请加QQ：385749807');
    }

    //
    // Weblog
    //
    window.weblog = function(name, data) {
        var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {};
        data.rtt= connection.rtt;
        data.effectiveType= connection.effectiveType;
        data.downlink= connection.downlink;
        data.weblog = name;
        data.sysos = WebUploader.os;
        data.browser = WebUploader.browser;
        data.js_now = Date.now();
        data.js_uploadstart = data.js_uploadstart;

        if(typeof data.statusText != 'string'){
            data.statusText = 'NOT_STRING';
        }
        if(typeof data.reason != 'string'){
            data.reason = 'NOT_STRING';
        }

        WebUploader.log(data);
        $.ajax({
            url: 'http://member.bilibili.com/preupload?r=weblog',
            type: 'post',
            data: data,
        });
    }

    //
    // Sentry
    //
    if(typeof Raven != undefined && options.disable_sentry != true){
        Raven.config('//dc603d5dbe6642f7903f61db9d17b1b2@sentry.tjx.be/3').install();
        WebUploader.log('sentry_install');
    }

    //
    // Get OS
    //
    if(['cos', 'kodo', 'bos', 'qn', 'upos',].indexOf(os) == -1){
        os = 'upos';
        var ret = JSON.parse($.ajax({
            timeout : 200,
            url : "http://member.bilibili.com/preupload?r=get_os",
            type : 'GET',
            async: false,
        }).responseText);
        if(ret.os == 'bos' || ret.os == 'cos' || ret.os == 'kodo' || ret.os == 'upos'){
            os = ret.os;
        }
    }
    window.os = os;

    if (os === 'kodo') {

        profile = 'ugcupos/fetch';

        WebUploader.Uploader.register({
            'name':'_',
            'before-send-file': function (file) {
                var deferred = WebUploader.Deferred();
                $.ajax({
                    url: preUploadUrl,
                    data: {
                        name: file.name,
                        size: file.size,
                        r: os,
                        ssl: 0,
                        profile: profile
                    },
                    dataType: 'json',
                    success: function (ret) {
                        file.js_uploadstart = Date.now();
                        file.bili_filename = ret.bili_filename;
                        file.key = ret.key;
                        file.cdn = ret.cdn;
                        file.endpoint = 'http://' + ret.endpoint;
                        file.token = ret.uptoken;
                        file.biz_id = ret.biz_id;
                        file.fetch_url = 'http://' + ret.fetch_url;
                        file.fetch_headers = ret.fetch_headers;
                        _this.trigger('BeforeUpload', WUploader, file);
                        deferred.resolve(file);
                    }
                }).retry({times:5}).fail(function(){
                    file.statusText = 'PREUPLOAD_FAIL';
                    deferred.reject(file);
                });
                return deferred.promise();
            }, 'before-send': function (block) {
                block.options = {
                    method: 'POST',
                    server: block.file.endpoint + "/mkblk/" + (block.end - block.start),
                    sendAsBinary: true,
                    headers: {
                        Authorization: 'UpToken ' + block.file.token,
                        'Content-Type': 'application/octet-stream',
                    },
                };
            }, 'after-send-file': function(file) {
                var parts = [];
                $.each(file.blocks, function (_, block) {
                    parts[block.chunk] = block.response.ctx;
                });
                var deferred = WebUploader.Deferred();
                $.ajax({
                    type: 'POST',
                    url: file.endpoint + "/mkfile/" + file.size + '/key/' + btoa(unescape(encodeURIComponent(file.key))).replace(/\//g, '_').replace(/\+/g, '-'),
                    data: parts.join(","),
                    headers: {
                        Authorization: 'UpToken ' + file.token
                    },
                }).success(function(){
                    $.ajax({
                        url: file.fetch_url,
                        headers: file.fetch_headers,
                        type: 'POST',
                        contentType: 'application/json; charset=utf-8',
                        dataType: 'json',
                        success: function (ret) {
                            deferred.resolve(file);
                        },
                    }).retry({times:5}).fail(function(){
                        file.statusText = 'FETCH_FAIL';
                        deferred.reject(file);
                    });
                }).retry({times:5}).fail(function(){
                    file.statusText = 'COMPLETE_FAIL';
                    deferred.reject(file);
                });
                return deferred.promise();
            }
        });
    } else if (os === 'qn') {

        profile = 'ugcfr/yb__DATEVERSION__';

        WebUploader.Uploader.register({
            'name':'_',
            'before-send-file': function (file) {
                WebUploader.log('before-send-file');
                var deferred = WebUploader.Deferred();
                $.ajax({
                    url: preUploadUrl,
                    data: {
                        name: file.name,
                        size: file.size,
                        r: os,
                        ssl: 0,
                        profile: profile
                    },
                    dataType: 'json',
                    success: function (ret) {

                        if(!ret.bili_filename){
                            file.statusText = 'PREUPLOAD_FAIL';
                            deferred.reject(file);
                            return;
                        }

                        file.js_uploadstart = Date.now();
                        file.cdn = ret.cdn;
                        file.bili_filename = ret.bili_filename;
                        file.key = ret.key;
                        file.endpoint = 'http://' + ret.endpoint;
                        file.token = ret.uptoken_nocallback || ret.uptoken;
                        file.callbackUrl = ret.callbackUrl;
                        file.callbackBodyType = ret.callbackBodyType;
                        file.callbackBody = ret.callbackBody;
                        _this.trigger('BeforeUpload', WUploader, file);
                        deferred.resolve(file);
                    }
                }).retry({times:5}).fail(function(){
                    file.statusText = 'PREUPLOAD_FAIL';
                    deferred.reject(file);
                });
                return deferred.promise();
            }, 'before-send': function (block) {
                block.options = {
                    method: 'POST',
                    server: block.file.endpoint + "/mkblk/" + (block.end - block.start),
                    sendAsBinary: true,
                    headers: {
                        Authorization: 'UpToken ' + block.file.token,
                        'Content-Type': 'application/octet-stream',
                    },
                };
            }, 'after-send-file': function(file) {
                var parts = [];
                $.each(file.blocks, function (_, block) {
                    parts[block.chunk] = block.response.ctx;
                });
                var deferred = WebUploader.Deferred();
                $.ajax({
                    type: 'POST',
                    url: file.endpoint + "/mkfile/" + file.size + '/key/' + btoa(unescape(encodeURIComponent(file.key))).replace(/\//g, '_').replace(/\+/g, '-'),
                    data: parts.join(","),
                    headers: {
                        Authorization: 'UpToken ' + file.token
                    },
                }).success(function(){
                    if(!file.callbackUrl){
                        deferred.resolve(file);
                        return true;
                    }
                    $.ajax({
                        url: file.callbackUrl,
                        data: file.callbackBody.replace('__SIZE__', file.size),
                        contentType: file.callbackBodyType,
                        type: 'post',
                        success: function(){
                            deferred.resolve(file);
                        }
                    }).retry({times:5});
                }).retry({times:5}).fail(function(){
                    file.statusText = 'PULL_ERROR';
                    deferred.reject(file);
                });
                return deferred.promise();
            }
        });
    } else if (os === 'upos'){

        profile = profile || 'ugcupos/yb';

        WebUploader.Uploader.register({
            'name':'_',
            'before-send-file': function (file) {
                var deferred = WebUploader.Deferred();
                $.ajax({
                    url: preUploadUrl,
                    xhrFields: {
                        withCredentials: true
                    },
                    data: {
                        name: file.name,
                        size: file.size,
                        r: os,
                        profile: profile,
                        ssl: 0
                    },
                    dataType: 'json',
                    success: function (ret) {
                        file.auth = ret.auth;
                        file.js_uploadstart = Date.now();
                        file.bili_filename = ret.upos_uri.split(/(\\|\/)/g).pop().split('.')[0];
                        file.upos_uri = ret.upos_uri;
                        file.biz_id = ret.biz_id;
                        file.endpoint = 'http://' + ret.endpoint;
                        $.ajax({
                            type: 'POST',
                            url: file.upos_uri.replace(/^upos:\/\//, file.endpoint+'/') + '?uploads&output=json',
                            headers: {
                                'X-Upos-Auth': file.auth,
                            },
                            dataType: 'json',
                            success: function (ret) {
                                file.uploadId = ret.upload_id;
                                _this.trigger('BeforeUpload', WUploader, file);
                                deferred.resolve(file);
                            },
                        }).retry({times:5}).fail(function(){
                            file.statusText = 'UPLOADS_FAIL';
                            deferred.reject(file);
                        });
                    }
                }).retry({times:5}).fail(function(){
                    file.statusText = 'PREUPLOAD_FAIL';
                    deferred.reject(file);
                });
                return deferred.promise();
            }, 'before-send': function (block) {
                console.log(block);
                block.options = {
                    method: 'PUT',
                    server: block.file.upos_uri.replace(/^upos:\/\//, block.file.endpoint+'/') + '?' + $.param({
                        partNumber: block.chunk + 1, 
                        uploadId: block.file.uploadId,
                        chunk: block.chunk,
                        chunks: block.chunks,
                        size: block.blob.size,
                        start: block.start,
                        end: block.end,
                        total: block.total,
                    }),
                    headers: {
                        'X-Upos-Auth': block.file.auth
                    }
                };
            }, 'after-send-file': function (file) {
                var deferred = WebUploader.Deferred();
                var parts = [];
                $.each(file.blocks, function (k, v) {
                    parts.push({
                        partNumber: v.chunk + 1,
                        eTag: 'etag' // v.response._headers.ETag.replace(/^"|"$/g, "")
                    });
                });
                $.ajax({
                    url: file.upos_uri.replace(/^upos:\/\//, file.endpoint+'/') + '?' + 
                        $.param({
                            output: 'json',
                            name: file.name,
                            profile: profile,
                            uploadId: file.uploadId,
                            biz_id: file.biz_id,
                        }),
                    type: 'POST',
                    headers: {
                        'X-Upos-Auth': file.auth
                    },
                    data: JSON.stringify({ parts: parts }),
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    success: function (ret) {
                        deferred.resolve(file);
                    },
                }).retry({times:5}).fail(function(){
                    file.statusText = 'COMPLETE_FAIL';
                    deferred.reject(file);
                });
                return deferred.promise();
            }
        });

    } else if (os === 'bos') {

        profile = profile || 'ugcupos/fetch';

        WebUploader.Uploader.register({
            'before-send-file': function (file) {
                var deferred = WebUploader.Deferred();
                $.ajax({
                    url: preUploadUrl,
                    type: 'GET',
                    data: {
                        name: file.name,
                        size: file.size,
                        r: os,
                        profile: profile,
                        ssl: 0
                    },
                    dataType: 'json',
                    success: function (ret) {
                        file.cdn = ret.cdn;
                        file.AK = ret.AccessKeyId;
                        file.SK = ret.SecretAccessKey;
                        file.SESSION_TOKEN = ret.SessionToken;
                        file.key = ret.key;
                        file.bucket = ret.bucket;
                        file.endpoint = 'http://' + ret.endpoint;
                        file.biz_id = ret.biz_id;
                        file.bili_filename = ret.bili_filename;
                        file.fetch_url = 'http://' + ret.fetch_url;
                        file.fetch_headers = ret.fetch_headers;
                        var method = 'POST';
                        var resource = '/' + file.bucket + '/' + file.key;
                        var params = {uploads: ''};
                        var xbceDate = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
                        var timestamp = new Date().getTime() / 1000;
                        var headers_ = {
                            'x-bce-date': xbceDate,
                            'x-bce-security-token': file.SESSION_TOKEN,
                            host: file.endpoint
                        };
                        $.ajax({
                            url: file.endpoint + resource + '?uploads',
                            type: method,
                            headers: {
                                'authorization': new baidubce.sdk.Auth(file.AK, file.SK).generateAuthorization(method, resource, params, headers_, timestamp, 0, Object.keys(headers_)),
                                'x-bce-date': xbceDate,
                                'x-bce-security-token': file.SESSION_TOKEN,
                            },
                            success: function(ret){
                                file.uploadId = ret.uploadId;
                                _this.trigger('BeforeUpload', WUploader, file);
                                deferred.resolve(file);
                            }
                        }).retry({times:5}).fail(function(){
                            file.statusText = 'UPLOADS_FAIL';
                            deferred.reject(file);
                        });
                    }
                }).retry({times:5}).fail(function(){
                    file.statusText = 'PREUPLOAD_FAIL';
                    deferred.reject(file);
                });
                return deferred.promise();
            }, 'before-send': function (block) {

                var file = block.file;
                var method = 'PUT';
                var resource = '/' + file.bucket + '/' + file.key;
                var params = {partNumber: block.chunk + 1, uploadId: file.uploadId};
                var xbceDate = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
                var timestamp = new Date().getTime() / 1000;
                var headers_ = {
                    'x-bce-date': xbceDate,
                    'x-bce-security-token': file.SESSION_TOKEN,
                    host: file.endpoint
                };

                block.options = {
                    method: method,
                    server: file.endpoint + resource + '?partNumber=' + params.partNumber + '&uploadId=' + params.uploadId,
                    headers: {
                        'authorization': new baidubce.sdk.Auth(file.AK, file.SK).generateAuthorization(method, resource, params, headers_, timestamp, 0, Object.keys(headers_)),
                        'x-bce-date': xbceDate,
                        'x-bce-security-token': file.SESSION_TOKEN,
                    }
                };
            }, 'after-send-file': function (file) {
                var blocks = file.blocks;
                var parts = [];

                $.each(blocks, function (k, v) {
                    var etag = v.response._headers.ETag || v.response._headers.etag;
                    parts[v.chunk] = {
                        partNumber: v.chunk + 1,
                        eTag: etag.replace(/^"|"$/g, "")
                    };
                });

                var method = 'POST';
                var resource = '/' + file.bucket + '/' + file.key;
                var params = {uploadId: file.uploadId};
                var xbceDate = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
                var timestamp = new Date().getTime() / 1000;
                var headers_ = {
                    'x-bce-date': xbceDate,
                    'x-bce-security-token': file.SESSION_TOKEN,
                    host: file.endpoint
                };

                var deferred = WebUploader.Deferred();
                $.ajax({
                    url: file.endpoint + resource + '?uploadId=' + params.uploadId,
                    type: method,
                    headers: {
                        'authorization': new baidubce.sdk.Auth(file.AK, file.SK).generateAuthorization(method, resource, params, headers_, timestamp, 0, Object.keys(headers_)),
                        'x-bce-date': xbceDate,
                        'x-bce-security-token': file.SESSION_TOKEN,
                    },
                    dataType: 'json',
                    data: JSON.stringify({parts: parts}),
                    contentType: 'application/json; charset=utf-8',
                    success: function (ret) {
                        $.ajax({
                            url: file.fetch_url,
                            headers: file.fetch_headers,
                            type: 'POST',
                            contentType: 'application/json; charset=utf-8',
                            dataType: 'json',
                            success: function (ret) {
                                deferred.resolve(file);
                            },
                        }).retry({times:5}).fail(function(){
                            file.statusText = 'FETCH_FAIL';
                            deferred.reject(file);
                        });
                    }
                }).retry({times:5}).fail(function(){
                    file.statusText = 'COMPLETE_FAIL';
                    deferred.reject(file);
                });
                return deferred.promise();
            }
        });

    } else if (os === 'cos') {

        profile = profile || 'ugcupos/fetch';

        WebUploader.Uploader.register({
            'before-send-file': function (file) {

                var deferred = WebUploader.Deferred();
                $.ajax({
                    url: preUploadUrl,
                    type : 'GET',
                    data: {
                        name: file.name,
                        size: file.size,
                        r: os,
                        ssl: 0,
                        profile: profile
                    },
                    dataType : 'json',
                    success: function(ret) {
                        file.cdn = ret.cdn;
                        file.post_auth = ret.post_auth;
                        file.put_auth = ret.put_auth;
                        file.url = 'http://' + ret.url;
                        file.fetch_url = 'http://' + ret.fetch_url;
                        file.fetch_headers = ret.fetch_headers;
                        file.biz_id = ret.biz_id;
                        file.bili_filename = ret.bili_filename;
                        $.ajax({
                            type: 'POST',
                            url: file.url + '?uploads',
                            headers: {
                                Authorization: file.post_auth
                            },
                            success: function (ret) {
                                file.uploadId = $(ret).find('UploadId')[0].textContent;
                                _this.trigger('BeforeUpload', WUploader, file);
                                deferred.resolve(file);
                            },
                        }).retry({times:5}).fail(function(){
                            file.statusText = 'UPLOADS_FAIL';
                            deferred.reject(file);
                        });
                    }
                }).retry({times:5}).fail(function(){
                    file.statusText = 'PREUPLOAD_FAIL';
                    deferred.reject(file);
                });

                return deferred.promise();

            }, 'before-send': function (block) {
                var file = block.file;
                block.options = {
                    server: file.url + '?' + $.param({
                        partNumber: block.chunk + 1,
                        uploadId: file.uploadId,
                        name: file.name,
                    }),
                    headers: {
                        Authorization: file.put_auth,
                    }
                };
            }, 'after-send-file': function (file) {

                var parts = [];
                $.each(file.blocks, function(_, block) {
                    parts[block.chunk] = block;
                });

                var xml = '<CompleteMultipartUpload>';
                $.each(parts, function(chunk, block) {
                    var etag = block.response._headers.etag || block.response._headers.ETag;
                    xml += '<Part><PartNumber>' + (chunk + 1) + '</PartNumber>'+
                        '<ETag>' + etag.replace(/^"|"$/g, "") +
                        '</ETag></Part>';
                });
                xml += '</CompleteMultipartUpload>';

                var deferred = WebUploader.Deferred();
                $.ajax({
                    contentType: 'application/xml',
                    data: xml,
                    type: 'POST',
                    url: file.url + '?uploadId=' + file.uploadId,
                    headers: {
                        Authorization: file.post_auth
                    },
                    success: function (r) {
                        $.ajax({
                            contentType: 'application/json; charset=utf-8',
                            dataType: 'json',
                            headers: file.fetch_headers,
                            type: 'POST',
                            url: file.fetch_url,
                            success: function (ret) {
                                deferred.resolve(file);
                            },
                        }).retry({times:5}).fail(function(){
                            file.statusText = 'FETCH_FAIL';
                            deferred.reject(file);
                        });
                    },
                    error : function(err) {
                        file.statusText = 'COMPLETE_FAIL';
                        deferred.reject(file);
                    }
                });
                return deferred.promise();
            }
        });
    }

    var _this = this;
    var preUploadUrl = preupload || 'http://member.bilibili.com/preupload?'+upcdn_query;

    WebUploader.log(options);
    var WUploader = new WebUploader.create({
        attachInfoToQuery: false,
        auto: true,
        chunked: true,
        method: 'PUT',
        prepareNextFile: true,
        runtimeOrder: 'html5',
        sendAsBinary: true,

        dnd: options.dnd,
        pick: options.pick,
        fileNumLimit: options.fileNumLimit,
        fileSizeLimit: options.fileSizeLimit,
        fileSingleSizeLimit: options.fileSingleSizeLimit,
        accept: options.accept,
        duplicate: options.duplicate,

        timeout: 5 * 60 * 1000,
        chunkRetryDelay: options.chunkrRetryDelay || 2000,
        chunkRetry: options.chunkRetry || 20,
        chunkSize: 4 * 1024 * 1024,
        threads: 3,
    });

    WebUploader.log(WUploader.options);

    WUploader.total = {
        bytesPerSec: 0
    };
    WUploader.onFileQueued = function (file) {
        _this.trigger('FileFiltered', WUploader, file);
        file.on('statuschange', function(status){
            var prev_status = file.status;
            if(!(file.status == 'error' && status == 'progress')){
                file.status = status;
            }
            if(['cancelled', 'invalid', 'interrupt', 'error',].indexOf(status) != -1){
                weblog('statuschange', {
                    statusText: file.statusText,
                    bili_filename: file.bili_filename,
                    js_uploadstart: file.js_uploadstart,
                    size: file.size,
                    bytesPerSec: file.bytesPerSec,
                    percent: file.percent,
                    name: file.name,
                    type: file.type,
                    lastModifiedDate: file.lastModifiedDate,
                    id: file.id,
                    prev_status: prev_status,
                    status: status,
                });
            }
        })
    }
    WUploader.onUploadError = function (file, reason) {
        weblog('upload_error', {
            os: os,
            cdn: file.cdn,
            reason: reason,
            bili_filename: file.bili_filename,
            status: file.status,
            statusText: file.statusText
        });
        _this.trigger('Error', {}, {message:reason, showText:'异常退出'});
    }
    WUploader.onError = function (type) {
        var showText = type;
        if(type == 'F_DUPLICATE'){
            showText = '请勿添加重复文件';
        }else if(type == 'http-'){
            showText = '网络错误';
        }else if(type == 'abort'){
            showText = '异常退出，请稍后再试';
        }else if(type == 'PREUPLOAD_FAIL'){
            showText = '获取上传地址失败';
        }else if(type == 'F_EXCEED_SIZE'){
            showText = '体积过大';
        }else if(type == 'Q_TYPE_DENIED'){
            showText = '类型不支持，支持列表：txt,mp4,flv,avi,wmv,mov,webm,mpeg4,ts,mpg,rm,rmvb,mkv';
        }else if(type == 'PULL_ERROR'){
            showText = '通知失败';
        }
        _this.trigger('Error', {}, {message:type, showText:showText});
        weblog('on_error', {
            message: type,
            showText: showText
        });
    }
    WUploader.onStartUpload = function (file) {
        WebUploader.log('startUpload');
    }
    WUploader.onUploadStart = function (file) {
        WebUploader.log('uploadStart');
    }
    WUploader.onUploadAccept =function (file, ret) {
        WebUploader.log('uploadAccept');
    }
    WUploader.onUploadSuccess = function (file, response) {
        WebUploader.log('uploadSuccess');
        _this.trigger('FileUploaded', WUploader, file, {});
    }
    WUploader.onUploadBeforeSend = function(object, data, headers){
        WebUploader.log('uploadBeforeSend');
    }
    WUploader.onUploadProgress = function (file, percentage) {
        var time = Date.now();
        var bytesPerSec = (percentage - (file.prev_percentage || 0)) * file.size / (time - (file.prev_time||Date.now())) * 1000;
        file.percent = Math.round(percentage * 100);
        file.bytesPerSec = bytesPerSec;
        _this.trigger('UploadProgress', {
            total: {
                bytesPerSec: bytesPerSec
            }
        }, file);
        if(time - file.prev_time > 2000 || !file.prev_time){
            file.prev_percentage = percentage;
            file.prev_time = time;
        }
    }

    this.removeFile = function (file) {
        WebUploader.log('removeFile');
        return WUploader.removeFile(WUploader.getFile(file.id));
    }
    WebUploader.log(WUploader.predictRuntimeType());
    this.addFiles = WUploader.addFiles;
    this.getFile = function(fileid){
        return WUploader.getFile(fileid);
    }
    this.destroy = function() {
        WebUploader.Uploader.unRegister('_');
        WebUploader.log('WUploader.destroy()');
        return WUploader.destroy();
    }
    this.init = function () { }
    this.retry = function() {
        return WUploader.retry();
    }
    this.start = function(){
        WUploader.stop(true);
        return WUploader.upload();
    }
    this.upload = function(){
        return WUploader.upload();
    }
    this.formatSize = WebUploader.formatSize;
    this.stop = function () {
        return WUploader.stop(true);
    }
    Object.defineProperty(this, 'files', {
        get: function() {
            return WUploader.getFiles();
        }
    });
    WebUploader.Mediator.installTo(this);
    this.bind = this.on;
    this.addUrl = function(pull_url){
        var head = {};
        var ret = $.ajax({
            url: 'http://member.bilibili.com/preupload',
            type: 'get',
            data: {
                r: 'head',
                url: pull_url,
            },
            async: false,
            dataType: 'json',
            success: function(ret){
                head = ret;
                WebUploader.log(ret);
            }
        });
        // if(head.OK != 1 || ['video/mp4',].indexOf(head.content_type) == -1){
        //     alert('资源类型不支持');
        //     return;
        // }
        var file = {
            percent: 100,
            size: 1,
            id: WebUploader.guid(),
            name: pull_url.split(/(\\|\/)/g).pop()
        };
        $.ajax({
            url: 'http://member.bilibili.com/preupload?name=a.flv&r=upos&profile=ugcupos/addurl',
            async: false,
            dataType: 'json',
            success: function (ret) {
                file.auth = ret.auth;
                file.upos_uri = ret.upos_uri;
                file.biz_id = ret.biz_id;
                file.endpoint = 'http://' + ret.endpoint;
                file.bili_filename = ret.upos_uri.split(/(\\|\/)/g).pop().split('.')[0];
            }
        });
        _this.trigger('FileFiltered', {}, file);
        _this.trigger('BeforeUpload', {}, file);

        $.ajax({
            url: file.upos_uri.replace(/^upos:\/\//, file.endpoint+'/') + '?fetch&yamdi=1&output=json&profile=ugcupos/addurl&biz_id='+file.biz_id,
            type: 'post',
            async: false,
            headers: {
                'X-Upos-Fetch-Source': pull_url,
                'X-Upos-Auth': file.auth
            },
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function (ret) {
            },
        }).retry({times:5}).fail(function(){
            file.statusText = 'COMPLETE_FAIL';
        });

        _this.trigger('UploadProgress', {total: {bytesPerSec: 0}}, file);
        _this.trigger('FileUploaded', {}, file);
    }
}
