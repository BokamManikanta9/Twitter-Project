const imageInput = document.getElementById("imageInput");
const videoInput = document.getElementById("videoInput");

const previewBox = document.getElementById("previewBox");
const imgPreview = document.getElementById("imgPreview");
const vidPreview = document.getElementById("vidPreview");

function chooseImage() {
    videoInput.value = ""; 
    imageInput.click();
}

function chooseVideo() {
    imageInput.value = ""; 
    videoInput.click();
}


imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (!file) return;

    imgPreview.src = URL.createObjectURL(file);
    imgPreview.style.display = "block";
    vidPreview.style.display = "none";

    previewBox.style.display = "block";
});


videoInput.addEventListener("change", () => {
    const file = videoInput.files[0];
    if (!file) return;

    vidPreview.src = URL.createObjectURL(file);
    vidPreview.style.display = "block";
    imgPreview.style.display = "none";

    previewBox.style.display = "block";
});
function removeMedia() {
    imageInput.value = "";
    videoInput.value = "";

    
    imgPreview.src = "";
    vidPreview.src = "";

    imgPreview.style.display = "none";
    vidPreview.style.display = "none";
    previewBox.style.display = "none";
}
document.getElementById("post-form").addEventListener("submit", function (e) {
    const content = document.querySelector("textarea[name='content']").value.trim();
    const hasImage = imageInput.files.length > 0;
    const hasVideo = videoInput.files.length > 0;

    if (!content && !hasImage && !hasVideo) {
        e.preventDefault();
        alert("Write something or attach an image/video before posting.");
    }
});
