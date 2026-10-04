function previewProfile(event){
    const file = event.target.files[0];
    const img = document.querySelector(".profile-preview");

    if(file){
        img.src = URL.createObjectURL(file);
    }
}
function previewBanner(event){
    const file = event.target.files[0];
    if(file){
        let img = document.querySelector(".banner-preview");
            if(img.tagName === "DIV"){
                const newImg = document.createElement("img");
                newImg.className = "banner-preview";
                img.parentNode.replaceChild(newImg, img);
                img = newImg;
            }
            img.src = URL.createObjectURL(file);
    }
}
const today = new Date();
today.setDate(today.getDate() - 1); 
document.getElementById("dob").max = today.toISOString().split("T")[0];