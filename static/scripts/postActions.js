function toggleComments(icon) {
    let postCard = icon.closest('.post-card');
    let commentBox = postCard.querySelector('.comment-section');
    commentBox.style.display = commentBox.style.display === "block" ? "none" : "block";
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie) {
        document.cookie.split(';').forEach(cookie => {
            cookie = cookie.trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            }
        });
    }
    return cookieValue;
}

function toggleLike(icon) {
    let postId = icon.dataset.post;
    fetch(`/posts/like/${postId}/`, {
        method: 'POST',
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
    })
    .then(res => res.json())
    .then(data => {
        icon.classList.toggle("active", data.liked);
        icon.nextElementSibling.innerText = data.count;
    });
}


document.addEventListener("submit", function (e) {
    const form = e.target;

    if (!form.classList.contains("comment-form") && !form.classList.contains("reply-form")) {
        return;
    }

    e.preventDefault();

    fetch(form.action, {
        method: "POST",
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "X-Requested-With": "XMLHttpRequest"
        },
        body: new FormData(form)
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) return;

        if (form.classList.contains("reply-form")) {
            handleReplyInsert(form, data);
        } else {
            const list = form.closest(".comment-section").querySelector(".comments-list");
            list.insertAdjacentHTML("beforeend", data.html);
            form.reset();
        }
    });
});

function handleReplyInsert(form, data) {
    const parentId = data.parent_id; 
    form.remove();

    if (!parentId) {
        const list = form.closest(".comment-section").querySelector(".comments-list");
        list.insertAdjacentHTML("beforeend", data.html);
        return;
    }

    const parentComment = document.getElementById(`comment-${parentId}`);
    if (!parentComment) return;

    const parentBody = parentComment.querySelector(":scope > .comment-body");
    let group = parentBody.querySelector(`:scope > .reply-group[data-parent="${parentId}"]`);

    if (!group) {
        group = document.createElement("div");
        group.className = "reply-group";
        group.dataset.parent = parentId;
        group.innerHTML = `
            <button type="button" class="show-replies" onclick="toggleReplies(this)">
                <span class="show-replies-icon">⌃</span> View 1 reply
            </button>
            <div class="replies-container" id="replies-${parentId}" style="display:block;"></div>
        `;
        parentBody.appendChild(group);
    }

    const container = group.querySelector(".replies-container");
    container.insertAdjacentHTML("beforeend", data.html);
    container.style.display = "block";

    const btn = group.querySelector(".show-replies");
    const count = container.querySelectorAll(":scope > .comment").length;
    btn.innerHTML = `<span class="show-replies-icon">⌃</span> View ${count} repl${count === 1 ? "y" : "ies"}`;
}

function toggleReplyForm(el) {
    const commentId = el.dataset.comment;
    const postUrl = el.dataset.url;

    const actions = el.closest(".comment-actions");
    let existing = actions.nextElementSibling;

    if (existing?.classList.contains("reply-form")) {
        existing.remove();
        return;
    }

    const form = document.createElement("form");
    form.className = "reply-form";
    form.method = "POST";
    form.action = postUrl;

    form.innerHTML = `
        <input type="hidden" name="csrfmiddlewaretoken" value="${getCookie('csrftoken')}">
        <input type="hidden" name="parent_id" value="${commentId}">
        <input type="text" name="comment" placeholder="Write a reply..." required>
        <button type="submit">Reply</button>
    `;

    actions.insertAdjacentElement("afterend", form);
}

function toggleReplies(btn) {
    console.log(btn);
    console.log(btn.nextElementSibling);

    const container = btn.nextElementSibling;
    if (!container) {
        console.log("No replies container found!");
        return;
    }

    const isHidden = container.style.display === "none";
    container.style.display = isHidden ? "block" : "none";

    const count = container.querySelectorAll(":scope > .comment").length;
    btn.innerHTML = `<span class="show-replies-icon">${isHidden ? "⌃" : "⌄"}</span>
        ${isHidden ? "Hide" : "View"} ${count} repl${count === 1 ? "y" : "ies"}`;
}

