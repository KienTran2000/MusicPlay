const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE = 'KIENTRAN'

const player = $('.player')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const reaptBtn = $('.btn-repeat')
const playlist = $('.playlist')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config:JSON.parse(localStorage.getItem(PLAYER_STORAGE))||{},
    songs: [
        {
            name: 'Nevadar',
            singer: 'Vicetone',
            path: './music/Nevada-Vicetone-4494556.mp3',
            image: './img/musicparentslogo_orig.png'
        },
        {
            name: 'Wake Me Up',
            singer: 'Avicii',
            path: './music/WakeMeUpRadioEdit-Avicii-5502881.mp3',
            image: './img/192072-large-avicii-wake-me-up.jpg'
        },
        {
            name: 'Waiting For Love',
            singer: 'Avicii',
            path: './music/WaitingForLove-Avicii-4203283.mp3',
            image: './img/waitingforlove.png'
        },
        {
            name: 'Intentions',
            singer: 'Justin Bieber, Quavo',
            path: './music/Intentions - Justin Bieber, Quavo.mp3',
            image: './img/Intention.jpg'
        },
        {
            name: 'Reality',
            singer: 'Lost Frequencies, Janieck Devy',
            path: './music/Reality - Lost Frequencies Janieck Devy (NhacPro.net).mp3',
            image: './img/artworks-000148774359-45ixfl-t500x500.jpg'
        },
        {
            name: 'Girl Like You',
            singer: 'Maroon 5',
            path: './music/GirlsLikeYou-Maroon5CardiB-5519390.mp3',
            image: './img/artworks-000386942226-i4u2y9-t500x500.jpg'
        },
        {
            name: 'Pay Phone',
            singer: 'Marron 5',
            path: './music/Payphone - Maroon 5, Wiz Khalifa.mp3',
            image: './img/cbb5a7e8962795d1cccfbe72c709450c.jpg'
        },
        {
            name: 'Memories',
            singer: 'Marron 5',
            path: './music/Memories-Maroon5-6091839.mp3',
            image: './img/maroon-5-memories.jpg'
        },

    ],
    setConfig:function(key,value){
        this.config[key]=value;
        localStorage.setItem(PLAYER_STORAGE,JSON.stringify(this.config))
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}"data-index="${index}">
            <div class="thumb" style="background-image: url('${song.image}')">
            </div>
            <div class="body">
              <h3 class="title">${song.name}</h3>
              <p class="author">${song.singer}</p>
            </div>
            <div class="option">
              <i class="fas fa-ellipsis-h"></i>
            </div>
          </div>
            `
        })
        playlist.innerHTML = htmls.join('')
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function () {
        const _this = this
        const cd = $('.cd')
        const cdWidth = cd.offsetWidth
        //X??? l?? CD quay/d???ng
        const cdThumbAnimate = cdThumb.animate([{
            transform: 'rotate(360deg)'
        }], {
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        //X??? l?? ph??ng to thu nh??? CD
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }
        //X??? l?? khi click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }
        //Khi song ???????c play 
        audio.onplay = function () {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }
        //Khi song b??? pause
        audio.onpause = function () {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }
        //Khi ti???n ????? b??i h??t thay ?????i
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }
        //Khi tua
        progress.onchange = function (e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }
        //Khi next song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrolllToActiveSong()
        }
        //khi prev Song
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
        }
        //Khi randomSong
        randomBtn.onclick = function (e) {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom',_this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }
        //X??? l?? nextsong khi audio ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }
        //reapt
        reaptBtn.onclick = function (e) {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat',_this.isRepeat)
            reaptBtn.classList.toggle('active', _this.isRepeat)
        }
        //L???ng nghe s??? ki???n khi click v??o play list
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)')
            if (songNode || e.target.closest('.option')) {
                //x??? l?? khi click v??o song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                    console.log(songNode.dataset.index)
                }
                //x??? l?? khi click n??t ba ch???m
                if (e.target.closest('.option')) {

                }
            }
        }
    },
    scrolllToActiveSong: function () {
        setTimeout(() => {
            $('.song .active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            })
        }, 300)
    },
    loadConfig:function(){
        this.isRandom=this.config.isRandom
        this.isRepeat=this.config.isRepeat
    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    nextSong: function () {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentSong = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function () {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentSong = this.song.length - 1
        }
        this.loadCurrentSong()
    },
    playRandomSong: function () {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        }
        while (newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    start: function () {
        //C???u h??nh t??? config v??o ??ng d???ng
        this.loadConfig()
        //?????ng ngh??a c??c thu???c t??nh cho object
        this.defineProperties()
        //L???ng nghe x??? l?? s??? ki???n/DOM EVENTS
        this.handleEvents()
        //T???i th??ng tin b??i h??t ?????u ti??n v??o giao di???n khi ch???y ???ng d???ng
        this.loadCurrentSong()
        //RenderPlaylist
        this.render()
        //Hi???n th??? tr???ng th??i ban ?????u c???a n??t r??peat v?? random
        reaptBtn.classList.toggle('active', this.isRepeat)
        randomBtn.classList.toggle('active',this.isRandom)
    }
}
app.start();