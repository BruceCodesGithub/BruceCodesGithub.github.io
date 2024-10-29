// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA9g-0_Q4wjkiRvr6lKFOfG5ScujlBScQs",
    authDomain: "keno-ff22e.firebaseapp.com",
    projectId: "keno-ff22e",
    storageBucket: "keno-ff22e.appspot.com",
    messagingSenderId: "581088950323",
    appId: "1:581088950323:web:cebd3ee2ef0e334fd70b46"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let song1, song2;

// Fetch songs from Firestore
async function fetchSongs() {
    const songsSnapshot = await db.collection('songs').get();
    const songs = songsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (songs.length < 2) {
        console.error("Not enough songs in the database.");
        return;
    }

    [song1, song2] = getRandomSongs(songs);
    document.getElementById("song1-btn").innerText = song1.title;
    document.getElementById("song2-btn").innerText = song2.title;
}

// Function to get two random songs
function getRandomSongs(songs) {
    const shuffled = songs.sort(() => 0.5 - Math.random());
    return [shuffled[0], shuffled[1]];
}

// Voting function
async function vote(choice) {
    if (choice === 1) {
        await db.collection('songs').doc(song1.id).update({
            wins: firebase.firestore.FieldValue.increment(1),
            losses: firebase.firestore.FieldValue.increment(0)
        });
        await db.collection('songs').doc(song2.id).update({
            wins: firebase.firestore.FieldValue.increment(0),
            losses: firebase.firestore.FieldValue.increment(1)
        });
    } else {
        await db.collection('songs').doc(song2.id).update({
            wins: firebase.firestore.FieldValue.increment(1),
            losses: firebase.firestore.FieldValue.increment(0)
        });
        await db.collection('songs').doc(song1.id).update({
            wins: firebase.firestore.FieldValue.increment(0),
            losses: firebase.firestore.FieldValue.increment(1)
        });
    }
    fetchSongs();
}

// Results function
async function showResults() {
    const songsSnapshot = await db.collection('songs').get();
    const songs = songsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    songs.sort((a, b) => (b.wins / (b.wins + b.losses)) - (a.wins / (a.wins + a.losses)));

    const resultsTable = document.getElementById("results-table");
    resultsTable.innerHTML = "";
    songs.forEach((song, index) => {
        const row = `<tr>
            <td>${index + 1}</td>
            <td>${song.title}</td>
            <td>${((song.wins / (song.wins + song.losses)) * 100).toFixed(2)}%</td>
        </tr>`;
        resultsTable.innerHTML += row;
    });

    document.getElementById("vote-container").style.display = 'none';
    document.getElementById("results-container").style.display = 'block';
}

// Event listeners
document.getElementById("song1-btn").addEventListener("click", () => vote(1));
document.getElementById("song2-btn").addEventListener("click", () => vote(2));
document.getElementById("skip-btn").addEventListener("click", fetchSongs);
document.getElementById("results-btn").addEventListener("click", showResults);
document.getElementById("back-btn").addEventListener("click", () => {
    document.getElementById("vote-container").style.display = 'block';
    document.getElementById("results-container").style.display = 'none';
});

// Initial call to fetch songs
fetchSongs();
