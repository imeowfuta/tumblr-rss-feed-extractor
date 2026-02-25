// TUMBLR RSS FEED EXTRACTOR
// to run; copy it all into in your browsers console (Ctrl + Shift + K)
(async () => {
const excludedsubdomain = new Set(["www", "assets", "static", "media", "data", "blog", "help", "support", "contact", "about", "privacy", "api"]);
const matches = [];
let failcount = 0; // to track unsuccessful searches

// first loop through different offsets of our following page:
for (let offset = 0; offset <= 10000; offset += 20) {
    const pageHtml = await fetch(`https://www.tumblr.com/following?offset=${offset}`).then(r => r.text());
    const pageMatches = pageHtml.matchAll(/https:\/\/([\w-]+)\.tumblr\.com\//g); //regex get all URL
    failcount += 1;
    // then loop through each URL match on the current page:
    for (const match of pageMatches) { 
        const username = match[1]; // extract the username only
        if (!excludedsubdomain.has(username)) { // check not a tumblr subdomain
            const rssurl = `https://${username}.tumblr.com/rss`; // format username as RSS feed URL
            if (!matches.includes(rssurl)) { // if URL not already present
                matches.push(rssurl); // add new URL to matches
                failcount = 0; // mark successful search
            }
        }
    }
    if (failcount >= 5) { // if not found new URL for a few pages we stop searching:
        break;
    }
}

// create OPML from the extracted URL:
const opmlOutput = `
<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
    <head>
        <title>MY TUMBLR FOLLOWING</title>
        <dateCreated>${new Date().toISOString()}</dateCreated>
    </head>
    <body>
        ${matches.map(rssurl => `    <outline type="rss" text="${rssurl}" xmlUrl="${rssurl}"/>`).join('\n')}
    </body>
</opml>`;

// download the OPML file:
const blob = new Blob([opmlOutput], { type: "application/xml" });
const link = document.createElement("a");
link.href = URL.createObjectURL(blob);
link.download = "my_tumblr_following.opml";
link.click();

// print the OPML file to console as fallback:
console.log(opmlOutput);
})();
