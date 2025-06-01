// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();

function updateDateTime() {
  const dateElem = document.getElementById("currentDate");
  const timeElem = document.getElementById("currentTime");

  const now = new Date();

  // Format date (e.g., 17 May 2025)
  const dateOptions = { day: "numeric", month: "short", year: "numeric" };
  const formattedDate = now.toLocaleDateString("en-US", dateOptions);

  // Format time (e.g., 09:45:30 AM)
  const formattedTime = now.toLocaleTimeString("en-US");

  dateElem.textContent = formattedDate;
  timeElem.textContent = formattedTime;
}

setInterval(updateDateTime, 1000); // Update every second
window.onload = updateDateTime; // Initialize on load
