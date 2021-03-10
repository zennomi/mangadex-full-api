# MangaDex Full API
An unofficial [MangaDex](https://www.mangadex.org) API built with the JSON API and web parsing.
No other NPM dependencies.

[![Version](https://img.shields.io/npm/v/mangadex-full-api.svg?style=flat)](https://www.npmjs.com/package/mangadex-full-api)
[![License](https://img.shields.io/github/license/md-y/mangadex-full-api.svg?style=flat)](https://github.com/md-y/mangadex-full-api/blob/master/LICENSE)
[![Downloads](https://img.shields.io/npm/dm/mangadex-full-api.svg?style=flat)](https://www.npmjs.com/package/mangadex-full-api)

```npm install mangadex-full-api```

[Documentation](#Documentation) 

# Examples

```javascript

// A Couple of Examples

const api = require("mangadex-full-api");

api.agent.login("mfa", "mangadex-full-api", false).then(async () => {

    var manga = new api.Manga();
    await manga.fillByQuery("Ancient Magus Bride");
    console.log(`${manga.title} by ${manga.authors.join(", ")}`);
    
    let chapterId = manga.chapters[0].id;

    // New v4.0.0 Method
    let chapter = await api.Chapter.get(chapterId);
    console.log(`Vol. ${chapter.volume} Ch. ${chapter.chapter} (${chapter.language}) of ${manga.title} has ${chapter.views} views.`);
});

```

# Documentation

[Agent](#Agent) <br>
[Manga](#Manga) <br>
[Chapter](#Chapter) <br>
[Group](#Group) <br>
[User](#User) <br>
[Thread](#Thread) <br>
[Home](#Home) <br>
[MDList](#MDList) <br>
[MDNet (Mangadex@Home)](#MDNet) <br>

## Agent
**Called with api.agent**

|Property|Type|Information
|-|-|-
|sessionId|```String```| User session token
|sessionExpiration|```Date```| Session token expiration date
|persistentId|```String```| Rember me token
|hentaiSetting|```Number```| Hentai toggle setting (Default: Shown). See ```settings.hentai```
|user|```User```| This agent as a MangaDex user object.
|domainOverride|```String```| Domain to replace "mangadex.org" with

### ```Promise login(username, password, [rememberMe])```
|Arguments|Type|Information|Optional
|-|-|-|-
|username|```String```| Login username | No
|password|```String```| Login password | No
|rememberMe|```Boolean```| Create persistent session? (Default: False)  | Yes

Logs into MangaDex with specified credentials, then fills the agent object. This must be executed before a search.

### ```Promise cacheLogin(filepath, username, password, [persistent])```
|Arguments|Type|Information|Optional
|-|-|-|-
|filepath|```String```| Cache file location | No
|username|```String```| Login username | No
|password|```String```| Login password | No
|persistent|```Boolean```| Create persistent session? (Default: True) | Yes

Attempts to load the sessionId at the specified location. If there is no file or if the sessionId does not work,
it is regenerated by calling login().

**Persistent sessions appear [here](https://mangadex.org/settings) under "Password and Security"**

### ```Promise sendMessage(target, subject, body)```
|Arguments|Type|Information|Optional
|-|-|-|-
|target|```String```| Target user's username | No
|subject|```String```| The message's subject | No
|body|```String```| The message's body (BBCode Format) | No

Sends a Direct Message to a specified user from the Agent user.

### ```Promise fillUser()```

Fills agent.user with information about the agent. It must be logged in.

### ```Promise getHistory()```
Returns (up to) the last 10 manga read by the agent as an array.

```javascript

// Async example
(async function() {
    await agent.cacheLogin("./bin/cache.txt", USERNAME, PASSWORD);

    let manga = new Manga();
    await manga.fillByQuery(QUERY);
    await agent.sendMessage(RECIPIENT, "Manga Info", `${manga.title} by ${manga.authors} and ${manga.artists}.`);

    console.log(`Manga Info Sent to ${RECIPIENT}.`);
})();

```

## Manga

|Property|Type|Information
|-|-|-
|id|```Number```| This manga's MangaDex ID
|title|```String```| Manga's main title
|authors|```Array<String>```| All authors for this manga
|artists|```Array<String>```| All artists for this manga
|genres|```Array<Number>```| Array of the manga's genres' IDs.
|genreNames|```Array<String>```| Array of genre names in the same order as their IDs: ```.genres```
|cover|```String```| Current Cover URL
|covers|```Array<String>```| All cover URLs
|language|```String```| Original language code (e.g. JP, EN, DE). See ```language.js```
|hentai|```Boolean```| Hentai or not?
|description|```String```| Formated description string
|links|```Object```| Full URLs to additional links (e.g. MangaUpdates, MAL, BookWalker). See ```links.js```
|chapters|```Array<Chapter>```| Array of all chapters for this manga. Contains only minimal information like ID and title; use ```Chapter.fill()``` 
|views|```Number```| Amount of manga views
|rating|```Number```| Manga's Bayesian rating
|ratingMean|```Number```| Manga's Mean Rating
|ratingUserCount|```Number```| Number of users who have left a rating.
|altTitles|```Array<String>```| Alternate names for this manga.
|url|```String```| URL to the manga's homepage.
|flag|```String```| URL to the manga's language flag.

### ```static Promise search(query)```
|Arguments|Type|Information|Optional
|-|-|-|-
|Query|```String```| Search Keyword(s) | No

Searches for manga using keywords and quick search. Promise returns a list of MangaDex IDs sorted by relevance.

### ```static Promise fullSearch(searchObj)```
|Arguments|Type|Information|Optional
|-|-|-|-
|searchObj|```Object```| Search parameters | No

Searches for manga using parameters as an object. 

```javascript
Manga.fullSearch({
    title: "Sangatsu no Lion",
    author: "Umino Chica",
    artist: "Umino Chica",
    demographic: [1, 2, 3, "Josei"], // You can use strings too
    pubstatus: [1, 2, 3, 4],
    language: "JP", // Original Language
    excludeAll: false, // True = AND mode; False = OR Mode
    includeAll: true, // Same as above
    includeTags: [4, 5, "Romance"],
    excludeTags: [50],
    order: "Rating (Des)" // Number or string; Des = starts with highest rated
});
```

### ```Promise fill(id)```
|Arguments|Type|Information|Optional
|-|-|-|-
|ID|```Number```| MangaDex Object ID | No

Calls and fills object with info from MangaDex return. Promise returns the object.

### ```Promise fillByQuery(query)```
|Arguments|Type|Information|Optional
|-|-|-|-
|Query|```String```| Search Keyword(s) | No

Fills object with the most relevent result from ```.search()```. Promise returns the object.

### ```Promise fillByFullQuery(query)```
|Arguments|Type|Information|Optional
|-|-|-|-
|searchObj|```Object```| Search parameters | No

Fills object with the most relevent result from ```.fullSearch()```. Promise returns the object.

### ```static Promise get(id)```
|Arguments|Type|Information|Optional
|-|-|-|-
|id|```Number```| MangaDex Object ID | False

Returns an instance of this object with ```fill()``` already called.

```javascript

// Example: bin/test-manga-call.js
var manga = new Manga(MANGA_ID);
manga.fill().then(()=>{
    console.log(`${manga.title} by ${manga.authors.join(", ")}`);
});

```

## Chapter

|Property|Type|Information
|-|-|-
|id|```Number```| This chapter's MangaDex ID
|type|```Number```| What type is this chapter (internal, delayed, or external)? See ```chapter-types.js```
|link|```String```| Applicable link to chapter. It's either the MD Link, group delayed link, or external link.
|timestamp|```Number```| Unix timestamp of chapter upload
|volume|```Number```| The volume this chapter is from
|chapter|```Number```| The chapter's number
|title|```String```| The chapter's title
|language|```String```| The language code for this chapter's translated language. See ```language.js```
|parentMangaID|```Number```| The ID of the manga this chapter is from
|groups|```Array<Group>```| The groups that translated this chapter
|commentCount|```Number```| Number of comments on this chapter
|pages|```Array<String>```| Array of each page image's URL
|saverPages|```Array<String>```| Array of each page image's URL, but from its corresponding [data-saver](https://mangadex.org/thread/253605) server
|fallbackPages|```Array<String>```| Array of each page image's URL, but from its corresponding fallback server. (Usually more unstable, ironically)
|url|```String```| URL to the chapters's homepage.
|views|```Number```| Number of views for this chapter
|flag|```String```| URL to this chapter's language flag.

### ```Promise fill(id)```
|Arguments|Type|Information|Optional
|-|-|-|-
|ID|```Number```| MangaDex Object ID | No

Calls and fills object with info from MangaDex return. Promise returns the object.

### ```static Promise get(id)```
|Arguments|Type|Information|Optional
|-|-|-|-
|id|```Number```| MangaDex Object ID | False

Returns an instance of this object with ```fill()``` already called.

```javascript

// Example: bin/test-chapter-call.js
const chapter = await new Chapter(527948, true);
console.log(`This chapter is in ${language[chapter.language]}`);

```

## Group

|Property|Type|Information
|-|-|-
|id|```Number```| This group's MangaDex ID
|title|```String```| The group's official name
|description|```String```| HTML Formated description string
|language|```String```| The language code for this group. See ```language.js```
|views|```Number```| Amount of group views
|followers|```Number```| Amount of group followers
|uploads|```Number```| Amount chapters uploaded by this group
|links|```Object```| Links to the group's website, Discord, IRC, and/or email.
|leader|```User```| The group's leader.
|members|```Array<User>```| All non-leader members of this group.
|founded|```String```| The date the group was made.
|locked|```Boolean```| Is the group locked?
|inactive|```Boolean```| Is the group inactive?
|delay|```Number```| The delay (in seconds) on each groups published chapter
|banner|```String```| URL to the group's banner/header
|url|```String```| URL to the group's homepage
|flag|```String```| URL to the group's language flag

### ```static Promise search(query)```
|Arguments|Type|Information|Optional
|-|-|-|-
|Query|```String```| Search Keyword(s) | No

Searches for a manga using keywords. Promise returns a list of MangaDex IDs sorted by relevance.

### ```Promise fill(id)```
|Arguments|Type|Information|Optional
|-|-|-|-
|ID|```Number```| MangaDex Object ID | No

Calls and fills object with info from MangaDex return. Promise returns the object.

### ```Promise fillByQuery(query)```
|Arguments|Type|Information|Optional
|-|-|-|-
|Query|```String```| Search Keyword(s) | No

Fills object with the most relevent result from a search. Promise returns the object.

### ```static Promise get(id)```
|Arguments|Type|Information|Optional
|-|-|-|-
|id|```Number```| MangaDex Object ID | False

Returns an instance of this object with ```fill()``` already called.

```javascript

// Example: bin/test-group-call.js
const group = new Group(2233);
group.fill().then(()=>{
    console.log(`${group.title} has uploaded ${group.uploads} chapters and has ${group.followers} followers and ${group.views} views.`);
}).catch(console.error)

```

## User

|Property|Type|Information
|-|-|-
|id|```Number```| This user's MangaDex ID
|username|```String```| The user's username
|biography|```String```| HTML Formated biography string
|views|```Number```| Amount of profile views
|uploads|```Number```| Amount chapters uploaded by this user
|website|```String```| Link to user's website
|avatar|```String```| Link to user's avatar image
|levelId|```Number```| Level (admin, moderator, etc) of the user
|timeLastSeen|```Number```| Timestamp of when the person was last seen
|timeJoined|```Number```| Timestamp of when the user joined
|premium|```Boolean```| Is this user a donor/premium user?
|mdAtHome|```Boolean```| Is this user a MangaDex @ Home Contributor?
|url|```String```| URL to this user's profile page
|list|```MDList```| MDList of this user.

### ```static Promise search(query)```
|Arguments|Type|Information|Optional
|-|-|-|-
|Query|```String```| Search Keyword(s) | No

Searches for a manga using keywords. Promise returns a list of MangaDex IDs sorted by relevance.

### ```Promise fill(id)```
|Arguments|Type|Information|Optional
|-|-|-|-
|ID|```Number```| MangaDex Object ID | No

Calls and fills object with info from MangaDex return. Promise returns the object.

### ```Promise fillByQuery(query)```
|Arguments|Type|Information|Optional
|-|-|-|-
|Query|```String```| Search Keyword(s) | No

Fills object with the most relevent result from a search. Promise returns the object.

### ```static Promise get(id)```
|Arguments|Type|Information|Optional
|-|-|-|-
|id|```Number```| MangaDex Object ID | False

Returns an instance of this object with ```fill()``` already called.


```javascript

// Example: bin/test-user-call.js
var user = new User();
user.fillByQuery("mdy").then(()=>{
    console.log(`${user.username} has uploaded ${user.uploads} chapters and has ${user.views} views.`);
}).catch(console.error);

```

## Thread

|Property|Type|Information
|-|-|-
|id|```Number```| This thread's MangaDex ID
|pages|```Number```| The number of pages searched for this thread
|posts|```Array<Post>```| An array of Post objects.
|url|```String```| URL to this thread's first page

### ```Promise fill(id, [pages])```
|Arguments|Type|Information|Optional
|-|-|-|-
|ID|```Number```| MangaDex Object ID | No
|Pages|```Number```| Number of Pages to Parse (Default: 1) | Yes

Calls and fills object with info from MangaDex return. Promise returns the object.

```javascript

// Example: bin/test-thread-call.js
var thread = await new Thread(56429, true, 2);
console.log(`${thread.posts[0].author.username}'s original post: ${thread.posts[0].text}`);

```

## Post
|Property|Type|Information
|-|-|-
|id|```Number```| This post's MangaDex ID
|author|```User```| User with minimal information; use ```User.fill()```.
|text|```String```| The post's text

## Home

|Property|Type|Information
|-|-|-
|newest|```Array<Manga>```| Array of the most recently updated manga
|top6h|```Array<Manga>```| Array of the top manga in the past 6 hours
|top24h|```Array<Manga>```| Array of the top manga in the past 24 hours
|top7d|```Array<Manga>```| Array of the top manga in the week
|topFollows|```Array<Manga>```| Array of the top manga by follows
|topRating|```Array<Manga>```| Array of the top manga by rating

### ```Promise fill()```
Calls and fills object with info from MangaDex return. Promise returns the object.

```javascript

// Example: bin/test-home.js
let home = new Home();
home.fill().then(()=>{
    console.log(`${home.topRating[0].title} is the highest rated manga on MangaDex.`);
});

```

## MDList

|Property|Type|Information
|-|-|-
|id|```Number```| This MDList's MangaDex ID (Same as owner's)
|manga|```Array<Manga>```| All manga in this MDList
|banner|```String```| URL to the MDList header banner
|url|```String```| URL to the MDList's homepage
|owner|```User```| Owner of this MDList

### ```Promise fill(id, [order], [category])```
|Arguments|Type|Information|Optional
|-|-|-|-
|ID|```Number```| MangaDex Object ID | No
|Order|```Number\|String```| Order of the returned list (see ```enum/listing-order.js```) | Yes
|Category|```Number```| Category of the returned list (eg Dropped and Re-Reading) (see ```enum/viewing-categories.js```) | Yes

Calls and fills object with info from MangaDex return. Promise returns the object.

### ```Promise fillByUser(user, [order], [category])```
|Arguments|Type|Information|Optional
|-|-|-|-
|User|```User```| MangaDex User Object | No
|Order|```Number\|String```| Order of the returned list (see ```enum/listing-order.js```) | Yes
|Category|```Number```| Category of the returned list (eg Dropped and Re-Reading) (see ```enum/viewing-categories.js```) | Yes

Uses a user object to execute fill() on their MDList. Generally, it is better to use ```User.list```. 

```javascript

let list = new MDList();
await list.fill(LIST_ID, listingOrder["Follows (Des)"], viewingCategories.DROPPED);
console.log(`There are ${list.manga.length} dropped manga in this MDList.`)

```

## MDNet

**Called with api.MDNet** <br>
**(MDNet is the same as Mangadex@Home)**

### ```static Promise getClient(id)```
|Arguments|Type|Information|Optional
|-|-|-|-
|id| ```Number``` | ID of client | No

Returns information about a MDNet Client. 
Information includes its status, its total bytes served, and its failure rate.

### ```static Promise getAllClients()```

Returns information the same as ```getClient()``` for every MDNet client as an array.

```javascript

let clients = await MDNet.getAllClients();
console.log(`There are ${clients.filter(e => e.available).length} online currently.`);

```

# Errors

Service may be shut down during a DDOS attack.
