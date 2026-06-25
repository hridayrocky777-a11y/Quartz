// Navigation button functionality

// Enter the website URL or local file path here.
// Example: "https://example.com" or "./page.html"
// Set to qurtz.html (redirects to quartz.html) so the navigation button works.
const websiteURL = "../html/qurtz.html";

document.getElementById('navigationBtn').addEventListener('click', function() {
    if (websiteURL.trim()) {
        window.location.href = websiteURL.trim();
    } else {
        alert("Please add a website URL or file path in script.js");
    }
});