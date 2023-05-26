let openMenu = document.querySelector('.open-menu');
let menu = document.querySelector('.menu');

openMenu.addEventListener('click', () => {
    menu.classList.toggle('active');
});

window.addEventListener('click', (e) => {
    if (openMenu.contains(e.target) || e.target.tagName == 'P' || e.target.tagName == 'IMG') {
        return true;
    } else {
        menu.classList.remove('active');
    }
}); 


let getFont = () => {
    let font = JSON.parse(localStorage.getItem("font"));
    if (font == 1) {
        document.body.style.fontFamily = 'Inter';
        openMenu.children[0].innerText = 'Sans Serif';
    } else if (font == 2) {
        document.body.style.fontFamily = "'Inter,Serif'";
        openMenu.children[0].innerText = 'Serif';
    } else {
        document.body.style.fontFamily = 'Inconsolata';
        openMenu.children[0].innerText = 'Mono';
    }
};



let menuEls = document.querySelectorAll('.menu li');
menuEls.forEach(el => {
    el.addEventListener('click', (e) => {
        openMenu.children[0].innerText = e.target.innerText;
        if (openMenu.children[0].innerText == 'Sans Serif') {
            document.body.style.fontFamily = 'Inter';
            localStorage.setItem("font", JSON.stringify(1));
        } else if (openMenu.children[0].innerText == 'Serif') {
            document.body.style.fontFamily = "'Inter,Serif'";
            localStorage.setItem("font", JSON.stringify(2));
        } else {
            document.body.style.fontFamily = 'Inconsolata';
            localStorage.setItem("font", JSON.stringify(3));
        }
    });
    getFont();
});




let switcherMode = document.querySelector('.switcher-mode');
let bodyParent = document.body.parentElement;

switcherMode.addEventListener('click', () => {
    bodyParent.hasAttribute("data-theme", "dark") ?
    bodyParent.removeAttribute("data-theme", "dark") :
    bodyParent.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", JSON.stringify(bodyParent.hasAttribute("data-theme", "dark")));
});




const theme = () => {
    let status = JSON.parse(localStorage.getItem("theme"));
    if (status) {
        switcherMode.checked = true;
        bodyParent.setAttribute("data-theme", "dark");
    } else {
        switcherMode.checked = false;
        bodyParent.removeAttribute("data-theme", "dark");
    }
};
theme();


let searchInput = document.querySelector('.search-input');
let searchBtn = document.querySelector('.search-btn');

searchBtn.addEventListener("click", () => {
    fetching();
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key == 'Enter') {
        fetching();
    }
});




let infosContainer = document.querySelector('.infosContainer');
let welcomeMsg = document.querySelector(".welcome-msg");


const fetching = () => {
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${searchInput.value}`).then(response => response.json())
        .then(results => {
            let linksArr = [];
            if (results.title) {
                let notFound = results.title;
                let noFoundMsg = results.message;
                errEl(notFound, noFoundMsg);
            } else {
                if(welcomeMsg) welcomeMsg.remove();
                infosContainer.innerHTML = '';
                let nounWord = results[0].word;
                let nounPhonetic = results[0].phonetic;
                let soundSrc = results[0].phonetics[0].audio || results[0].phonetics[1].audio || results[0].phonetics[2].audio || results[0].phonetics[3].audio ||
                    results[0].phonetics[4].audio || results[0].phonetics[5].audio;
                details(nounWord, nounPhonetic, soundSrc);
                results.forEach(result => {
                    result.meanings.forEach(meaning => {

                        let partOfSpeech = meaning.partOfSpeech;
                        let definitions = meaning.definitions;
                        let synonymsEl = meaning.synonyms;
                        let synonyms = synonymsEl.filter((el, idx) => synonymsEl.indexOf(el) == idx).join(", ");
                        let antonymsEl = meaning.antonyms;
                        let antonyms = antonymsEl.filter((el, idx) => antonymsEl.indexOf(el) == idx).join(", ");
                        linksArr.push(result.sourceUrls.join(""));
                        
                        section(partOfSpeech, definitions, synonyms, antonyms);
                    });
                });
                let links = linksArr.filter((el, idx) => linksArr.indexOf(el) == idx);
                sourcesEl(links);
            }
        });
};




let details = (nounWord, nounPhonetic, soundSrc) => {
    let detailsEl = '';
    let detailsContainer = document.createElement('div');
    detailsContainer.className = 'details';

    detailsEl = `<div>
                    <p class="word">${nounWord}</p>
                    <p class="phonetic">${nounPhonetic ? nounPhonetic : ''}</p>
                </div>
                <div>
                    <img class="play" src="assets/icon-play.svg" alt="play"/>
                    <audio src="${soundSrc}" class="sound"></audio>
                </div>`;
    
    detailsContainer.innerHTML = detailsEl;
    infosContainer.prepend(detailsContainer);
    
    infosContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('play')) {
            let audio = e.target.nextElementSibling;
            audio.play();
        }
    });
};


let section = (partOfSpeech, definitions, synonyms, antonyms) => {
    let Element = '';
    Element = `<div class="partOfSpeech ${partOfSpeech}">
                    <div><h3>${partOfSpeech}</h3><div> </div></div>
                    <h5>Meaning</h5>
                    <ul></ul>
                    ${synonyms ? `<div>Synonyms<div class="synonyms">${synonyms}</div></div>` : ''}
                    ${antonyms ? `<div>Antonyms<div class="antonyms">${antonyms}</div></div>` : ''}
                </div>`;

    infosContainer.innerHTML += Element;
    let uls = document.querySelectorAll(`.partOfSpeech ul`);

    definitions.forEach(definition => {
        uls.forEach(ul => {
            let li = document.createElement('li');
            let p = document.createElement('p');
            li.innerText = definition.definition ? definition.definition : '';
            p.innerText = definition.example ? `“${definition.example}”` : '';
            ul.appendChild(li);
            ul.appendChild(p);
        });
    });
    
};

let sourcesContainer = document.querySelector('.sources');
let sourcesEl = (links) => {
    let sourcesEl = '';
    let sourcesContainer = document.createElement('div');
    sourcesContainer.className = 'sources';

    sourcesEl = `<h5>source</h5>`;
    
    sourcesContainer.innerHTML = sourcesEl;
    infosContainer.append(sourcesContainer);

    links.forEach(link => {
        let openIcon = document.createElement('img');
        openIcon.src = 'assets/icon-new-window.svg';
        let linkEl = document.createElement('a');
        linkEl.href = link;
        linkEl.innerText = link;
        linkEl.target = '_blank';
        linkEl.appendChild(openIcon);
        sourcesContainer.appendChild(linkEl);
    });
};


let errContainer = document.querySelector('.errMsg');
let container = document.querySelector('.container');

let errEl = (notFound, noFoundMsg) => {
    let errEl = '';
    errEl = `<div class="errMsg">
                <p class="err-emoji">😕</p>
                <p class="err-msg">${notFound}</p>
                <p class="err-res">${noFoundMsg}</p>
            </div>`;
    
    if (notFound) {
        infosContainer.innerHTML = errEl;
        welcomeMsg.remove();
    } else {
        errContainer.remove();
    }
};
