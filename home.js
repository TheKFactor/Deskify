const tabs = document.querySelectorAll("[data-auth-tab]");
const forms = {
  register: document.querySelector("#registerForm"),
  login: document.querySelector("#loginForm")
};
const note = document.querySelector("#authNote");

function setTab(tabName) {
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.authTab === tabName));
  Object.entries(forms).forEach(([name, form]) => form.classList.toggle("active", name === tabName));
  note.textContent = "";
}

function openWorkspace(user) {
  localStorage.setItem("deskifyUser", JSON.stringify(user));
  window.location.href = "app.html";
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => setTab(tab.dataset.authTab));
});

forms.register.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(forms.register);
  const user = {
    name: data.get("name").trim(),
    email: data.get("email").trim()
  };
  note.textContent = "Creating your Deskify workspace...";
  openWorkspace(user);
});

forms.login.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(forms.login);
  const email = data.get("email").trim();
  const stored = JSON.parse(localStorage.getItem("deskifyUser") || "null");
  note.textContent = "Opening Deskify...";
  openWorkspace(stored && stored.email === email ? stored : { name: "Deskify user", email });
});
