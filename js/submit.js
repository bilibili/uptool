function renderSubmit() {
    if (window.module) {
        module = window.module;
    }

    if (window.require) {
        require = window.require;
    }

    videoqueue = [];

    // // Query all cookies.
    // const { session } = require('electron').remote;

    // // Query all cookies.
    // session.defaultSession.cookies.get({ name: 'bili_jct' }, (error, cookies) => {
    //     console.log(error, cookies);
    //     csrf = cookies[0]['value'];
    // })
    const { ipcRenderer } = require('electron');
    function dev_tool() {
        ipcRenderer.send('dev_tool', 'dev_tool');
    }
    function win_minimize() {
        ipcRenderer.send('win_minimize', 'win_minimize');
    }
    function win_hide() {
        ipcRenderer.send('win_hide', 'win_hide');
    }
    if (typeof module === 'object') {
        window.module = module;
        module = undefined;
    }
    if (typeof require === 'object') {
        window.require = require;
        require = undefined;
    }

    function addurl() {
        //var pull_url = prompt('请输入Url', 'https://bvcstatic.acgvideo.com/tjx-2900k.mp4');
        var pull_url = prompt('请输入Url', 'http://api.live.bilibili.com/live_stream/v1/record/playurl?rid=118988');
        if (!pull_url) {
            return;
        }
        ybup.addUrl(pull_url);
    }

    function getParam(key) {
        var vars = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
            function (m, key, value) {
                vars[key] = value;
            });
        return vars[key];
    }
    var os = getParam('os');

    function openNewTab(link) {
        var frm = $('<form   method="get" action="' + link + '" target="_blank"></form>');
        $("body").append(frm);
        frm.submit().remove();
    }

    $('#os').html(os);

    // $("input[name=copyright]").change(function () {
    //     $("[name=tid]").attr("disabled", 1);
    //     $("[name=source]").attr("disabled", 1);
    //     $("[copyright=" + this.value + "]").removeAttr('disabled');
    //     if (this.value == 2) {
    //         $("[name=source]").removeAttr('disabled');
    //     }
    // });

    $('#stop').click(function () {
        ybup.stop();
    });
    $('#destroy').click(function () {
        ybup.destroy();
    });
    $('#start').click(function () {
        ybup.start();
    });
    $('#retry').click(function () {
        ybup.retry();
    });
    $('#upload').click(function () {
        ybup.upload();
    });



    $("form").submit(function () {
        var videos = [];
        var file = null;
        var i = null;
        for (i in ybup.files) {
            file = ybup.files[i];
            if (videoqueue.includes(file.bili_filename)) {
                if (file.uploaded) {
                    videos.push({
                        desc: "",
                        filename: file.bili_filename,
                        title: file.name.substring(0, file.name.lastIndexOf('.')),
                    });
                } else {
                    var notif = new Notification('有正在进行的上传，请等待完成或取消');
                    return false;
                }
            }
        }
        console.log(videos);

        var formData = $('form').serializeArray();
        var req = { videos: videos };
        formData.forEach(function (obj) {
            if (['copyright', 'tid'].indexOf(obj.name) >= 0) {
                req[obj.name] = parseInt(obj.value);
            } else {
                req[obj.name] = obj.value;
            }
        });

        if (videos.length == 0) {
            var notif = new Notification('请至少添加一个视频');
            return false;
        }

        if (!req.title) {
            var notif = new Notification('稿件标题不能为空');
            return false;
        }

        if (!req.tag) {
            var notif = new Notification('标签不能为空');
            return false;
        }
        req.tag = req.tag.replace(/，/g, ",");

        if (!req.copyright) {
            var notif = new Notification('自制/转载不能为空');
            return false;
        }

        if (!req.tid) {
            var notif = new Notification('分区必须选择');
            return false;
        }

        if (videos.length > 1 && 0 <= ['145', '146', '147', '83'].indexOf(req.tid)) {
            var notif = new Notification('这四个分区只能提交单个视频：欧美电影，日本电影，国产电影，其它国家');
            return false;
        }

        if (!req.desc) {
            var notif = new Notification('视频简介不能为空');
            return false;
        }

        $.ajax({
            type: 'POST',
            url: 'http://member.bilibili.com/x/vu/web/add?csrf=' + csrf,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(req),
            dataType: 'json',
            success: function (result) {
                console.log(result);
                if (result.code == 0) {
                    // if (confirm('成功！前往稿件管理？(需等待大概1分钟才会有)')) {
                    //     openNewTab("http://member.bilibili.com/v/#!/article");
                    // }
                    // setTimeout(function () { window.location = window.location }, 500);
                    var notif = new Notification("上传成功！");

                } else {
                    var notif = new Notification(result.message);
                }
            }
        });

        return false;
    });
    var ybup = null;

    function cancel(fileid) {
        if (confirm('确认取消上传？')) {
            var file = ybup.getFile(fileid);
            ybup.removeFile(file);
            $('#' + fileid).remove();
            file.destroy();
            file.uploaded = false;
            videoqueue = videoqueue.filter(e => e !== file.bili_filename);

        }
    }

    // $(window).load(function () {

        $('#jinshuju').attr("href", "https://jinshuju.net/f/Yi4HfA?x_field_1=" + os);
        $('input[name=url][value="' + window.location.search + '"]').attr('checked', true);
        $('input[name=url]').click(function (e) {
            if (confirm('放弃正在进行的上传？')) {
                window.location = $(e.target).val();
            } else {
                return false;
            }
        });

        // toastr.warning('在Chrome浏览器中，如果当前上传页面处于非激活状态(浏览器窗口最小化或者用户切到其他Tab去了)，本页面的多线程加速将失效<br>为了避免这种情况，推荐在非激活状态运行本页面的用户使用<a target=_blank href="http://www.pc6.com/softview/SoftView_11915.html">火狐浏览器</a>，另外给出网速监控软件用于验证 <a target=_blank href="http://www.xiazaiba.com/html/68216.html">BandwidthMonitor</a><br>');

        window.rec_rp = window.rec_rp || function () { (rec_rp.q = rec_rp.q || []).push(arguments) };
        rec_rp("pageview");

        // var obj = JSON.parse($.ajax({
        //     timeout : 1000,
        //     url : "//member.bilibili.com/v/account/myinfo",
        //     type : 'GET',
        //     async: false,
        // }).responseText);
        // if(obj.code!==0 || !obj.data.activated || obj.data.banned || obj.data.level < 2){
        //     alert('请登录');
        //     location='https://passport.bilibili.com/login';
        // }

        // if([
        //         'kodo',
        //         'bos',
        //         'cos',
        //         'oss',
        //         'qn',
        //         'bili',
        //         'upos',
        // ].indexOf(os) == -1){
        //     window.location = '?os=qn';
        //     return;
        // }

        ybuploader.get_upcdns(function (upcdns) {

            console.log(upcdns);
            var upcdn = upcdns[0] || {};

            //
            // 更多参数详见
            // WebUploader API文档 - Web Uploader
            // http://fex.baidu.com/webuploader/doc/index.html#WebUploader_Uploader_options
            //
            ybup = new ybuploader.Ybuploader(upcdn.os, {
                dnd: '#selectfiles',
                auto: false,
                pick: {
                    id: '#selectfiles',
                    multiple: true
                },
                accept: {
                    mimeTypes: '.txt,.mp3,.mp4,.flv,.avi,.wmv,.mov,.webm,.mpeg4,.ts,.mpg,.rm,.rmvb,.mkv',
                    title: 'default',
                },
                chunkRetry: 10,
                chunkRetryDelay: 5000,
                duplicate: false,
                fileSingleSizeLimit: 4 * 1024 * 1024 * 1024, // '4GB'
                // browse_button: ['selectfiles'],
                // multi_selection: true,
                // runtimes: 'html5',
                // rename: true,
                // drop_element: '#selectfiles'
            }, 'ugcupos/yb', null, upcdn.query);

            ybup.bind('UploadProgress', function (up, file) {
                var speed = ybup.formatSize(up.total.bytesPerSec) + '/s - ' + os;
                $('#' + file.id + '>.state').html(file.percent + '% ' + speed);
                $('#' + file.id + '>.progress').val(file.percent);
            });
            ybup.bind('FileFiltered', function (up, file) {
                $('#filelist').append(
                    '<div id="' + file.id + '">' +
                    '<a onclick=cancel("' + file.id + '") href="javascript:void(0);" class=cancel>取消</a>' + ' ' +
                    file.name + ' </br> ' +
                    ybup.formatSize(file.size) +
                    ' <b class=state></b> ' +
                    ' <progress value=0 max=100 class="progress"></progess> ' +
                    '<span class=bili_filename></span> ' +
                    '</div>'
                );
                if (!$('#title').val()) {
                    $('#title').val(file.name.substring(0, file.name.lastIndexOf('.')));
                }

                videoqueue.push(file.bili_filename);
            });

            ybup.bind('FileUploaded', function (up, file, info) {
                file.uploaded = true;
                $('#' + file.id + '>.state').html('上传成功');
                if ($('#auto_submit').is(':checked')) {
                    $("form").submit();
                }
                ipcRenderer.send('upload_complete', file.name);
            });

            ybup.bind('Error', function (up, err) {
                var notif = new Notification(err.showText);
            });

            ybup.bind('BeforeUpload', function (up, file) {
                console.log('BeforeUpload');
                console.log('bili_filename: ' + file.bili_filename);
                console.log($('#' + file.id));
                console.log($('#' + file.id + '>.bili_filename'));
                $('#' + file.id + '>.bili_filename').html(file.bili_filename);
            });
            ybup.init();

        })

    // });
}