class LazyLoadImage {
    
    constructor(option) {
        this.Version = '0.1';
        this.option = option;
        this.domList = [];
        this.imageCount = 0;

        this._init();
    }

    /**
     * 初始化
     * 
     * @memberof LazyLoadImage
     */
    _init() {
        this._initImageList();
    }


    /**
     * 初始化图片元素
     * 
     * @memberof LazyLoadImage
     */
    _initImageList() {
        let dom = document.querySelectorAll('[data-imageload]');

        dom.forEach((item) => {
            let result = this._getElePosition(item);
            let isImage = item.tagName == 'IMG'? true : false; //是否图片标签， 否就使用background-image
            let srcLink;

            if(isImage) {
                srcLink = item.src;
                item.src = null;
            }else {
                let style = window.getComputedStyle(item, null);
                let srcRegex = style.getPropertyValue('background-image').match(/url\(['"](.*?)['"]\)/);
                if(srcRegex) {
                    srcLink = srcRegex[1];
                }
                item.style.backgroundImage = null;
            }

            let imgObj = {
                dom: item,
                src: srcLink,
                isImage
            }

            //元素顶部距离不能改变
            Object.defineProperty(imgObj, 'top', {
                value: result,
                writable: false,
                configurable: false,
                enumerable: true,
            })
            console.log(imgObj)
            this.domList.push(imgObj);
        })
        
        this.domList.sort(this._sortImageList)
        this._preloadImage();
    }

    /**
     * 数据列排序
     * 
     * @memberof LazyLoadImage
     */
    _sortImageList(a, b) {
        return a.top > b.top;
    }
    
    _preloadImage() {
        console.log(this.imageCount, this.domList.length);
        if(this.imageCount == this.domList.length) {
            console.log('已遍历成功');
            return false;
        }

        let image = new Image();
        let domObj = this.domList[this.imageCount];
        image.src = domObj.src;
        image.onload = () => {
            console.log(this.domList[this.imageCount]['dom']);
            if(domObj['isImage']) {
                domObj['dom'].src = domObj['src'];
            }else {
                domObj['dom'].style.backgroundImage = 'url(' + domObj['src'] + ')';
            }
            this.imageCount++;
            this._preloadImage();
        }

        image.onerror = (err) => {
            console.log(this.imageCount + '张');
            console.log(err, '加载失败;');
            this.imageCount++;
            this._preloadImage();
        }
    }

    /**
     * 获取当前dom元素顶部距离
     * 
     * @param {any} element 
     * @returns 
     * @memberof LazyLoadImage
     */
    _getElePosition(element) {
        var topPosition = 0;

        while(element) {
            topPosition += (element.offsetTop - element.scrollTop + element.clientTop);
            element = element.offsetParent;
        }

        return topPosition;
    }
}

new LazyLoadImage()