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
    playCounts: JSON.parse(localStorage.getItem('PLAYER_STORAGE_COUNT')) || {},
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
  const playCounts = this.getPlayCounts(); // Lấy dữ liệu thống kê

    const htmls = this.songs.map((song, index) => {
        const key = song.name + '|' + song.singer;
        const count = playCounts[key] || 0;

        return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')"></div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                    <p class="play-count">Plays: ${this.playCounts[index] || 0}</p>

                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
        `;
    }
    )
        playlist.innerHTML = htmls.join('')

    const recommended = this.getMostPlayedSong();
    if (recommended) {
        const notice = document.createElement('div');
        notice.className = 'recommend-box';
        notice.innerHTML = `
            <div><strong>Recommended for you:</strong> ${recommended.name} - ${recommended.singer}</div>
        `;
        playlist.prepend(notice);
}


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
        //Xử lý CD quay/dừng
        const cdThumbAnimate = cdThumb.animate([{
            transform: 'rotate(360deg)'
        }], {
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        //Xử lý phóng to thu nhỏ CD
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }
        //Xử lý khi click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }
        //Khi song được play 
        audio.onplay = function () {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()

            // Cập nhật số lần phát
            const index = _this.currentIndex;
            _this.playCounts[index] = (_this.playCounts[index] || 0) + 1;
            localStorage.setItem('PLAYER_STORAGE_COUNT', JSON.stringify(_this.playCounts));

            // Cập nhật biểu đồ
            _this.updateChart();

            // Cập nhật giao diện "Plays: x" trong playlist
            _this.render();

        }
        //Khi song bị pause
        audio.onpause = function () {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }
        //Khi tiến độ bài hát thay đổi
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
        //Xử lý nextsong khi audio ended
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
        //LẮng nghe sự kiện khi click vào play list
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)')
            if (songNode || e.target.closest('.option')) {
                //xử lý khi click vào song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                    console.log(songNode.dataset.index)
                }
                //xử lý khi click nút ba chấm
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

        this.logListeningHistory(); // Ghi lại lịch sử nghe nhạc
    },

    logListeningHistory: function () {
        const history = JSON.parse(localStorage.getItem('listeningHistory')) || [];
        const currentTime = new Date().toISOString();

        history.push({
            song: this.currentSong.name,
            singer: this.currentSong.singer,
            time: currentTime
        });

        localStorage.setItem('listeningHistory', JSON.stringify(history));
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

    getMostPlayedSong: function () {
    const history = JSON.parse(localStorage.getItem('listeningHistory')) || [];
    const playCountMap = {};

    history.forEach(item => {
        const key = item.song + '|' + item.singer;
        playCountMap[key] = (playCountMap[key] || 0) + 1;
    });

    let mostPlayed = null;
    let maxCount = 0;

    for (const key in playCountMap) {
        if (playCountMap[key] > maxCount) {
            maxCount = playCountMap[key];
            mostPlayed = key;
        }
    }

    if (mostPlayed) {
        const [name, singer] = mostPlayed.split('|');
        return this.songs.find(song => song.name === name && song.singer === singer);
    }

    return null;
    },
    getPlayCounts: function () {
        const history = JSON.parse(localStorage.getItem('listeningHistory')) || [];
        const counts = {};

        history.forEach(item => {
            const key = item.song + '|' + item.singer;
            counts[key] = (counts[key] || 0) + 1;
        });

        return counts;
    },


updateChart: function () {
    const ctx = document.getElementById('chart').getContext('2d');
    
    const labels = this.songs.map(song => song.name);
    const data = this.songs.map((_, index) => this.playCounts[index] || 0);

    if (this.chart) {
        this.chart.data.datasets[0].data = data;
        this.chart.update();
    } else {
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Play count',
                    data: data,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
},



    start: function () {
        //Cấu hình từ config vào úng dụng
        this.loadConfig()
        //Địng nghĩa các thuộc tính cho object
        this.defineProperties()
        //Lắng nghe xử lý sự kiện/DOM EVENTS
        this.handleEvents()
        //Tải thông tin bài hát đầu tiên vào giao diện khi chạy ứng dụng
        this.loadCurrentSong()
        //RenderPlaylist
        this.render()
        //Hiển thị trạng thái ban đầu của nút rêpeat và random
        reaptBtn.classList.toggle('active', this.isRepeat)
        randomBtn.classList.toggle('active',this.isRandom)
        this.updateChart();

    }
}
app.start();