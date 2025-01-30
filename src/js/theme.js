export function setupThemeToggle() {
    const toggleButton = document.createElement("button");
    toggleButton.id = "mode-toggle";
    toggleButton.style.position = "fixed";
    toggleButton.style.top = "20px";
    toggleButton.style.right = "20px";
    toggleButton.style.padding = "10px";
    toggleButton.style.border = "none";
    toggleButton.style.borderRadius = "5px";
    toggleButton.style.cursor = "pointer";
    toggleButton.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.2)";

    function updateMode() {
        if (localStorage.getItem("dark-mode") === "enabled") {
            document.body.classList.add("dark-mode");
            toggleButton.innerText = "☀️";
            toggleButton.style.background = "#333";
            toggleButton.style.color = "#fff";
        } else {
            document.body.classList.remove("dark-mode");
            toggleButton.innerText = "🌙";
            toggleButton.style.background = "#fff";
            toggleButton.style.color = "#333";
        }
    }

    toggleButton.addEventListener("click", function () {
        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("dark-mode", "disabled");
        } else {
            localStorage.setItem("dark-mode", "enabled");
        }
        updateMode();
    });

    document.body.appendChild(toggleButton);
    updateMode();
}
