window.addEventListener("load", function () {
  const pageLoader = document.getElementById("pageLoader");

  setTimeout(() => {
    pageLoader.classList.add("hide");
  }, 900);
});

const fileInput = document.getElementById("pdfFile");
const fileName = document.getElementById("fileName");
const analyzeBtn = document.getElementById("analyzeBtn");
const resultDiv = document.getElementById("result");
const loader = document.getElementById("loader");
const btnText = document.getElementById("btnText");
const taskCards = document.querySelectorAll(".task-card");
const themeToggle = document.getElementById("themeToggle");

const customAlert = document.getElementById("customAlert");
const closeAlert = document.getElementById("closeAlert");
const alertMessage = document.getElementById("alertMessage");

let selectedTask = "Summarize this PDF";

function showAlert(message) {
  alertMessage.innerText = message;
  customAlert.classList.remove("hidden");
}

closeAlert.addEventListener("click", function () {
  customAlert.classList.add("hidden");
});

customAlert.addEventListener("click", function (event) {
  if (event.target === customAlert) {
    customAlert.classList.add("hidden");
  }
});

taskCards.forEach(card => {
  card.addEventListener("click", function () {
    taskCards.forEach(c => c.classList.remove("active"));
    this.classList.add("active");
    selectedTask = this.dataset.task;
  });
});

themeToggle.addEventListener("click", function () {
  const html = document.documentElement;
  const currentTheme = html.getAttribute("data-theme");

  if (currentTheme === "dark") {
    html.setAttribute("data-theme", "light");
    themeToggle.innerText = "☀️ Light";
  } else {
    html.setAttribute("data-theme", "dark");
    themeToggle.innerText = "🌙 Dark";
  }
});

fileInput.addEventListener("change", function () {
  fileName.innerText = fileInput.files.length > 0
    ? fileInput.files[0].name
    : "No PDF selected";
});

function formatAIText(text) {
  return text.replace(/\*\*(.*?)\*\*/g, "$1");
}

function typeText(element, text, speed = 6) {
  element.innerText = "";

  let index = 0;

  const typing = setInterval(() => {
    element.innerText += text.charAt(index);
    index++;

    element.scrollTop = element.scrollHeight;

    if (index >= text.length) {
      clearInterval(typing);
    }
  }, speed);
}

analyzeBtn.addEventListener("click", async function (event) {
  event.preventDefault();

  if (!fileInput.files.length) {
    showAlert("Please select a PDF file first.");
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);
  formData.append("task", selectedTask);

  analyzeBtn.disabled = true;
  loader.classList.remove("hidden");
  btnText.innerText = "Analyzing...";

  resultDiv.classList.remove("empty");

  resultDiv.innerHTML = `
    <div class="result-header">
      <h2>Analyzing your PDF...</h2>
    </div>

    <div class="loading-box">
      <div>
        <div class="big-loader"></div>
        <h3>Local AI is thinking...</h3>
        <p>Reading your PDF and preparing a clean study result.</p>
      </div>
    </div>
  `;

  try {

    const response = await fetch("http://127.0.0.1:8000/study", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    const cleanResult = formatAIText(data.result);

    resultDiv.innerHTML = `
      <div class="result-header">
        <h2>Study Result</h2>
      </div>

      <div class="result-meta">

        <div class="meta-box">
          <span>Task</span>
          <strong>${data.task}</strong>
        </div>

        <div class="meta-box">
          <span>File</span>
          <strong>${data.filename}</strong>
        </div>

        <div class="meta-box">
          <span>Text Length</span>
          <strong>${data.text_length} characters</strong>
        </div>

      </div>

      <div class="result-content" id="typingResult"></div>
    `;

    const typingResult = document.getElementById("typingResult");

    typeText(typingResult, cleanResult, 6);

  } catch (error) {

    resultDiv.innerHTML = `
      <div class="result-header">
        <h2>Error</h2>
      </div>

      <div class="result-content">
        Could not connect to backend. Please make sure FastAPI is running.
      </div>
    `;

    console.error(error);

  } finally {

    analyzeBtn.disabled = false;
    loader.classList.add("hidden");
    btnText.innerText = "Analyze PDF";
  }
});
const chatInput = document.getElementById("chatInput");
const sendChatBtn = document.getElementById("sendChatBtn");
const chatMessages = document.getElementById("chatMessages");

function addChatMessage(message, type) {
  const div = document.createElement("div");
  div.className = type === "user" ? "user-message" : "bot-message";
  div.innerText = message;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

sendChatBtn.addEventListener("click", async function () {
  const question = chatInput.value.trim();

  if (!question) {
    showAlert("Please write a question first.");
    return;
  }

  addChatMessage(question, "user");
  chatInput.value = "";

  const loadingMsg = document.createElement("div");
  loadingMsg.className = "bot-message";
  loadingMsg.innerText = "Thinking...";
  chatMessages.appendChild(loadingMsg);

  const formData = new FormData();
  formData.append("question", question);

  try {
    const response = await fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    loadingMsg.innerText = "";
    typeText(loadingMsg, data.answer, 6);

  } catch (error) {
    loadingMsg.innerText = "Could not connect to backend.";
    console.error(error);
  }
});

chatInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    sendChatBtn.click();
  }
});