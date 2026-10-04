function togglePassword(id, eye){
    const input = document.getElementById(id);

    if(input.type === "password"){
        input.type = "text";
        eye.textContent = "⌣";
    }else{
        input.type = "password";
        eye.textContent = "👁";
    }
}