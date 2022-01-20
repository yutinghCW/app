import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.26/vue.esm-browser.min.js';
const app = createApp({
    data () {
        return {
            playerToggle: false,
            scrollToggle: false,
            id: 0,
            date: '',
            date_zh: '',
            article: '',
            author: {
                type: '',
                name: ''
            },
            audio: {
                title: '',
                url: ''
            },
            message: {
                toggle: false,
                content: '',
            }
        }
    },
    mounted () {
        axios
        .get(`https://sheets.googleapis.com/v4/spreadsheets/1fwPre8HbO2wTnm1loJJ7T37EiHHroDX54ZjWqi48k1o/values/A:G?key=AIzaSyAYvr6hqxZzO_tSoGAEW6SYcQjrH7BCIHg`)
        .then(response => (
            response.data.values.forEach((item, index) => {
                if ( item[0] == this.date ) {
                    let data = response.data.values[index];
                    this.author.type = data[1]
                    this.author.name = data[2]
                    this.audio.title = `${this.chineseDate(this.date)} 國際新聞掃描`
                    this.audio.url = data[3]
                    this.article = data[6]
                }
            })
        ))
        .then(() => {
            this.playerSimplify();
            let bodyHeight = document.body.offsetHeight;
            let initTop = 0;
            window.onscroll = () => {
                let scrollTop = window.scrollY;
                if ( scrollTop < bodyHeight, initTop > 0 ) {
                    if ( initTop > scrollTop ) {
                        this.scrollToggle = false;
                    } else {
                        this.scrollToggle = true;
                    }
                }
                initTop = scrollTop;
            };
        })
    },
    methods: {
        playerSimplify(state) {
            var audioPlayer = document.querySelector('.player');
            var playPause = audioPlayer.querySelector('#playPause');
            var playpauseBtn = audioPlayer.querySelector('.play-pause-btn');
            var progress = audioPlayer.querySelector('.progress');
            var sliders = audioPlayer.querySelectorAll('.slider');
            var player = audioPlayer.querySelector('audio');
            var draggableClasses = ['pin'];
            var currentlyDragged = null;
            window.addEventListener('mousedown', function(event) {
                if(!isDraggable(event.target)) return false;
                currentlyDragged = event.target;
                let handleMethod = currentlyDragged.dataset.method;
                this.addEventListener('mousemove', window[handleMethod], false);
                window.addEventListener('mouseup', () => {
                    currentlyDragged = false;
                    window.removeEventListener('mousemove', window[handleMethod], false);
                }, false);
            });
            playpauseBtn.addEventListener('click', togglePlay);
            player.addEventListener('timeupdate', updateProgress);
            player.addEventListener('canplay', makePlay);
            player.addEventListener('ended', function(){
                playPause.attributes.d.value = "M21.2625 13.7081L10.2625 7.20524C9.36875 6.67714 8 7.18962 8 8.49581V21.4984C8 22.6702 9.27187 23.3765 10.2625 22.789L21.2625 16.2892C22.2437 15.7111 22.2468 14.2862 21.2625 13.7081Z";
            });
            sliders.forEach(slider => {
                let pin = slider.querySelector('.pin');
                slider.addEventListener('click', window[pin.dataset.method]);
            });
            function isDraggable(el) {
                let canDrag = false;
                let classes = Array.from(el.classList);
                draggableClasses.forEach(draggable => {
                    if(classes.indexOf(draggable) !== -1)
                        canDrag = true;
                })
                return canDrag;
            }
            function inRange(event) {
                let rangeBox = getRangeBox(event);
                let rect = rangeBox.getBoundingClientRect();
                let direction = rangeBox.dataset.direction;
                if(direction == 'horizontal') {
                    var min = rangeBox.offsetLeft;
                    var max = min + rangeBox.offsetWidth; 
                    if(event.clientX < min || event.clientX > max) return false;
                } else {
                    var min = rect.top;
                    var max = min + rangeBox.offsetHeight; 
                    if(event.clientY < min || event.clientY > max) return false;
                }
                return true;
            }
            function updateProgress() {
                var current = player.currentTime;
                var percent = (current / player.duration) * 100;
                progress.style.width = percent + '%';
            }
            function getRangeBox(event) {
                let rangeBox = event.target;
                let el = currentlyDragged;
                if(event.type == 'click' && isDraggable(event.target)) {
                    rangeBox = event.target.parentElement.parentElement;
                }
                if(event.type == 'mousemove') {
                    rangeBox = el.parentElement.parentElement;
                }
                return rangeBox;
            }
            function getCoefficient(event) {
                let slider = getRangeBox(event);
                let rect = slider.getBoundingClientRect();
                let K = 0;
                if(slider.dataset.direction == 'horizontal') {
                    let offsetX = event.clientX - slider.offsetLeft;
                    let width = slider.clientWidth;
                    K = offsetX / width;
                } else if(slider.dataset.direction == 'vertical') {
                    let height = slider.clientHeight;
                    var offsetY = event.clientY - rect.top;
                    K = 1 - offsetY / height;
                }
                return K;
            }
            function formatTime(time) {
                var min = Math.floor(time / 60);
                var sec = Math.floor(time % 60);
                return min + ':' + ((sec<10) ? ('0' + sec) : sec);
            }
            function startPlay() {
                playPause.attributes.d.value = "M8 7.55937V22.4406C8 22.75 8.22346 23 8.5 23H10.5C10.7765 23 11 22.75 11 22.4406V7.55937C11 7.25 10.7765 7 10.5 7H8.5C8.22346 7 8 7.25 8 7.55937ZM19 7.55937V22.4406C19 22.75 19.2235 23 19.5 23H21.5C21.7765 23 22 22.75 22 22.4406V7.55937C22 7.25 21.7765 7 21.5 7H19.5C19.2235 7 19 7.25 19 7.55937Z";
                player.load();
                player.play();
            }
            function stopPlay() {
                playPause.attributes.d.value = "M21.2625 13.7081L10.2625 7.20524C9.36875 6.67714 8 7.18962 8 8.49581V21.4984C8 22.6702 9.27187 23.3765 10.2625 22.789L21.2625 16.2892C22.2437 15.7111 22.2468 14.2862 21.2625 13.7081Z";
                player.pause();
            }
            function togglePlay() {
                if(player.paused) {
                    startPlay();
                } else {
                    stopPlay();
                }
            }
            function makePlay() {
                playpauseBtn.style.display = 'block';
            }
            switch (state) {
                case 0:
                    startPlay();
                    break;
            
                default:
                    stopPlay();
                    break;
            }
        },
        clickPlay(title, url) {
            this.playerToggle = true
            this.scrollToggle = false
            this.audio.title = title 
            this.audio.url = url
            this.playerSimplify(0)
        },
        closePlay() {
            this.playerToggle = false
            this.scrollToggle = true
            this.audio.title = '' 
            this.audio.url = ''
            this.playerSimplify(1)
        },
        chineseDate(date) {
            let origin = date.split('-');
            return `${origin[0]}年${origin[1]}月${origin[2]}日`
        },
        openMessage(string) {
            this.message.toggle = true
            this.message.content = string
            setTimeout(() => {
                this.message.toggle = false
            }, 2000);
        },
        closeMessage() {
            this.message.toggle = false
        }
    },
    created () {
        let uri = window.location.search.substring(1); 
        let params = new URLSearchParams(uri);
        this.id = params.get("id");
        this.date = params.get("date");
    }
});
app.mount('#app')