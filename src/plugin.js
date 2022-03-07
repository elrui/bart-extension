/*
 * Definition of auxiliary functions to be used in the plugin
*/

/*
 * Returns an array with all the URLs for the current window
 * (as long as it starts with http or https)
 */  
function listURLs(tabs) {
    let urls = [];
    tabs.forEach ( 
        t => {
            if (t.url.indexOf('http') == 0) {
                urls.push(t.url);
             }
        }    
    );
    return urls;
};

/*
 * Encodes the URLs on a JSON object. Creates a random HEX id.
 * Can add a custom name to the backup. If no name is provided
 * it will use the random id.
 */
function encodeJSON(strarray, name='') {
    let id = Math.random().toString(16).substring(2,12);
    if (name == '') {
        name = id;
    }

    const data = {
        "id": id,
        "name": name,
        "urls": strarray
    }

    return JSON.stringify(data);
}

/* 
 * Converts the JSON to a JavaScript Object
 */
function decodeJSON(data) {
    let obj = JSON.parse(data);
    return obj;
}

// async function listKeys() {
//     let aver = await chrome.storage.sync.get(null);
//     console.log('aver: ', aver);
// }

/*
 * This block initializes the components in the document 
 */

// Create initial form
let backupform = document.createElement('form');
backupform.id = 'backupinfo';
// Disable SUBMIT default action in form
backupform.addEventListener('submit', e => e.preventDefault());

// Form title
let formtitle = document.createElement('h2');
formtitle.innerHTML = 'Select your option:';

// Create id/name

let idname = document.createElement('input');
idname.id = 'name';
idname.label = 'nombre';
idname.hidden = true;

// Create text area for backup/restore content
let textarea = document.createElement('textarea');
textarea.id = 'content';
textarea.hidden = true;
textarea.setAttribute('cols', '75');
textarea.setAttribute('rows', '20');
textarea.setAttribute('style', 'overflow:auto;');
textarea.hidden = true;

// Create List button
let listbtn       = document.createElement('button');
listbtn.innerText = 'List Tabs';
listbtn.id        = 'listurls';

// Create Restore button
let restorebtn        = document.createElement('button');
restorebtn.innerText  = 'Restore';
restorebtn.id         = 'restoretabs';

// Create Action button
let actionbtn       = document.createElement('button');
actionbtn.innerText = '===';
actionbtn.id        = 'actionbutton';
actionbtn.hidden    = true;

// Create Hidden status, to be used to decide appropriate action
let formstatus = document.createElement('input');
formstatus.id        = 'status';
formstatus.hidden    = true;
formstatus.innerText = 'backup';

// Create selection list - For future use
let selection = document.createElement('select');
selection.id     = 'backupslist';
selection.hidden = true;

// Add elements to form
backupform.appendChild(formtitle);
backupform.appendChild(listbtn);
backupform.appendChild(restorebtn);
backupform.appendChild(document.createElement('BR'));
backupform.appendChild(textarea);
backupform.appendChild(document.createElement('BR'));
backupform.appendChild(selection);
backupform.appendChild(idname);
backupform.appendChild(actionbtn);
backupform.appendChild(formstatus);

// Build page
let title = document.createElement('h1');
title.innerHTML = 'BART: Backup And Restore Tabs';

let version = document.createElement('div');
version.innerHTML = 'version: ' + chrome.runtime.getManifest().version;
version.setAttribute('class', 'vernumber');

let body = document.getElementsByTagName('body')[0];

body.appendChild(title);
body.appendChild(backupform);
body.appendChild(version);


/*
 * Listeners for the buttons
 */

/*
 * Lists all the tabs on the current page, and creates a JSON
 * object that can be copied to open later or move to 
 * another computer
 */
listbtn.addEventListener('click', async () => {

    textarea.hidden = false;

    let tabsarray = await chrome.tabs.query({currentWindow: true});

    let wid = tabsarray[0].windowId; 

    let newurls = listURLs(tabsarray);

    textarea.value       = encodeJSON(newurls, wid.toString());
    idname.value         = wid.toString();
    actionbtn.innerText  = 'Copy';
    actionbtn.hidden     = false;
    formstatus.innerText = 'backup';
}, false);

/*
 * Prepares the environment to restore a backup created with
 * the same extension.
 */
restorebtn.addEventListener('click', () => {

    textarea.hidden       = false;
    textarea.value        = '';
    actionbtn.innerText   = 'Open';
    actionbtn.hidden      = false;
    formstatus.innerText  = 'restore';
    
}, false);

/*
 * Executes the action depending on the current work mode:
 * 1. In backup, copies the contents to the clipboard
 * 2. In restore, creates a new window opening the tabs
 */
actionbtn.addEventListener('click', async () => {
    if (formstatus.innerText == 'backup') {
        navigator.clipboard.writeText(textarea.value);
    }
    else {    // in case of restore
        try {
            obj = decodeJSON(textarea.value);
        }
        catch (e) {
            alert ('Invalid format!')
        }
        
        console.log("Will open these pages: \n", obj.urls);
        
        await chrome.windows.create({
            focused: true,
            url: obj.urls
        })
    
    }   
}, false)


