var ybup = null;

function cancel(fileid, videos) {
    console.log(videos)
    if (confirm('确认取消上传？')) {
        var file = ybup.getFile(fileid);
        ybup.removeFile(file);
        $('#' + fileid).remove();
        file.destroy();
        file.uploaded = false;

        index = videos.indexOf(file);
        if (index>=0) {
            videos.splice(index, 1);
        }
    }
}

function renderSubmit(self) {
    if (window.module) {
        module = window.module;
    }

    if (window.require) {
        require = window.require;
    }

    // // Query all cookies.
    // const { session } = require('electron').remote;

    // // Query all cookies.
    // session.defaultSession.cookies.get({ name: 'bili_jct' }, (error, cookies) => {
    //     console.log(error, cookies);
    //     csrf = cookies[0]['value'];
    // })

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
                console.log(self.videos);
            });
            ybup.bind('FileFiltered', function (up, file) {
                file.percent=0
                file.status=""
                self.videos.push(file)
            });

            ybup.bind('FileUploaded', function (up, file, info) {
                file.uploaded = true;
                file.status="complete"
                // $('#' + file.id + '>.state').html('上传成功');
                // if ($('#auto_submit').is(':checked')) {
                //     $("form").submit();
                // }
                new Notification("上传成功", {body: file.name});
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