let page = 2;
let loading = false;
let hasNextPage = true;

const feed = document.getElementById("feed");
const trigger = document.getElementById("load-more-trigger");

if (feed && trigger) {

const observer = new IntersectionObserver(async (entries) => {
    if (!entries[0].isIntersecting || loading || !hasNextPage) return;

    loading = true;

    try {
        const url = new URL(window.location.href);
        url.searchParams.set("page", page);

        const response = await fetch(url, {
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            }
        });

        const html = await response.text();

        const hasNext = response.headers.get("X-Has-Next");

        if (hasNext === "false") {
            hasNextPage = false;
            observer.disconnect();
        }

        feed.insertAdjacentHTML("beforeend", html);

        page += 1;

    } catch (err) {
        console.log("Profile scroll error:", err);
    }

    loading = false;

}, {
    threshold: 1.0
});

observer.observe(trigger);

}