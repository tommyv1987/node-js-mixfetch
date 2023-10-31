document.addEventListener("DOMContentLoaded", function () {
  const advancedOptions = document.getElementById("advancedOptions");
  const overrideConfigToggle = document.getElementById("overrideConfigToggle");
  const keepConfigToggle = document.getElementById("keepConfigToggle");
  const urlInput = document.getElementById("urlInput");
  const maxRetries = 3;

  function toggleAdvancedOptions() {
    if (overrideConfigToggle.checked) {
      advancedOptions.style.display = "block";
    } else {
      advancedOptions.style.display = "none";
    }
  }

  toggleAdvancedOptions();
  overrideConfigToggle.addEventListener("change", toggleAdvancedOptions);

  document
    .getElementById("fetchButton")
    .addEventListener("click", async function () {
      await fetchData(0); 
    });

  async function fetchData(retryCount) {
    const fetchButton = document.getElementById("fetchButton");
    const resultDiv = document.getElementById("result");
    resultDiv.textContent = "";

    fetchButton.disabled = true;
    const url = urlInput.value.trim();
    const overrideConfig = overrideConfigToggle.checked;

    if (!url) {
      resultDiv.textContent = "please enter a URL.";
      fetchButton.disabled = false;
      return;
    }

    let requestOptions = {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    };

    if (overrideConfig) {
      const overrideConfigData = {
        apiUrl: document.getElementById("apiUrl").value.trim(),
        preferredGateway: document
          .getElementById("preferredGateway")
          .value.trim(),
        preferredNetworkRequester: document
          .getElementById("preferredNetworkRequester")
          .value.trim(),
        forceTls: document.getElementById("forceTls").checked,
        extra: {
          hiddenGateways: [
            {
              owner: document.getElementById("extraOwner").value.trim(),
              host: document.getElementById("extraHost").value.trim(),
              explicitIp: document.getElementById("extraIp").value.trim(),
              identityKey: document
                .getElementById("extraIdentityKey")
                .value.trim(),
              sphinxKey: document.getElementById("extraSphinxKey").value.trim(),
            },
          ],
        },
      };

      requestOptions.headers["Override-Config"] =
        JSON.stringify(overrideConfigData);
    }

    try {
      const response = await fetch(
        `/nym-fetch?url=${encodeURIComponent(url)}`,
        requestOptions
      );
      if (!response.ok) {
        throw new Error("lol not good sir");
      }
      const data = await response.json();
      resultDiv.textContent = JSON.stringify(data, null, 2);

      resetFields();
    } catch (error) {
      if (
        retryCount < maxRetries &&
        error.message.includes("mix fetch hasn't been initialised")
      ) {
        console.log(`retrying request (${retryCount + 1}/${maxRetries})...`);
        await fetchData(retryCount + 1);
      } else {
        resultDiv.textContent = "error: " + error.message;
      }
    } finally {
      fetchButton.disabled = false;
    }
  }

  function resetFields() {
    urlInput.value = "";
    if (!keepConfigToggle.checked) {
      overrideConfigToggle.checked = false;
      toggleAdvancedOptions();
      document.getElementById("apiUrl").value = "";
      document.getElementById("preferredGateway").value = "";
      document.getElementById("preferredNetworkRequester").value = "";
      document.getElementById("forceTls").checked = false;
      document.getElementById("extraOwner").value = "";
      document.getElementById("extraHost").value = "";
      document.getElementById("extraIp").value = "";
      document.getElementById("extraIdentityKey").value = "";
      document.getElementById("extraSphinxKey").value = "";
    }
  }
});
