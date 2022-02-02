//INIT LAZY LOAD
document.addEventListener("DOMContentLoaded", function() {
    moveToPinnedOnLoad();
    const observer = lozad();
    observer.observe();
});

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
    if (!event.target.matches('#iframe-popup')) {
        return
    }
    event.preventDefault();
    event.stopPropagation();
    iframePopup
        .classList  
        .remove('minimized');
}, false);
document.addEventListener('click', function (event) {
    if (!event.target.matches('#iframe-minimize')) {
        return
    }
    event.preventDefault();
    event.stopPropagation();
    iframePopup
        .classList  
        .add('minimized');
}, false);
document.addEventListener('click', function (event) {
    if (!event.target.matches('#iframe-close')) {
        return
    }
    event.preventDefault();
    event.stopPropagation();
    iframePopup
        .classList
        .remove('show');
    iframePopup
        .classList
        .remove('minimized');
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
document.addEventListener('click', function (event) {
    if (!event.target.matches('.pin-section')) {
        return
    }

    const pinnedSection = document.getElementById('pinned'),
          allSection = document.getElementById('subscriptions'),
          clickedSection = event.target.parentNode.parentNode,
          clickedCat = clickedSection.parentNode,
          clickedSectionData = clickedSection.dataset.section;

    if (clickedCat.getAttribute('id') == 'pinned') {
        fragmentAll = document.createDocumentFragment();
        fragmentAll.appendChild(clickedSection);
        allSection.appendChild(fragmentAll);
        localStorage.removeItem(clickedSectionData);
    } else {
        fragmentPin = document.createDocumentFragment();
        fragmentPin.appendChild(clickedSection);
        pinnedSection.appendChild(fragmentPin);
        localStorage.setItem(clickedSectionData, 1);
    }
}, false);

//MOVE TO PINNED ON LOAD
function moveToPinnedOnLoad() {
    var archive = [],
        keys = Object.keys(localStorage),
        i = 0, 
        key;

    for (; key = keys[i]; i++) {
        archive.push( key );
    }

    if (archive.length) {
        archive.forEach(function(value) {
            var thisSection = document.getElementById(value),
                pinnedSection = document.getElementById('pinned');

            fragmentAutoPin = document.createDocumentFragment();
            fragmentAutoPin.appendChild(thisSection);
            pinnedSection.appendChild(fragmentAutoPin);
            localStorage.setItem(value, 1);
        })
    }
}

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