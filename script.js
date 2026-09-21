
let journalEntries = [];

const titleInput = document.getElementById("title");
const moodInput = document.getElementById("mood");
const contentInput = document.getElementById("content");
const saveButton = document.getElementById("saveBtn");
const cancelButton = document.getElementById("cancelBtn");
const entriesContainer = document.getElementById("entriesContainer");
const searchInput = document.getElementById("searchInput");
const moodFilter = document.getElementById("moodFilter");
const charCount = document.getElementById("charCount");
const message = document.getElementById("message");
const totalEntries = document.getElementById("totalEntries");
const totalCharacters = document.getElementById("totalCharacters");
const mostUsedMood = document.getElementById("mostUsedMood");
const themeButton = document.getElementById("themeBtn");



const savedEntries = localStorage.getItem("journalEntries");

let editingId = null;
cancelButton.style.display ="none";

//SHOW MESSAGE//

function showMessage(text, type){
        message.textContent = text;
        message.className = type;

        setTimeout(function(){
            message.textContent = "";
            message.className ="";
        },3000);
    }

//LOAD SAVED JOURNALS//


if (savedEntries) {
    journalEntries = JSON.parse(savedEntries);

    journalEntries = journalEntries.map(function (entry) {

        if (!entry.id) {
            entry.id = Date.now() + Math.random();
        }

        return entry;
    });

    localStorage.setItem(
        "journalEntries",
        JSON.stringify(journalEntries)
    );
}


function getMoodClass(mood) {

    if (mood.includes("Happy")) {
        return "mood-happy";
    }

    if (mood.includes("Sad")) {
        return "mood-sad";
    }

    if (mood.includes("Calm")) {
        return "mood-calm";
    }

    if (mood.includes("Angry")) {
        return "mood-angry";
    }

    if (mood.includes("Loved")) {
        return "mood-loved";
    }

    return "";
}

function updateStatistics(){

        //TOTAL ENTRIES

        totalEntries.textContent = journalEntries.length;

        //TOTAL CHARACTERS

        let characters = 0;

        journalEntries.forEach(function(entry){

            characters = characters + entry.content.length;
        });

        //MOST USED MOOD

        if (journalEntries.length === 0){
            mostUsedMood.textContent = "No entries yet";

            return;
        }

        const moodCount = {};

        journalEntries.forEach(function(entry){
            if (moodCount[entry.mood]){
                moodCount[entry.mood]++;
            } else {
                moodCount[entry.mood] = 1;
            }
        });

        let mostUsed = "";
        let highestCount = 0;

        for (let mood in moodCount){
            if (moodCount[mood]> highestCount){
                mostUsed = mood;
                highestCount = moodCount[mood];
            }
        }

        mostUsedMood.textContent = mostUsed;


    }

//DISPLAY JOURNALS//

