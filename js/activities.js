function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	//TODO: create a new array or manipulate tweet_array to create a graph of the number of tweets containing each type of activity.
	//graph #1 
	let activityCounts = {};

	for (let tweet of tweet_array) {
		if (tweet.source == "completed_event") {
			const activity = tweet.activityType;

			if (activityCounts[activity] == undefined) {
				activityCounts[activity] = 0;
			}

			activityCounts[activity]++;
		}
	}

	let activityData = [];

	for (let activity in activityCounts) {
		activityData.push({
			activity: activity,
			count: activityCounts[activity]
		});
	}
	activityData.sort(function(a, b) {
		return b.count - a.count;
	});
	
	document.getElementById("numberActivities").innerText = activityData.length;
	
	if (activityData.length > 0) {
		document.getElementById("firstMost").innerText = activityData[0].activity;
	}
	
	if (activityData.length > 1) {
		document.getElementById("secondMost").innerText = activityData[1].activity;
	}
	
	if (activityData.length > 2) {
		document.getElementById("thirdMost").innerText = activityData[2].activity;
	}

	activity_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "data": {
	    "values": activityData
	  },
	  //TODO: Add mark and encoding
	  "mark": "bar",
      "encoding": {
        "x": {
            "field": "activity",
            "type": "nominal",
            "title": "Activity Type",
            "sort": "-y"
        },
        "y": {
            "field": "count",
            "type": "quantitative",
            "title": "Number of Tweets"
        }
    }
};

    vegaEmbed('#activityVis', activity_vis_spec, {actions:false});


    //TODO: create the visualizations which group the three most-tweeted activities by the day of the week.
    //Use those visualizations to answer the questions about which activities tended to be longest and when.


	let topActivities = activityData.slice(0, 3);
    let distanceData = [];

    for (let tweet of tweet_array) {
        if (tweet.source == "completed_event" && tweet.distance > 0) {
            for (let activity of topActivities) {
                if (tweet.activityType == activity.activity) {
                    distanceData.push({
                        activity: tweet.activityType,
                        distance: tweet.distance,
                        day: tweet.time.toLocaleDateString("en-US", {weekday: "long"})
                    });
                }
            }
        }
    }
	let distance_vis_spec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Distances of the three most popular activities by day.",
        "data": {
            "values": distanceData
        },
        "mark": "point",
        "encoding": {
            "x": {
                "field": "day",
                "type": "ordinal",
                "title": "Day of the Week",
                "sort": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
            },
            "y": {
                "field": "distance",
                "type": "quantitative",
                "title": "Distance (miles)"
            },
            "color": {
                "field": "activity",
                "type": "nominal",
                "title": "Activity Type"
            }
        }
    };

    vegaEmbed('#distanceVis', distance_vis_spec, {actions:false});
	let averageGraph = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Average distance for each activity by day",
        "data": {
            "values": distanceData
        },
        "mark": "bar",
        "encoding": {
            "x": {
                "field": "day",
                "type": "ordinal",
                "title": "Day of the Week",
                "sort": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
            },
            "y": {
                "field": "distance",
                "type": "quantitative",
                "aggregate": "mean",
                "title": "Average Distance (miles)"
            },
            "color": {
                "field": "activity",
                "type": "nominal",
                "title": "Activity"
            },
            "xOffset": {
                "field": "activity"
            }
        }
    };

    vegaEmbed('#distanceVisAggregated', averageGraph, {actions:false});
	let activityAverages = [];

    for (let activity of topActivities) {
        let totalDistance = 0;
        let numberOfActivities = 0;

        for (let tweet of distanceData) {
            if (tweet.activity == activity.activity) {
                totalDistance += tweet.distance;
                numberOfActivities++;
            }
        }

        if (numberOfActivities > 0) {
            activityAverages.push({
                activity: activity.activity,
                average: totalDistance / numberOfActivities
            });
        }
    }

    activityAverages.sort(function(a, b) {
        return b.average - a.average;
    });

    if (activityAverages.length > 0) {
        document.getElementById("longestActivityType").innerText = activityAverages[0].activity;
        document.getElementById("shortestActivityType").innerText = activityAverages[activityAverages.length - 1].activity;
    }

	let weekdayDistance = 0;
    let weekendDistance = 0;
    let weekdayCount = 0;
    let weekendCount = 0;

    for (let tweet of distanceData) {
        if (tweet.day == "Saturday" || tweet.day == "Sunday") {
            weekendDistance += tweet.distance;
            weekendCount++;
        } else {
            weekdayDistance += tweet.distance;
            weekdayCount++;
        }
    }

    let weekdayAverage = 0;
    let weekendAverage = 0;

    if (weekdayCount > 0) {
        weekdayAverage = weekdayDistance / weekdayCount;
    }

    if (weekendCount > 0) {
        weekendAverage = weekendDistance / weekendCount;
    }

    if (weekdayCount > 0 && weekendCount > 0) {
        if (weekendAverage > weekdayAverage) {
            document.getElementById("weekdayOrWeekendLonger").innerText = "weekends";
        } else {
            document.getElementById("weekdayOrWeekendLonger").innerText = "weekdays";
        }
    }


	document.getElementById("distanceVisAggregated").style.display = "none";
	let button = document.getElementById("aggregate");

    button.addEventListener("click", function() {
        let graph2 = document.getElementById("distanceVis");
        let graph3 = document.getElementById("distanceVisAggregated");

        if (graph3.style.display == "none") {
            graph2.style.display = "none";
            graph3.style.display = "block";
            button.innerText = "Show individual distances";
        } else {
            graph2.style.display = "block";
            graph3.style.display = "none";
            button.innerText = "Show means";
        }
    });

	
}






//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});