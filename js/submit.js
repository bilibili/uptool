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
        if (index >= 0) {
            videos.splice(index, 1);
        }
    }
}

