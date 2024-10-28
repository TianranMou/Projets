window.onload = function () {
    // 创建 SlideBox 对象
    const slideBox = new SlideBox([
        {
            img: "Advertise1.jpg",
           
        },
        {
            img: "Advertise1.jpg"
            
        },
        {
            img: "Advertise2.jpg"
            
        },
        // 可以继续增加图片
        {
            img: "Advertise2.jpg"
            
        },
        {
            img: "Advertise3.jpg"
            
        }
    ]);
    slideBox.init();
}

class SlideBox {
    constructor(bannerImgs = []) {
        // 轮播图数据数组
        this.bannerImgs = bannerImgs;
        // 计页器, 记录当前页面(不可直接操作变值)
        this._pageIndex = 0;
        // 缓动时长，单位 s
        this.slowTime = 0.5;

        // 获取需要的 DOM 对象
        this.slideBoxDom = document.querySelector(".slide-box") || null;
        this.slideBtnLeftDom = document.querySelector(".slide-btn-left") || null;
        this.slideBtnRightDom = document.querySelector(".slide-btn-right") || null;
        this.bannerDom = document.querySelector(".banner") || null;
        this.paginationBoxDom = document.querySelector(".pagination-box") || null;

        // 节流器（先执行）
        this.throttle = (() => {
            let timer = null;
            return function (fn, cb) {
                if (timer) return;
                fn();
                timer = setTimeout(() => {
                    timer = null;
                    cb();
                }, this.slowTime * 1000);
            }
        })();

        // 计时器
        this.slideTimer = null;

    }

    get pageIndex() {
        return this._pageIndex;
    }

    // 用来监听计页器变化，根据变化来变换页面
    set pageIndex(num) {
        this.throttle(() => {
            this.changePage(num, true);
            // 轮播至左右最后图片时，更改 num, 以实现无缝切换
            if(num === -1) {
                num = this.bannerImgs.length - 1;
            } else if (num === this.bannerImgs.length) {
                num = 0;
            }
            this.changePagination(num, this._pageIndex)
        }, () => {
            // 缓动结束时触发，为实现无缝切换
            this.changePage(num, false);
            this._pageIndex = num;
        });

    }

    init() {
        this.drawDOM(this.pageIndex);

        // 监听事件
        this.slideBtnLeftDom.addEventListener("click", () => {
            this.pageIndex--;
        });
        this.slideBtnLeftDom.addEventListener("mouseout", () => {
            this.playSlide();
        });
        this.slideBtnLeftDom.addEventListener("mouseover", () => {
            this.stopSlide();
        });

        this.slideBtnRightDom.addEventListener("click", () => {
            this.pageIndex++;
        });
        this.slideBtnRightDom.addEventListener("mouseout", () => {
            this.playSlide();
        });
        this.slideBtnRightDom.addEventListener("mouseover", () => {
            this.stopSlide();
        });

        this.paginationBoxDom.addEventListener("mouseout", () => {
            this.playSlide();
        });
        this.paginationBoxDom.addEventListener("mouseover", () => {
            this.stopSlide();
        });

        // 启动轮播
        this.playSlide();
    }

    // 启动自动轮播
    playSlide() {
        this.slideTimer = setInterval(() => {
            this.pageIndex++;
        }, 4000);
    }

    // 停止自动轮播
    stopSlide() {
        clearInterval(this.slideTimer);
    }

    // 更改当前页面
    changePage(index, isAnim) {
        this.bannerDom.style.transition = !!isAnim ? `left ${this.slowTime}s` : "none";
        this.bannerDom.style.left = `${(-index -1) * 100}%`;
    }

    // 更改当前圆点
    changePagination(index, oldIndex) {
        this.paginationBoxDom.children[oldIndex].classList.remove("chose");
        this.paginationBoxDom.children[index].classList.add("chose");
    }

    // 渲染 DOM
    drawDOM(pageIndex) {
        // 轮播图前后各增加多一项，用来实现无缝切换
        this.bannerDom.innerHTML = [
            this.getBannerItemHTML(this.bannerImgs[this.bannerImgs.length - 1]),
            this.bannerImgs.reduce((html, item) => {
                return html + this.getBannerItemHTML(item);
            }, ''),
            this.getBannerItemHTML(this.bannerImgs[0])
        ].join("");
        this.changePage(pageIndex, false);

        // 底下的圆点
        this.bannerImgs.forEach((item, i) => {
            const span = document.createElement("span");
            span.style.transition = `all ${this.slowTime}s`;
            if(i === pageIndex) {
                span.classList.add("chose");
            }
            span.addEventListener("click", () => {
                this.pageIndex = i;
            });
            this.paginationBoxDom.append(span);
        })
    }

    // 获取 banner-item Dom字符串，用来动态渲染 DOM
    getBannerItemHTML(bannerImg) {
        return `
            <div class="banner-item" 
                style="background-image: url(../control/domo2/images/${bannerImg.img});">
            </div>
        `
    }
//     <div class="bi-content">
//     <h1>
//         <span>${bannerImg.title}</span>
//     </h1>
//     <button><span>了解详情</span></button>
// </div>
}