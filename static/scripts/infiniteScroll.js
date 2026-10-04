const feed = document.getElementById("feed");
const trigger = document.getElementById("load-more-trigger");

if (!feed || !trigger) {
    console.log("Infinite scroll skipped on this page");
} else {

    let page = 2;
    let loading = false;
    let hasNextPage = true;

    const observer = new IntersectionObserver(async (entries) => {
        if (!entries[0].isIntersecting || loading || !hasNextPage) return;

        loading = true;

        const url = new URL(window.location.href);
        url.searchParams.set("page", page);

        const response = await fetch(url, {
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            }
        });

        const html = await response.text();
        const hasNext = response.headers.get("X-Has-Next") === "true";

        if (!hasNext) {
            hasNextPage = false;
            observer.disconnect();
        }

        feed.insertAdjacentHTML("beforeend", html);

        page++;
        loading = false;

    }, { threshold: 1 });

    observer.observe(trigger);
}