function displayEntries() {
    entriesContainer.innerHTML = "";

    const searchText = searchInput.value.toLowerCase();

    const selectedMood = moodFilter.value;

    const filteredEntries = journalEntries.filter(function(entry){
        
        const matchesSearch =
            entry.title.toLowerCase().includes(searchText)||
            entry.content.toLowerCase().includes(searchText) ||
            entry.mood.toLowerCase().includes(searchText);

        const matchesMood =
            selectedMood === "all" ||
            entry.mood === selectedMood;

        return matchesSearch && matchesMood;
        
    });

    if (filteredEntries.length === 0) {

        if(journalEntries.length === 0){
            entriesContainer.innerHTML = `
            <div class="empty-state">
            <div class="empty-icon">📝</div>
            <h3>No journal entries yet</h3>
            <p>Start writing your first journal and capture your thoughts.</p>
            </div>`;
        }else {

    entriesContainer.innerHTML = `
        <p class="no-entries">No journal entries found.</p>
    `;
        }

    return;
}

    [...filteredEntries].reverse().forEach(function (entry) {

        const entryElement = document.createElement("div");

        entryElement.innerHTML = `
            <div class="journal-entry">
                <h3>${entry.title}</h3>
                <p class="entry-mood ${getMoodClass(entry.mood)}">${entry.mood}</p>
                <p class="entry-content">${entry.content}</p>
                <p class="entry-date">${entry.date}</p>

                <button class="favorite-btn" data-id="${entry.id}"> ${entry.favorite ? "⭐ Favorited" : "☆ Favorite"} </button>
                <button class="edit-btn" data-id="${entry.id}"> Edit </button>
                <button class="delete-btn" data-id="${entry.id}">
                Delete </button>
            
            </div>
        `;

        entriesContainer.appendChild(entryElement);

        // FAVORITE

        const favoriteButton = entryElement.querySelector(".favorite-btn");

        favoriteButton.addEventListener("click", function(){
            const entryId = Number (favoriteButton.dataset.id);
            const entry = journalEntries.find(function (entry) {
                return entry.id === entryId;
            });

            entry.favorite = !entry.favorite;

            localStorage.setItem(
                "journalEntries",
                JSON.stringify(journalEntries)
            );

            displayEntries();
        });


        //Delete
    
        const deleteButton = entryElement.querySelector(".delete-btn");

        deleteButton.addEventListener("click", function () {

            const confirmDelete = confirm(
                "Are you sure you want to delete this Journal?"
            );

            if (!confirmDelete){
                return;
            }

    journalEntries = journalEntries.filter(function (entry) {
        return entry.id !== Number(deleteButton.dataset.id);
    });

    

    localStorage.setItem(
        "journalEntries",
        JSON.stringify(journalEntries)
    );

    showMessage(
    "Journal deleted successfully!",
    "success"
);

    displayEntries();
    updateStatistics();
});

//EDIT

const editButton = entryElement.querySelector(".edit-btn");

editButton.addEventListener("click", function(){
    const entryId = Number(editButton.dataset.id);

    const entryToEdit = journalEntries.find(function(entry){
        return entry.id === entryId;
    });

    titleInput.value = entryToEdit.title;
    moodInput.value = entryToEdit.mood;
    contentInput.value = entryToEdit.content;


    editingId = entryId;

    saveButton.textContent = "Update Journal";
    cancelButton.style.display = "block";
});
    });
}

//SHOW SAVED JOURNALS WHEN PAGE LOADS

displayEntries();
updateStatistics();

//SAVE / UPDATE

saveButton.addEventListener("click", function () {


    const title = titleInput.value;
    const mood = moodInput.value;
    const content = contentInput.value;

//VALIDATION//

    if(title.trim() === "" || 
        mood === "" || 
        content.trim() === ""){
        showMessage(
            "Please complete all fields before saving.",
            "error"
        );
        return;
    }

    //UPDATE EXISTING JOURNAL//

    if(editingId !== null){


        const entryToEdit = journalEntries.find(function(entry){
            return entry.id === editingId;
        });

        entryToEdit.title = title;
        entryToEdit.mood = mood;
        entryToEdit.content = content;

        showMessage(
        "Journal updated successfully!",
        "success"
    );


        editingId = null;

    

        saveButton.textContent = "Save Journal";
        cancelButton.style.display = "none";
        

    } else{

        //CREATE NEW JOURNAL

    const entry = {
        id: Date.now(),
        title: title,
        mood: mood,
        content: content,
        date: new Date().toLocaleString("en-US",{
            year: "numeric",
            month:"long",
            day:"numeric",
            hour:"numeric",
            minute:"2-digit"
        }),

        favorite: false
    };

    journalEntries.push(entry);


    showMessage(
        "Journal saved successfully",
        "success"
    );

}

// SAVE TO LOCAL STORAGE//

    localStorage.setItem(
        "journalEntries", 
        JSON.stringify(journalEntries));

        displayEntries();
        updateStatistics();

        // CLEAR FORM //

    titleInput.value = "";
    moodInput.value = "";
    contentInput.value = "";
    charCount.textContent = "0 characters";
});

// CANCEL EDIT

cancelButton.addEventListener("click", function () {

    editingId = null;

    titleInput.value = "";

    moodInput.value = "";

    contentInput.value = "";

    charCount.textContent = "0 characters";

    saveButton.textContent = "Save Journal";

    cancelButton.style.display = "none";

});

//SEARCH

searchInput.addEventListener("input", function () {

    displayEntries();

});

moodFilter.addEventListener("change", function () {

    displayEntries();

});

//COUNTER

contentInput.addEventListener("input",function(){
    charCount.textContent = contentInput.value.length + " characters";
});

//THEME

themeButton.addEventListener("click", function(){

    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")){

        themeButton.textContent = "☀️ Light Mode";
        localStorage.setItem("theme", "dark");


    } else {
        themeButton.textContent = "🌙 Dark Mode";
        localStorage.setItem("theme", "light");
    }
});

//LOAD SAVED THEME

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark"){
    document.body.classList.add("dark-mode");
    themeButton.textContent = "☀️ Light Mode";
}









