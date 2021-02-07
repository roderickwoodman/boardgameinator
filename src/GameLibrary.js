import { searchApi, gamedataApi } from './Api.js'

const withoutYear = (title) => {
    if (typeof title === 'string' && title.length) {
        return title.replace(/(( +)\(([-#]?)\d{1,6}\))$/, '')
    } else {
        return title
    }
}

// for disambiguation of titles, the game ID will be put in parentheses when the API does not provide yearPublished info
const extractYearFromTitle = (title) => {
    if (typeof title === 'string' && title.length) {
        const matchesDate = title.match(/(( +)\((-?)\d{1,4}\))$/)
        if (matchesDate !== null) {
            return matchesDate[0].replace(/[^0-9-]/g, "")
        } else {
            const matchesId = title.match(/(( +)\(#\d{1,6}\))$/)
            if (matchesId !== null) {
                return matchesId[0].replace(/[^#0-9-]/g, "")
            } else {
                return null
            }
        }
    }
}

const getNonexactSearchResults = async function (titles) {
    const titleData = await Promise.all(
        titles.map( function(gameTitle) {
            return (
                searchApi(withoutYear(gameTitle)) // query the API without the disambiguation
    )}))
    return titleData
}

const getGamedataResults = async function (gameIds) {
    const gamedata = await Promise.all(
        gameIds.map( function(gameId) {
            return (
                gamedataApi(gameId) // query the API with the BGG game ID
    )}))
    return gamedata
}

// for gamedata requests by ID, get gamedata for all games with the same title
const getGamedataForIds = async function (gameIds) {
    return await getGamedataResults(gameIds)
}

// This is a helper function for the data collection needed to check and to add games to the 
// library/cache. It will do the following:
//
//   - VERIFY TITLE EXISTENCE (API)
//   - VERIFY TITLE PRESENCE IN CACHE
//   - VERIFY TITLE ACTIVE STATUS
//   - COLLECT GAME DATA FOR UNCACHED TITLES (API)
//
// This function does not update either the library/cache or the active games list, so that these
// operations can be coordinated by the calling function instead. This is necessary since many of
// the titles in this function's input list may not be ready to be added because the numerous
// accepted user input formats and multiple games having the same title can lead to ambiguity in
// which games the user really wants to make active. 
export const collectGamedataForTitles = async (cachedGameTitles, gameTitles) => {

    const status = {

        // intermediate data
        doesNotExist: [],                 // INPUT ERROR: bad title string
        alreadyActive: [],                // INPUT ERROR: title is already active
        gamesByIdNotInCache: {},          // input title string is actually an ID
        gamesByIdDict: {},                // mapping of all input IDs to titles
        gamesWithDisambigNotInCache: {},  // input title string includes year disambiguation
        ambiguousCachedGames: {},         // cannot activate the game yet
        ambiguousNewGamedata: {},         // add this new game data to cache, but cannot activate the game yet

        // final data needed
        newGamedataToActivate: [],        // add this new game data to cache and activate the game
        newGamedataToCache: [],           // add this new game data to cache
        cachedGamesToActivate: [],        // activate this game from already-cached data

    }
    let titlesToApiLookup = []
    let getGamedataAndActivate = []
    let getGamedataStillAmbiguous = []


    // CHECK CACHE FOR TITLES THAT ARE IDS (for all user title strings)

    const allCachedIds = Object.entries(cachedGameTitles).map( cachedgame => parseInt(cachedgame[1].id) )
    let uncachedGameTitlesThatAreNumbers = [], gameTitlesThatAreStrings = []
    gameTitles.forEach(function(title) {

        if (!isNaN(Number(title))) {

            // user title is actually an ID that was found in the cache 
            if (allCachedIds.includes(parseInt(title))) {
                let cacheEntry = Object.entries(cachedGameTitles).filter( game =>  game[1].id===parseInt(title))[0][1]
                status.gamesByIdDict[cacheEntry.unambiguousName] = cacheEntry.id
                if (cacheEntry.active) {
                    status.alreadyActive.push(cacheEntry.unambiguousName)
                } else { 
                    status.cachedGamesToActivate.push(cacheEntry.unambiguousName)
                }
            }

            // user title is an unknown number, need to convert it to a title string
            else  {
                uncachedGameTitlesThatAreNumbers.push(title)
            }

        } else {
            gameTitlesThatAreStrings.push(title)
        }

    })


    // API LOOKUP TO CONVERT ALL REMAINING IDS TO TITLES

    let uncachedGameTitlesThatAreStrings = []
    let gamedataForUncachedTitlesThatAreNumbers = await getGamedataForIds(uncachedGameTitlesThatAreNumbers)
    gamedataForUncachedTitlesThatAreNumbers.forEach(function(gamedata, idx) {
        if (gamedata.hasOwnProperty('name')) {
            const gameId = parseInt(gamedata.id)
            status.gamesByIdNotInCache[gamedata.name] = gameId
            uncachedGameTitlesThatAreStrings.push(gamedata.name)
        } else {
            const gameTitle = uncachedGameTitlesThatAreNumbers[idx]
            status.doesNotExist.push(gameTitle)
        }
    })
    gameTitlesThatAreStrings = [ ...gameTitlesThatAreStrings, ...uncachedGameTitlesThatAreStrings]


    // CACHE LOOKUP FOR ALL TITLES

    // build the hashmap of cached base names
    let cachedBasetitleHashmap = {}
    let cachedBasetitleHashmapEntries = Object.entries(cachedGameTitles).filter(cachedTitle => cachedTitle[0] !== cachedTitle[1].name)
    cachedBasetitleHashmapEntries.forEach(function(entry) {
        const ambiguousName = withoutYear(entry[0])
        const titleInfo = JSON.parse(JSON.stringify(entry[1]))
        if (cachedBasetitleHashmap.hasOwnProperty(ambiguousName)) {
            cachedBasetitleHashmap[ambiguousName].push(titleInfo)
        } else {
            cachedBasetitleHashmap[ambiguousName] = [ titleInfo ]
        }
    })

    // lookup in the hashmap for each input name
    const allCachedDisambiguousTitles = Object.keys(cachedGameTitles)
    gameTitlesThatAreStrings.forEach(function(userTitle) {

        // userTitle was found verbatim in the cache
        if (allCachedDisambiguousTitles.includes(userTitle)) {
            if (cachedGameTitles[userTitle].active) {
                status.alreadyActive.push(userTitle)
            } else { 
                status.cachedGamesToActivate.push(userTitle)
            }

        // userTitle with its year disambiguation removed was found in the cache
        } else if (allCachedDisambiguousTitles.includes(withoutYear(userTitle))) {
            if (cachedGameTitles[withoutYear(userTitle)].active) {
                status.alreadyActive.push(withoutYear(userTitle))
            } else { 
                status.cachedGamesToActivate.push(withoutYear(userTitle))
            }

        // userTitle base name is in cache, may have incorrect disambiguation
        } else if (Object.keys(cachedBasetitleHashmap).includes(withoutYear(userTitle))) {
            const disambiguation = JSON.parse(JSON.stringify(cachedBasetitleHashmap[withoutYear(userTitle)]))
            status.ambiguousCachedGames[withoutYear(userTitle)] = disambiguation

        // userTitle is not immediately known, collect title info via API
        } else {

            // disambiguation was supplied, but cannot validate it yet for uncached titles
            if (withoutYear(userTitle) !== userTitle) {
                status.gamesWithDisambigNotInCache[withoutYear(userTitle)] = parseInt(extractYearFromTitle(userTitle))
            }

            titlesToApiLookup.push(withoutYear(userTitle))
        }
    })
    // sort ambiguous cached titles by year published, for their eventual displaying
    Object.entries(status.ambiguousCachedGames).forEach(function(ambiguousEntry) {
        status.ambiguousCachedGames[ambiguousEntry[0]] = ambiguousEntry[1].sort( (a,b) => (a.yearPublished < b.yearPublished) ? -1 : 1 )
    })


    // API LOOKUP FOR VERSIONS OF ALL UNCACHED TITLES
    //   example disambiguation generated in "allPotentialTitles" variable:
    //     [ [{id: 2411, name:'Mount Everest', yearPublished: 1980},
    //     {id: 147624, name:'Mount Everest', yearPublished: 2013}] ]
    const allPotentialTitles = await getNonexactSearchResults(titlesToApiLookup)
    allPotentialTitles.forEach(function (allResultsForTitle, idx) {
        let allVersionsOfThisTitle = []
        allResultsForTitle.forEach(function (oneSimilarResult) {
            let newDisambiguation
            if (oneSimilarResult.name.toLowerCase() === titlesToApiLookup[idx].toLowerCase()) {
                newDisambiguation = JSON.parse(JSON.stringify(oneSimilarResult))
                allVersionsOfThisTitle.push(newDisambiguation)
            }
        })
        allPotentialTitles[idx] = allVersionsOfThisTitle
    })
    // bundle each title into one and only one status bucket 
    titlesToApiLookup.forEach(function (userTitle, idx) {

        // title exists
        if (allPotentialTitles[idx].length > 0) {

            // convert to IDs for the upcoming game data API call
            allPotentialTitles[idx].forEach(function (thisTitleVersion) {
                const gameId = parseInt(thisTitleVersion.id)
                if (allPotentialTitles[idx].length === 1) {
                    getGamedataAndActivate.push(gameId)
                } else {
                    getGamedataStillAmbiguous.push(gameId)
                }
            })

        // title does not exist
        } else {
            status.doesNotExist.push(userTitle)
        }

    })


    // API RETRIEVAL OF GAME DATA FOR ALL TITLE VERSIONS

    const idsForGamedataApi = [ ...getGamedataAndActivate, ...getGamedataStillAmbiguous ]
    const allNewGamedata = await getGamedataResults(idsForGamedataApi)
    allNewGamedata.forEach(function (thisGamedata) {
        let newGamedata = JSON.parse(JSON.stringify(thisGamedata))

        // collect game data for titles to activate
        if (getGamedataAndActivate.includes(thisGamedata.id)) {
            newGamedata['unambiguousName'] = thisGamedata.name
            status.newGamedataToActivate[thisGamedata.name] = newGamedata

        // collect game data for other titles
        } else if (getGamedataStillAmbiguous.includes(thisGamedata.id)) {
            const unambiguousName = `${thisGamedata.name} (${thisGamedata.yearPublished})`
            newGamedata['unambiguousName'] = unambiguousName

            // if user supplied a game ID originally, but its title was ambiguous, apply that disambiguation
            if (status.gamesByIdNotInCache.hasOwnProperty(thisGamedata.name)) {
                if (status.gamesByIdNotInCache[thisGamedata.name] === thisGamedata.id) {
                    status.gamesByIdDict[unambiguousName] = thisGamedata.id
                    status.newGamedataToActivate.push(newGamedata)
                } else {
                    status.newGamedataToCache.push(newGamedata)
                }

            // if user supplied year disambiguation originally, but its title was ambiguous, apply that disambiguation
            } else if (status.gamesWithDisambigNotInCache.hasOwnProperty(thisGamedata.name)) {
                const targetYear = status.gamesWithDisambigNotInCache[thisGamedata.name]
                const gamedataForTargetYear = allNewGamedata.filter( myTitleGamedata => myTitleGamedata.yearPublished === targetYear )
                // the given year does exist in the gamedata
                if (gamedataForTargetYear.length === 1) {
                    if (status.gamesWithDisambigNotInCache[thisGamedata.name] === thisGamedata.yearPublished) {
                        status.newGamedataToActivate.push(newGamedata)
                    } else {
                        status.newGamedataToCache.push(newGamedata)
                    }
                // the given year is bogus 
                } else {
                    if (status.ambiguousNewGamedata.hasOwnProperty(thisGamedata.name)) {
                        status.ambiguousNewGamedata[thisGamedata.name].push(newGamedata)
                    } else {
                        let ambiguousNewGamedataBundle = []
                        ambiguousNewGamedataBundle.push(newGamedata) 
                        status.ambiguousNewGamedata[thisGamedata.name] = ambiguousNewGamedataBundle
                    }
                }

            // if user supplied an ambiguous title originally, game data remains ambiguous for now
            } else {
                if (status.ambiguousNewGamedata.hasOwnProperty(thisGamedata.name)) {
                    status.ambiguousNewGamedata[thisGamedata.name].push(newGamedata)
                } else {
                    let ambiguousNewGamedataBundle = []
                    ambiguousNewGamedataBundle.push(newGamedata) 
                    status.ambiguousNewGamedata[thisGamedata.name] = ambiguousNewGamedataBundle
                }
            }
        }

    })
    Object.entries(status.ambiguousNewGamedata).forEach(function(ambiguousEntry) {
        status.ambiguousNewGamedata[ambiguousEntry[0]] = ambiguousEntry[1].sort( (a,b) => (a.yearPublished < b.yearPublished) ? -1 : 1 )
    })

    return status

}

export const validateUserTitles = async (cachedTitles, userTitles) => { 

    const displayNameForMessages = function (title) {
        const allCachedIds = Object.entries(cachedTitles).map( cachedgame => parseInt(cachedgame[1].id) )
        if (allCachedIds.includes(parseInt(title))) {
            const unambiguousName = Object.values(cachedTitles).filter( cachedgame => cachedgame.id === parseInt(title) )[0].unambiguousName
            return `[#${title}] ${unambiguousName}`
        } else {
            return title
        }
    }

    let validationResult = {}, keepModalOpen = false
    let collectionResult = await collectGamedataForTitles(cachedTitles, userTitles)

    collectionResult['selectedGamesToActivate'] = []
    collectionResult['ambiguousTitleCount'] = Object.keys(collectionResult.ambiguousCachedGames).length + Object.keys(collectionResult.ambiguousNewGamedata).length

    // Prompt the user for disambiguation
    let newMessages = []
    Object.entries(collectionResult.ambiguousCachedGames).forEach(function(ambiguousCachedTitleInfo) {
        let ambiguousCachedIdsArr = JSON.parse(JSON.stringify(ambiguousCachedTitleInfo[1]))
        newMessages.push({ messageStr: `Which version of "${ambiguousCachedTitleInfo[0]}"? `, ambiguous: ambiguousCachedIdsArr, errorFlag: false })
        keepModalOpen = true
    })
    Object.entries(collectionResult.ambiguousNewGamedata).forEach(function(ambiguousTitleInfo) {
        // it was tagged as "ambiguous", but this title has user-supplied ID for disambiguation
        if (collectionResult.gamesByIdNotInCache.hasOwnProperty(ambiguousTitleInfo[0])) {
            if (collectionResult.gamesByIdNotInCache[ambiguousTitleInfo[0]] === ambiguousTitleInfo[1].id) {
                collectionResult.selectedGamesToActivate.push(ambiguousTitleInfo[1].unambiguousName)
            }
        // this title was a user-supplied name string and still requires user disambiguation
        } else {
            let ambiguousGamedataArr = JSON.parse(JSON.stringify(ambiguousTitleInfo[1]))
            newMessages.push({ messageStr: `Which version of "${ambiguousTitleInfo[0]}"? `, ambiguous: ambiguousGamedataArr, errorFlag: false })
            keepModalOpen = true
        }
    })

    collectionResult['routedGamesTreatment'] = 'none'
    validationResult['gameValidations'] = collectionResult

    // Prepend the game title with the game ID, when the ID was supplied by the user
    let gameIdTxt = ''

    // Inform the user of all other games that could not be added
    let titleCountAlreadyActive = 0, appendTitlesAlreadyActive = []
    for (let activeTitle of collectionResult.alreadyActive) {
        titleCountAlreadyActive += 1
        if (collectionResult.gamesByIdDict.hasOwnProperty(activeTitle)) {
            gameIdTxt = `[#${collectionResult.gamesByIdDict[activeTitle]}] `
        } else {
            gameIdTxt = ''
        }
        appendTitlesAlreadyActive.push(gameIdTxt + activeTitle)
        keepModalOpen = true
    }
    if (titleCountAlreadyActive > 0) {
        let messageTxt, prependTitlesAlreadyActive
        if (titleCountAlreadyActive === 1) {
            prependTitlesAlreadyActive = [...appendTitlesAlreadyActive]
            appendTitlesAlreadyActive = []
            messageTxt = 'is already active'
        } else {
            prependTitlesAlreadyActive = []
            messageTxt = `${titleCountAlreadyActive} titles are already active`
        }
        newMessages.push({ 
          errorFlag: true,
          messageStr: messageTxt,
          prependTitles: prependTitlesAlreadyActive,
          appendTitles: appendTitlesAlreadyActive
        })
        keepModalOpen = true
    }
    let titleCountDoesNotExist = 0, appendTitlesDoesNotExist = []
    for (let nonexistentTitle of collectionResult.doesNotExist) {
        titleCountDoesNotExist += 1
        appendTitlesDoesNotExist.push(nonexistentTitle)
        keepModalOpen = true
    }
    if (titleCountDoesNotExist > 0) {
        let messageTxt, prependTitlesDoesNotExist
        if (titleCountDoesNotExist === 1) {
            prependTitlesDoesNotExist = [...appendTitlesDoesNotExist]
            appendTitlesDoesNotExist = []
            messageTxt = 'does not exist'
        } else {
            prependTitlesDoesNotExist = []
            messageTxt = `${titleCountDoesNotExist} titles do not exist`
        }
        newMessages.push({ 
          errorFlag: true,
          messageStr: messageTxt,
          prependTitles: prependTitlesDoesNotExist,
          appendTitles: appendTitlesDoesNotExist
        })
    }

    // Inform the user of all other games that will be added
    let titleCountToAdd = 0, appendTitlesToAdd = []
    for (let inactiveTitle of collectionResult.cachedGamesToActivate) {
        titleCountToAdd += 1
        if (collectionResult.gamesByIdNotInCache.hasOwnProperty(inactiveTitle)) {
            gameIdTxt = `[#${collectionResult.gamesByIdNotInCache[inactiveTitle]}] `
        } else {
            gameIdTxt = ''
        }
        appendTitlesToAdd.push(gameIdTxt + displayNameForMessages(inactiveTitle))
    }
    for (let unambiguousNewTitle of Object.keys(collectionResult.newGamedataToActivate)) {
        titleCountToAdd += 1
        if (collectionResult.gamesByIdNotInCache.hasOwnProperty(unambiguousNewTitle)) {
            gameIdTxt = `[#${collectionResult.gamesByIdNotInCache[unambiguousNewTitle]}] `
        } else {
            gameIdTxt = ''
        }
        appendTitlesToAdd.push(gameIdTxt + displayNameForMessages(unambiguousNewTitle))
    }
    if (titleCountToAdd > 0) {
        let messageTxt, prependTitlesToAdd
        let otherTxt = ( (Object.keys(collectionResult.ambiguousCachedGames).length > 0) 
                            || (Object.keys(collectionResult.ambiguousNewGamedata).length > 0) 
                            || (collectionResult.doesNotExist.length > 0)
                            || (collectionResult.alreadyActive.length > 0) )
                            ? ' other' : ''
        if (titleCountToAdd === 1) {
            prependTitlesToAdd = [...appendTitlesToAdd]
            appendTitlesToAdd = []
            messageTxt = 'Adding'

        } else {
            prependTitlesToAdd = []
            messageTxt = `Adding ${titleCountToAdd}${otherTxt} titles`
        }
        newMessages.push({ 
          errorFlag: false,
          messageStr: messageTxt,
          prependTitles: prependTitlesToAdd,
          appendTitles: appendTitlesToAdd
        })
    }
    validationResult['messages'] = newMessages
    validationResult['keepModalOpen'] = keepModalOpen

    return validationResult
}
