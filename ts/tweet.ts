class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {

        const message = this.text.toLowerCase();

        if (message.startsWith("just completed") ||
            message.startsWith("just posted")) {
            return "completed_event";
        }

        if (message.includes("runkeeper live") ||
            message.includes("#rklive")) {
            return "live_event";
        }
        if (message.startsWith("achieved") || 
            message.includes("personal record")) {
            return "achievement";
        }
     
    
        return "miscellaneous";
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {

        if (this.source != "completed_event") {
            return false;
        }

        if (this.text.includes(" - ")) {
            if (this.text.includes("TomTom MySports Watch")) {
                return false;
            }

            const start = this.text.indexOf(" - ");
            let message = this.text.substring(start + 3);
            const link = message.indexOf("https://");

            if(link != -1) {
                message = message.substring(0, link);

            }
            message = message.replace(/#RunKeeper\s*$/i, "").trim();
            if (message.length > 0) {
                return true;
            }
        }
        return false;

    }

    get writtenText():string {
        if(!this.written) {
            return "";
        }

        const start = this.text.indexOf(" - ");
        let message = this.text.substring(start + 3);
        const link = message.indexOf("https://");
        if (link != -1) {
            message = message.substring(0, link);
        }
        message = message.replace(/#Runkeeper\s*$/i, "").trim();
       
        return message;
    }

    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }

        
        let message = this.text.toLowerCase();
        const dash = message.indexOf(" - ");
        if (dash != -1) {
            message = message.substring(0, dash);
        }

        const runkeeper = message.indexOf("runkeeper");
        if (runkeeper != -1) {
            message = message.substring(0, runkeeper);
        }
        if (message.includes("mtn bike")) {
            return "mtn bike";
        }
        if (message.includes("elliptical workout")) {
            return "elliptical workout";
        }

        if (message.includes("run")) {
            return "run";
        }
        if (message.includes("walk")) {
            return "walk";
        }
        if (message.includes("bike")) {
            return "bike";
        }
        if (message.includes("swim")) {
            return "swim";
        }        
        if (message.includes("row")) {
            return "row";
        }
        if (message.includes("hike")) {
            return "hike";

        }
        if (message.includes("spinning")) {
            return "spinning";
        }
        if (message.includes("meditation")) {
            return "meditation";
        }
        if (message.includes("yoga")) {
            return "yoga";
        }
        return "unknown";
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }

        const result = this.text.match(/(\d+(\.\d+)?)\s*(km|mi)\b/i);
        if (result == null) {
            return 0;
        }
        const distance = parseFloat(result[1]);
        const unit = result[3].toLowerCase();

        if (unit == "km") {
            return distance * 0.621371;
        }
       
        return distance;
    }

    getHTMLTableRow(rowNumber:number):string { 
        const start = this.text.indexOf("https://");
        let link = "";

        if (start != -1) {
            link = this.text.substring(start).split(" ")[0];
        }

        let row = "<tr>";
        row += "<td>" + rowNumber + "</td>";
        row += "<td>" + this.activityType + "</td>";
        row += "<td><a href='" + link + "' target='_blank'>" + this.writtenText + "</a></td>";
        row += "</tr>";

        return row;
    } 
}