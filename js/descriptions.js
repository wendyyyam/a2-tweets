let writtenTweets = [];
function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	//TODO: Filter to just the written tweets
	let tweets = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	writtenTweets = [];
	for (let tweet of tweets) {
		if (tweet.written) {
			writtenTweets.push(tweet);
		}
	}
}

function addEventHandlerForSearch() {
	
	let searchBox = document.getElementById("textFilter");
    searchBox.addEventListener("input", function() {
        let searchText = searchBox.value;
        let searchCount = 0;
        let table = document.getElementById("tweetTable");

        table.innerHTML = "";

        document.getElementById("searchText").innerText = searchText;

        if (searchText.trim() == "") {
            document.getElementById("searchCount").innerText = 0;
            return;
        }

        for (let tweet of writtenTweets) {
            if (tweet.writtenText.toLowerCase().includes(searchText.toLowerCase())) {
                searchCount++;
                table.innerHTML += tweet.getHTMLTableRow(searchCount);
            }
        }

        document.getElementById("searchCount").innerText = searchCount;
    });
}



//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});