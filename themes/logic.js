//INIT LAZY LOAD
document.addEventListener("DOMContentLoaded", function() {
    moveToPinnedOnLoad();
    populateHistoryOnLoad();
    const observer = lozad();
    observer.observe();
});

//IFRAME POPUP
let iframePopup = document.getElementById('iframe-popup');
let iframeClose = document.getElementById('iframe-close');

//CLICK ITEM OPEN ITEM
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

    if(event.target.parentNode.parentNode.getAttribute('id') != 'history-sect') {
        var clickedTitle = event.target.dataset.title,
            clickedURL = event.target.href;
        document.title = clickedTitle;

        //INIT HISTORY LOCAL STORAGE AND ADD VALUE ON CLICK
        if (localStorage.getItem("historyList")) {
            var historyList = JSON.parse(localStorage.getItem("historyList"));
        } else {
            var historyList = [];
        }

        if (historyList.length > 30) {
            historyList.shift();
        }

        historyList.push(clickedTitle + 'ᴥ' + clickedURL)
        localStorage.setItem("historyList", JSON.stringify(historyList));
    }
}, false);

//UNMINIZE
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

//MINIMIZE
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

//CLOSE POPUP
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
    document.title = "☛ ☈☉☊☌☡ ☚"
}, false);

//PIN SECTION
document.addEventListener('click', function (event) {
    if (!event.target.matches('.pin-section')) {
        return
    }

    const pinnedSection = document.getElementById('pinned'),
          allSection = document.getElementById('subscriptions'),
          clickedSection = event.target.parentNode.parentNode,
          clickedCat = clickedSection.parentNode,
          clickedSectionData = clickedSection.dataset.section;

    if (clickedCat.getAttribute('id') == 'latest') {
        event.preventDefault();
        return;
    }

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

            if (thisSection) {
                fragmentAutoPin = document.createDocumentFragment();
                fragmentAutoPin.appendChild(thisSection);
                pinnedSection.appendChild(fragmentAutoPin);
                localStorage.setItem(value, 1);
            }
        })
    }
}

//POPULATE HISTORY
function populateHistoryOnLoad() {
    if (localStorage.getItem("historyList")) {
        var historyPopulate = JSON.parse(localStorage.getItem("historyList"));
        historyPopulate.reverse();
    }

    if (historyPopulate) {
        var historySection = document.getElementById('history-sect')

        historyPopulate.forEach(function(value, index) {
            var historyPin = document.createElement("item"),
                historyPinLink = document.createElement("a"),
                historyPinTitle = document.createTextNode(value.substring(0, value.indexOf('ᴥ')));

            historyPinLink.href = value.substring(value.indexOf('ᴥ')+1, value.length);
            historyPinLink.classList.add('iframe-source')

            historyPin.appendChild(historyPinTitle);
            fragmentHistoryPin = document.createDocumentFragment();
            historyPin.appendChild(historyPinLink);
            fragmentHistoryPin.appendChild(historyPin);
            historySection.appendChild(fragmentHistoryPin);
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