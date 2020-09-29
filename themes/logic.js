//INIT LAZY LOAD
const observer = lozad();
observer.observe();

//IFRAME POPUP
let iframePopup = document.getElementById('iframe-popup');
let iframeClose = document.getElementById('iframe-close');
document.addEventListener('click', function (event) {
    if (!event.target.matches('.iframe-source')) {
        return
    }
    event.preventDefault();
    let iframeLink = event
        .target
        .getAttribute('href');
    iframePopup
        .classList
        .add('show');
    iframePopup.src = iframeLink
}, false);
document.addEventListener('click', function (event) {
    if (!event.target.matches('#iframe-close')) {
        return
    }
    event.preventDefault();
    iframePopup
        .classList
        .remove('show');
    iframePopup.src = ''
}, false);
document.addEventListener('keydown', event => {
    if (event.isComposing || event.keyCode === 27) {
        iframePopup
            .classList
            .remove('show');
        iframePopup.src = ''
    }
});

//FILTER
document.addEventListener('DOMContentLoaded', function () {
    document
        .getElementById('search-input')
        .addEventListener('keyup', function () {
            let filterRegex = new RegExp('\\b' + this.value, 'gi');
            document
                .querySelectorAll('section')
                .forEach(function (item) {
                    item
                        .classList
                        .toggle('hide', !item.innerText.match(filterRegex))
                })
        })
});

//FULLSCREEN
document.addEventListener('dblclick', event => {
    var elem = document.getElementById('html');

    if (elem.requestFullscreen) {
    elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
    elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen();
    }
});