function getDeleteDialog() {
    let dialog = document.getElementById("delete-comment-dialog");
    if (dialog) return dialog;

    dialog = document.createElement("dialog");
    dialog.id = "delete-comment-dialog";
    dialog.className = "confirm-dialog";
    dialog.innerHTML = `
        <div class="confirm-dialog-content">
            <h3>Delete comment?</h3>
            <p>This can't be undone.</p>
            <div class="confirm-dialog-actions">
                <button type="button" class="btn-secondary" data-action="cancel">Cancel</button>
                <button type="button" class="btn-danger" data-action="confirm">Delete</button>
            </div>
        </div>
    `;
    document.body.appendChild(dialog);

    dialog.addEventListener("click", function (e) {
        if (e.target === dialog) dialog.close(); // click on backdrop
    });

    return dialog;
}

function confirmDeleteComment(deleteBtn) {
    const dialog = getDeleteDialog();
    dialog.showModal();

    const cancelBtn = dialog.querySelector('[data-action="cancel"]');
    const confirmBtn = dialog.querySelector('[data-action="confirm"]');

    const newCancel = cancelBtn.cloneNode(true);
    const newConfirm = confirmBtn.cloneNode(true);
    cancelBtn.replaceWith(newCancel);
    confirmBtn.replaceWith(newConfirm);

    newCancel.addEventListener("click", () => dialog.close());

    newConfirm.addEventListener("click", () => {
        fetch(deleteBtn.dataset.url, {
            method: "POST",
            headers: {
                "X-CSRFToken": getCookie("csrftoken"),
                "X-Requested-With": "XMLHttpRequest"
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const comment = document.getElementById(`comment-${data.comment_id}`);
                if (comment) comment.remove();
            }
        })
        .finally(() => dialog.close());
    });
}


document.addEventListener("click", function (e) {

    const deleteBtn = e.target.closest(".comment-delete-btn");
    if (deleteBtn) {
        confirmDeleteComment(deleteBtn);
        return;
    }

    const editBtn = e.target.closest(".comment-edit-btn");
    if (editBtn) {
        startCommentEdit(editBtn);
        return;
    }

    const cancelBtn = e.target.closest(".cancel-comment-btn");
    if (cancelBtn) {
        const comment = cancelBtn.closest(".comment");
        restoreCommentActions(comment, comment.dataset.originalText, comment.dataset.actionsHtml);
        return;
    }

    const saveBtn = e.target.closest(".save-comment-btn");
    if (saveBtn) {
        saveCommentEdit(saveBtn);
        return;
    }
});

function startCommentEdit(editBtn) {
    const comment = editBtn.closest(".comment");
    const textDiv = comment.querySelector("[data-comment-text]");
    const actions = editBtn.closest(".comment-actions");

    const originalText = textDiv.innerText.trim();

    comment.dataset.originalText = originalText;
    comment.dataset.actionsHtml = actions.innerHTML;
    comment.dataset.editUrl = editBtn.dataset.url;

    textDiv.innerHTML = `<textarea class="comment-edit-input">${originalText}</textarea>`;

    actions.innerHTML = `
        <button type="button" class="save-comment-btn">Save</button>
        <button type="button" class="cancel-comment-btn">Cancel</button>
    `;
}

function restoreCommentActions(comment, originalText, actionsHtml) {
    const textDiv = comment.querySelector("[data-comment-text]");
    textDiv.innerText = originalText;
    comment.querySelector(".comment-actions").innerHTML = actionsHtml;
}

function saveCommentEdit(saveBtn) {
    const comment = saveBtn.closest(".comment");
    const textarea = comment.querySelector(".comment-edit-input");
    const editUrl = comment.dataset.editUrl;

    fetch(editUrl, {
        method: "POST",
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "X-Requested-With": "XMLHttpRequest"
        },
        body: new URLSearchParams({ text: textarea.value })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            alert(data.error || "Could not save comment.");
            return;
        }

        const textDiv = comment.querySelector("[data-comment-text]");
        textDiv.innerText = data.text;

        restoreCommentActions(comment, data.text, comment.dataset.actionsHtml);
    });
}

function toggleRepost(icon) {
    const postId = icon.dataset.post;

    fetch(`/posts/repost/${postId}/`, {
        method: "POST",
        headers: {
            "X-CSRFToken": getCookie("csrftoken")
        }
    })
    .then(res => res.json())
    .then(data => {

        // Update all repost buttons for this post
        const repostButtons = document.querySelectorAll(
            `.repost-btn[data-post="${postId}"]`
        );

        repostButtons.forEach(button => {
            button.classList.toggle("active", data.reposted);

            const count = button.nextElementSibling;

            if (count) {
                count.innerText = data.count;
            }
        });

        if (data.reposted) {

            const feed = document.getElementById("feed");

            if (feed) {
                feed.insertAdjacentHTML(
                    "afterbegin",
                    data.html
                );
            }

            return;
        }

        // Repost removed
        const repostCard = document.querySelector(
            `.post-card[data-repost-card="true"][data-post-id="${postId}"][data-own-repost="true"]`
        );

        if (repostCard) {
            repostCard.remove();
        }
    });
}

