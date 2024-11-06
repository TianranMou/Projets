window.onload = function () {

    const slideBox = new SlideBox([
        {
            img: "Ad1.png",
           
        },
        {
            img: "Ad2.png"
            
        },
        {
            img: "Ad3.png"
            
        },

        {
            img: "Ad2.jpg"
            
        },
        {
            img: "Ad1.jpg"
            
        }
    ]);
    slideBox.init();
}

class SlideBox {
    constructor(bannerImgs = []) {

        this.bannerImgs = bannerImgs;

        this._pageIndex = 0;

        this.slowTime = 0.5;


        this.slideBoxDom = document.querySelector(".slide-box") || null;
        this.slideBtnLeftDom = document.querySelector(".slide-btn-left") || null;
        this.slideBtnRightDom = document.querySelector(".slide-btn-right") || null;
        this.bannerDom = document.querySelector(".banner") || null;
        this.paginationBoxDom = document.querySelector(".pagination-box") || null;


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


        this.slideTimer = null;

    }

    get pageIndex() {
        return this._pageIndex;
    }

    set pageIndex(num) {
        this.throttle(() => {
            this.changePage(num, true);

            if(num === -1) {
                num = this.bannerImgs.length - 1;
            } else if (num === this.bannerImgs.length) {
                num = 0;
            }
            this.changePagination(num, this._pageIndex)
        }, () => {

            this.changePage(num, false);
            this._pageIndex = num;
        });

    }

    init() {
        this.drawDOM(this.pageIndex);


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


        this.playSlide();
    }


    playSlide() {
        this.slideTimer = setInterval(() => {
            this.pageIndex++;
        }, 4000);
    }

    stopSlide() {
        clearInterval(this.slideTimer);
    }


    changePage(index, isAnim) {
        this.bannerDom.style.transition = !!isAnim ? `left ${this.slowTime}s` : "none";
        this.bannerDom.style.left = `${(-index -1) * 100}%`;
    }


    changePagination(index, oldIndex) {
        this.paginationBoxDom.children[oldIndex].classList.remove("chose");
        this.paginationBoxDom.children[index].classList.add("chose");
    }


    drawDOM(pageIndex) {

        this.bannerDom.innerHTML = [
            this.getBannerItemHTML(this.bannerImgs[this.bannerImgs.length - 1]),
            this.bannerImgs.reduce((html, item) => {
                return html + this.getBannerItemHTML(item);
            }, ''),
            this.getBannerItemHTML(this.bannerImgs[0])
        ].join("");
        this.changePage(pageIndex, false);


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


    getBannerItemHTML(bannerImg) {
        return `
            <div class="banner-item" 
                style="background-image: url(./images/${bannerImg.img});">
            </div>
        `
    }
//     <div class="bi-content">
//     <h1>
//         <span>${bannerImg.title}</span>
//     </h1>
//     <button><span>for details</span></button>
// </div>
}