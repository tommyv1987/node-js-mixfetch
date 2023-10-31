document
  .getElementById("fetchButton")
  .addEventListener("click", async function () {
    const urlInput = document.getElementById("urlInput");
    const resultDiv = document.getElementById("result");
    const url = urlInput.value.trim();

    if (!url) {
      resultDiv.textContent = "Please enter a URL.";
      this.disabled = false;
      return;
    }

    try {
      const response = await fetch(
        "/nym-fetch?url=" + encodeURIComponent(url),
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("lol network error");
      }
      const data = await response.json();
      resultDiv.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
      resultDiv.textContent = "error: " + error.message;
    }

    this.disabled = false;
  });
