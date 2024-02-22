
let dynamicPlaybackRate ; 
let playbackSpeedContent ; 


function playbackFunction()  {

    const panelMenu = [...document.querySelectorAll('[class="ytp-panel-menu"]')].find(el => el.childElementCount >= 8)
    const panelMenuClone = panelMenu.cloneNode(true) ; 
    panelMenuClone.setAttribute("name", "hyperspeed-panel-clone")
    const menuItem = panelMenu.firstChild ; 


    // ["0.25", "0.5", "0.75", "Normal", "1.25", "1.5", "1.75", "2", "2.25", "2.5", "2.75", "3", "3.25", "3.5"]
    const playbackSpeeds = [] ; 
    for (let i = 0.25; i <= 3.5; i += 0.25) {
        i == 1 ? playbackSpeeds.push("Normal") : playbackSpeeds.push(i.toString()) ; 
    }

    const menuItemCloneChildren = playbackSpeeds.map(speed => {
        let menuItemClone = menuItem.cloneNode(true) ; 
        menuItemClone.firstChild.textContent = speed ; 

        if (playbackSpeedContent == speed) {
            menuItemClone.ariaChecked = "true"
        }

        return menuItemClone ; 
    })
     
    panelMenu.replaceWith(panelMenuClone)
    panelMenuClone.replaceChildren(...menuItemCloneChildren) ; 


    menuItemCloneChildren.forEach((item, index) => {

        item.addEventListener("click", function() {

            if (item.ariaChecked == "false") {
                item.ariaChecked = "true" ; 
            }
            
            let menuLabel = item.firstChild.textContent ;
            
            let playbackRateValue = menuLabel == "Normal" ? 1 : menuLabel ; 
            window.localStorage.setItem("dynamicPlaybackRate", playbackRateValue) ;

            menuLabel == "Normal" ? 
            document.getElementsByTagName("video")[0].playbackRate = "1"
            :
            document.getElementsByTagName("video")[0].playbackRate = menuLabel ; 
            

            // make sure other items aren't checked (only one at a time)
            if (item.ariaChecked == "true") {
                let otherMenuItems = [...menuItemCloneChildren] ;                 
                otherMenuItems.splice(index, 1) ; 
                otherMenuItems.forEach(otherItem => {
                    if (otherItem.ariaChecked == "true") {
                        otherItem.ariaChecked = "false"
                    }
                }) 
            }

            const playbackObserver = new MutationObserver(() => {
                if ([...document.querySelectorAll('[class="ytp-menuitem-label"]')].find(
                    el => el.textContent == "Playback speed") != undefined) {
                    
                    let playbackSpeedDisplay = [...document.querySelectorAll('[class="ytp-menuitem-label"]')].find(
                        el => el.textContent == "Playback speed").parentNode
                    
                    playbackSpeedDisplay.querySelector('[class="ytp-menuitem-content"]').textContent = menuLabel ;
                    
                    playbackObserver.disconnect() ; 
                }
            })
            playbackObserver.observe(document, { subtree: true, childList: true})

        })

    })

    // remove "Custom" button in the Playback speed panel menu
    let customSpeedButton = document.querySelector('button[class="ytp-button ytp-panel-options"]') ; 
    if (customSpeedButton != null) {
        customSpeedButton.remove() ;
    }
    
}

   
function initPlaybackElements() {

    const playbackSpeedLabel = [...document.querySelectorAll('[class="ytp-menuitem-label"]')].find(
        el => el.textContent == "Playback speed")

    const playbackSpeedDisplay = playbackSpeedLabel.parentNode ;

    const playbackSpeedMenuItem = playbackSpeedDisplay.querySelector('[class="ytp-menuitem-content"]') ; 
    if (window.localStorage.getItem("dynamicPlaybackRate") != null) {
        let rate = window.localStorage.getItem("dynamicPlaybackRate") ; 
        playbackSpeedMenuItem.textContent = rate == 1 ? "Normal" : rate ; 
    }

    playbackSpeedContent = playbackSpeedDisplay.querySelector('[class="ytp-menuitem-content"]').textContent ; 
    
    playbackSpeedDisplay.addEventListener("click", playbackFunction, { once: true }) ; 

}


const mainObserver = new MutationObserver(() => {
    
    if (document.URL.includes("youtube.com/watch?v=") 
        && document.querySelector('[aria-label="Settings"][title="Settings"]') != null 
        && [...document.getElementsByName("hyperspeed-panel-clone")].length == 0) {   


        let settingsButton = document.querySelector('[aria-label="Settings"][title="Settings"]') ;
        settingsButton.addEventListener("click", initPlaybackElements) ;  

    }

    if ([...document.getElementsByName("hyperspeed-panel-clone")].length != 0) { 

        let settingsButton = document.querySelector('[aria-label="Settings"][title="Settings"]') ;
        
        if (settingsButton != null) {
            // Uncaught TypeError: Cannot read properties of null (reading 'removeEventListener')
            settingsButton.removeEventListener("click", initPlaybackElements) ;
        }
         
        mainObserver.disconnect() ;
    }
});


function executeMainObserver() {
    mainObserver.observe(document, { subtree: true, childList: true }) ;
}

// executeMainObserver() ; 


// bug fix -
function initUrlChange() {
    
    if ([...document.querySelectorAll('[class="ytp-menuitem-label"]')].length != 0 
        && [...document.querySelectorAll('[class="ytp-menuitem-label"]')].find(
            el => el.textContent == "Playback speed") != undefined) {

        
        let tempPlaybackSpeedLabel = [...document.querySelectorAll('[class="ytp-menuitem-label"]')].find(
            el => el.textContent == "Playback speed") ; 

        let tempPlaybackSpeedDisplay = tempPlaybackSpeedLabel.parentNode ; 
        
        let tempMenuIemContent = tempPlaybackSpeedDisplay.querySelector('[class="ytp-menuitem-content"]')

        if (tempMenuIemContent.textContent != "Normal") {
            tempMenuIemContent.textContent = "Normal" ; 
        }
        

        tempPlaybackSpeedDisplay.addEventListener("click", function() {

            let tempPanelMenu = [...document.querySelectorAll('[class="ytp-panel-menu"]')].find(el => el.childElementCount >= 8)

            let tempPanelMenuChildren = [...tempPanelMenu.children]

            tempPanelMenuChildren.forEach(item => {
                if (item.ariaChecked == "true") {
                    item.ariaChecked = "false"
                }
            })
        }, {once: true})

    }
    
}


let prevUrl = document.URL ; 
 
const urlChangeObserver = new MutationObserver(() => {

    if (prevUrl != document.URL) {

        if (document.URL.includes("youtube.com/watch?v=")) {

            executeVideoOnPlayObserver()

            prevUrl = document.URL ; 
            
            executeMainObserver() ; 
        }

        prevUrl = document.URL ;
    }
})


urlChangeObserver.observe(document, { subtree: true, childList: true , attributes: true})


let vid ; 
const videoOnPlayObserver = new MutationObserver(() => {
    if (document.getElementsByTagName("video")[0] != undefined
        && document.URL.includes("youtube.com/watch?v=")) {

        vid = document.getElementsByTagName("video")[0] 

        vid.onplay = function() {
            vid.playbackRate = window.localStorage.getItem("dynamicPlaybackRate") ; 
        }

    }
})

function executeVideoOnPlayObserver() {
    videoOnPlayObserver.observe(document, { subtree: true, attributes: true })
}


executeVideoOnPlayObserver() ;
executeMainObserver() ;

