/**
 * Hitler crawler
 * You may know a joke that says each dialog will end with a discussion about Hitler. Let’s check it on Wikipedia.
 * You should create a program that receives a Wikipedia article and scans it for other Wikipedia links, opens them,
 * and scans for links until it finds the link to Hitler Wikipedia page.
 *
 * Task
 * Write a console application for searching the Hitler Wikipedia page presented here.
 * Input is a link to some Wikipedia page
 * Output is the path to the Hitler page, if the page is not found in 6 hops just write into the console “Hitler not found”
 * Try to optimize the search for multiple usages
 * Try to optimize search by parallelization
 **/

"use strict";

let url = "https://en.wikipedia.org/w/api.php?origin=*";

const ATTEMPTS = 6;

let attemptsCounter = 0;

const params = {
  action: "parse",
  format: "json",
  prop: "links"
};

function getDestinationOfLink(wikiLink) {
  return wikiLink.split(':').slice(-1)[0];
}

async function scanLinks(links) {
  const promises = links.map(async (link) => {
    const linksArr = [];
    try {
      let urlCopy = url;
      Object.keys(params).forEach(function(key) {
        urlCopy += "&" + key + "=" + params[key];
      });

      urlCopy += `&page=${link}`;

      const resp = await fetch(urlCopy)

      const data = await resp.json();

      if (!data.parse) {
        return [];
      }

      for (const wikiLinkObj of data.parse.links) {
        const linkDestination = wikiLinkObj['*'];
        if (linkDestination === 'Adolf Hitler') {
          return linkDestination;
        } else {
          linksArr.push(linkDestination);
        }
      }

      return linksArr
    } catch (error) {
      console.error('Error:', error);
    }
  })

  return (await Promise.all(promises)).flat()
}

async function searchHitler(links) {
  if (attemptsCounter === ATTEMPTS) {
    return "Hitler not found";
  }

  const response = await scanLinks(links)

  if (response[0] === 'Adolf Hitler') {
    return 'https://en.wikipedia.org/wiki/Adolf_Hitler'
  } else if (attemptsCounter < ATTEMPTS) {
    attemptsCounter++;
    return await searchHitler(response)
  }
}

async function main() {
  // Links to find Hitler on page: Schutzstaffel, Fascism
  // Links to not find Hitler on page: France

  const hitlerAppearance = await searchHitler(["Adolf Hitler"]);

  console.log(hitlerAppearance)

  return 0;
}

main();