function toggleShareMenu(btn) {
    document.querySelectorAll(".share-menu").forEach(menu => {
        if (menu !== btn.nextElementSibling) {
            menu.style.display = "none";
        }
    });

    const menu = btn.nextElementSibling;
    menu.style.display = menu.style.display === "block" ? "none" : "block";
}

function closeShareMenu(btn) {
    btn.closest(".share-menu").style.display = "none";
}

function copyPostLink(btn) {
    const postId = btn.dataset.post;

    const url = `${window.location.origin}/posts/${postId}/`;

    navigator.clipboard.writeText(url).then(() => {
        btn.innerText = "Copied!";
        setTimeout(() => {
            btn.innerText = "Copy link";
        }, 1200);
    });

    btn.closest(".share-menu").style.display = "none";
}

document.addEventListener("click", function (e) {
    if (!e.target.closest(".share-wrapper")) {
        document.querySelectorAll(".share-menu").forEach(m => m.style.display = "none");
    }
});

function toggleBookmark(el) {
    const postId = el.getAttribute("data-post");

    fetch(`/posts/bookmark/${postId}/`, {
        method: "POST",
        headers: {
            "X-CSRFToken": getCookie("csrftoken")
        }
    })
    .then(res => res.json())
    .then(data => {

        const bookmarked = data.status === "bookmarked";

        el.classList.toggle("active", bookmarked);

        if (!bookmarked) {
            const postCard = el.closest(".post-card");

            if (postCard) {
                const bookmarksPage = window.location.pathname.includes(
                    "/posts/bookmarks"
                );

                if (bookmarksPage) {
                    postCard.remove();
                }
            }
        }
    });
}

function togglePostMenu(btn) {
    let menu = btn.nextElementSibling;

    document.querySelectorAll('.options-menu').forEach(m => {
        if (m !== menu) m.style.display = 'none';
    });

    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
}

document.addEventListener('click', function(e) {
    if (!e.target.closest('.options-wrapper')) {
        document.querySelectorAll('.options-menu').forEach(m => {
            m.style.display = 'none';
        });
    }
});
document.addEventListener("submit", function (e) {
    const form = e.target;
    if (!form.classList.contains("delete-post-form")) return;

    e.preventDefault();
    confirmDeletePost(form);
});

function getDeletePostDialog() {
    let dialog = document.getElementById("delete-post-dialog");
    if (dialog) return dialog;

    dialog = document.createElement("dialog");
    dialog.id = "delete-post-dialog";
    dialog.className = "confirm-dialog";
    dialog.innerHTML = `
        <div class="confirm-dialog-content">
            <h3>Delete post?</h3>
            <p>This can't be undone.</p>
            <div class="confirm-dialog-actions">
                <button type="button" class="btn-secondary" data-action="cancel">Cancel</button>
                <button type="button" class="btn-danger" data-action="confirm">Delete</button>
            </div>
        </div>
    `;
    document.body.appendChild(dialog);

    dialog.addEventListener("click", function (e) {
        if (e.target === dialog) dialog.close();
    });

    return dialog;
}

function confirmDeletePost(form) {
    const dialog = getDeletePostDialog();
    dialog.showModal();

    const cancelBtn = dialog.querySelector('[data-action="cancel"]');
    const confirmBtn = dialog.querySelector('[data-action="confirm"]');

    const newCancel = cancelBtn.cloneNode(true);
    const newConfirm = confirmBtn.cloneNode(true);
    cancelBtn.replaceWith(newCancel);
    confirmBtn.replaceWith(newConfirm);

    newCancel.addEventListener("click", () => dialog.close());

    newConfirm.addEventListener("click", () => {
        fetch(form.action, {
            method: "POST",
            headers: {
                "X-CSRFToken": getCookie("csrftoken"),
                "X-Requested-With": "XMLHttpRequest"
            },
            body: new FormData(form)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const postCard = form.closest(".post-card");
                if (postCard) postCard.remove();
            } else {
                alert(data.error || "Could not delete post.");
            }
        })
        .finally(() => dialog.close());
    });
}