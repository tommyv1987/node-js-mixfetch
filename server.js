const express = require("express");
const {
  mixFetch,
  createMixFetch,
  disconnectMixFetch,
} = require("@nymproject/mix-fetch-node-commonjs");
const app = express();
app.use(express.static("public"));
app.use(express.json());

let isMixFetchActive = false;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

app.get("/nym-fetch", async (req, res) => {
  try {
    const url = req.query.url;

    let mixFetchOptions = {};
    if (req.headers["override-config"]) {
      if (isMixFetchActive) {
        try {
          console.log("disconnecting current mix fetch session!");
          await disconnectMixFetch();
          const sleepDuration = Math.random() * 5000 + 5000;
          await sleep(sleepDuration);
          isMixFetchActive = false;
        } catch (disconnectError) {
          console.error("error during disconnectMixFetch:", disconnectError);
        }
      }

      const overrideConfig = JSON.parse(req.headers["override-config"]);
      mixFetchOptions = {
        nymApiUrl: overrideConfig.apiUrl,
        preferredGateway: overrideConfig.preferredGateway,
        preferredNetworkRequester: overrideConfig.preferredNetworkRequester,
        forceTls: overrideConfig.forceTls,
        extra: overrideConfig.extra,
      };
    }

    console.log("creating new mix fetch options");
    await createMixFetch(mixFetchOptions);
    isMixFetchActive = true;

    console.log(mixFetchOptions);
    const args = {
      mode: "unsafe-ignore-cors",
      headers: {
        "Content-Type": "application/json",
      },
    };

    console.log("executing current mix fetch request");
    const response = await mixFetch(url, args);
    const json = await response.json();
    res.send(json);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
