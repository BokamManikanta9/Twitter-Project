function showTab(tab) {

    let posts = document.getElementById("posts-section");
    let replies = document.getElementById("replies-section");

    let tabs = document.querySelectorAll(".tab");

    tabs.forEach(t => t.classList.remove("active"));

    if (tab === "posts") {
        posts.style.display = "block";
        replies.style.display = "none";
        tabs[0].classList.add("active");
    }
    else {
        posts.style.display = "none";
        replies.style.display = "block";
        tabs[1].classList.add("active");
    }
}