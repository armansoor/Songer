const searchBtn = document.getElementById("searchBtn");
const luckyBtn = document.getElementById("luckyBtn");
const searchInput = document.getElementById("searchInput");
const resultsContainer = document.getElementById("results");
const kpopOnly = document.getElementById("kpopOnly");
const previewOnly = document.getElementById("previewOnly");
const sortSelect = document.getElementById("sortSelect");

async function searchSongs(query, lucky = false) {
  resultsContainer.innerHTML = "<p>🔍 Searching...</p>";
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
    query
  )}&entity=song&limit=20&country=kr`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    let songs = data.results;

    // Filter for K-Pop only
    if (kpopOnly.checked) {
      songs = songs.filter(
        (s) =>
          (s.primaryGenreName && s.primaryGenreName.toLowerCase().includes("k-pop")) ||
          (s.collectionName && s.collectionName.toLowerCase().includes("k-pop"))
      );
    }

    // Filter preview-only
    if (previewOnly.checked) {
      songs = songs.filter((s) => s.previewUrl);
    }

    // Sort
    if (sortSelect.value === "recommended") {
      songs.forEach(song => {
        let score = 0;
        if (song.primaryGenreName && song.primaryGenreName.toLowerCase() === "k-pop") {
          score += 100;
        }
        if (song.collectionName && song.collectionName.toLowerCase().includes("k-pop")) {
          score += 10;
        }
        if (song.releaseDate) {
            // Add score based on release date (newer songs get higher scores)
            score += new Date(song.releaseDate).getTime() / 10000000000;
        }
        song.kpopScore = score;
      });
      songs.sort((a, b) => b.kpopScore - a.kpopScore);
    } else if (sortSelect.value === "newest") {
      songs.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
    } else if (sortSelect.value === "oldest") {
      songs.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
    }

    if (!songs.length) {
      resultsContainer.innerHTML = "<p>No results found 😢</p>";
      return;
    }

    // Lucky mode
    if (lucky) {
      renderSongs([songs[Math.floor(Math.random() * songs.length)]]);
    } else {
      renderSongs(songs);
    }
  } catch (err) {
    resultsContainer.innerHTML = "<p>Error fetching songs.</p>";
    console.error(err);
  }
}

function renderSongs(songs) {
  resultsContainer.innerHTML = "";
  songs.forEach((song) => {
    const card = document.createElement("div");
    card.className = "song-card";
    card.innerHTML = `
      <img src="${song.artworkUrl100.replace("100x100", "300x300")}" alt="${song.trackName}">
      <h3>${song.trackName}</h3>
      <p>${song.artistName}</p>
      <p><small>${new Date(song.releaseDate).toLocaleDateString()}</small></p>
      ${
        song.previewUrl
          ? `<audio controls src="${song.previewUrl}"></audio>`
          : `<p>No preview available</p>`
      }
      <div class="actions">
        <a href="${song.trackViewUrl}" target="_blank">View</a>
        <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(
          song.artistName + " " + song.trackName
        )}" target="_blank">YouTube</a>
        <a href="https://twitter.com/intent/tweet?text=Listening to ${
          song.trackName
        } by ${song.artistName} 🎶" target="_blank">Share</a>
      </div>
    `;
    resultsContainer.appendChild(card);
  });
}

searchBtn.addEventListener("click", () => {
  if (searchInput.value.trim()) {
    searchSongs(searchInput.value.trim());
  }
});

luckyBtn.addEventListener("click", () => {
  if (searchInput.value.trim()) {
    searchSongs(searchInput.value.trim(), true);
  }
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && searchInput.value.trim()) {
    searchSongs(searchInput.value.trim());
  }
});
