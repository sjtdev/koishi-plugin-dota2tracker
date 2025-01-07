# 模板说明

### 对局信息模板 `match`

##### match_1


<!-- <div id="iframe-container" style="position: relative; height: 1000px; overflow: hidden;">
    <iframe
        id="scaled-iframe"
        src="./html/zh-CN_match_1.html"
        style="
            position: absolute;
            transform-origin: top left;
            border: none;
            overflow: hidden;
        "
    ></iframe>
</div> -->

<!-- <script>
  let iframeWidth;
  let iframeHeight;
  let iframeAspectRatio;
    function resizeIframe() {
        const iframe = document.getElementById('scaled-iframe');
        const container = document.getElementById('iframe-container');
        iframeWidth = iframeWidth ?? iframe.contentWindow.document.body.scrollWidth;
        iframeHeight = iframeHeight ?? iframe.contentWindow.document.body.scrollHeight;
        iframeAspectRatio = iframeAspectRatio ?? iframeWidth / iframeHeight;
        const containerWidth = container.clientWidth;
        const containerHeight = containerWidth / iframeAspectRatio;
        
        iframe.style.width=`${containerWidth}px`;
        container.style.height=iframe.style.height=`${containerHeight}px`;
        iframe.contentWindow.document.body.style.transform = `scale(${containerWidth/iframeWidth-0.02})`
        iframe.contentWindow.document.body.style.transformOrigin = `0 0`
        iframe.contentWindow.document.body.style.overflow = "hidden"
    }

    window.addEventListener('load', resizeIframe);
    window.addEventListener('resize', resizeIframe);
    window.onload=resizeIframe;
</script> -->

<iframe src="./html/zh-CN_match_1.html" width="100%" height="500px" frameborder="0">
</iframe>
