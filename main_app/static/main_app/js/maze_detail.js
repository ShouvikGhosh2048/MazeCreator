document.addEventListener("DOMContentLoaded",() => {
    const csrftoken = getCsrftoken();

    if (document.querySelectorAll("#bookmark").length !== 0){
        setupBookmark(csrftoken);
    }
    if (document.querySelectorAll(".star-container").length !== 0){
        setupRating(csrftoken);
    }
    
    if (document.querySelectorAll("#creator_controls").length !== 0){
        setupRequestPublish(csrftoken);
    }

    if (document.querySelectorAll("#moderator_controls").length !== 0){
        setupPublicModeratorControl(csrftoken);
    }
});

function getCsrftoken() {
    //Taken from Django docs section on CSRF Tokens and AJAX.
    const cookies = document.cookie.split(';');
    const csrftoken = cookies.find(cookie => {
        cookie = cookie.trim();
        return cookie.substring(0,10) === "csrftoken=";
    }).trim().substring(10);
    return csrftoken;
}

function setupBookmark(csrftoken) {
    let bookmark = document.getElementById("bookmark");
    let bookmarked = bookmark.value === "Remove from bookmarks";

    bookmark.addEventListener("click",() => {
        let form_data = new FormData();
        let new_bookmarked_value = !bookmarked;
        form_data.append("bookmark",`${new_bookmarked_value}`);
        bookmark.disabled = true;
        send_data(form_data,csrftoken).then(response => {
            if(!response.ok){
                bookmark.disabled = false;
                return;
            }
            bookmarked = new_bookmarked_value;
            if(bookmarked){
                bookmark.value = "Remove from bookmarks";
            }
            else {
                bookmark.value = "Add to bookmarks";
            }
            bookmark.disabled = false;
        }).catch(err => {
            bookmark.disabled = false;
        })
    });
}

function setStars(stars,index){
    for(let i = 0; i <= index; i++){
        for(let j = 0; j < stars[i].children.length; j++){
            stars[i].children[j].setAttribute("fill","rgb(224, 203, 6)");
        }
    };
    for(let i = index + 1; i < 5; i++){
        for(let j = 0; j < stars[i].children.length; j++){
            stars[i].children[j].setAttribute("fill","gray");
        }
    };
}

function setupRating(csrftoken) {
    let stars = [];
    for(let i = 1; i <= 5; i++){
        stars.push(document.getElementById(`star${i}`));
    }
    stars.forEach((elem,index) => {
        elem.addEventListener("click",() => {
            let form_data = new FormData();
            form_data.append("rating",index + 1);
            //Refer to MDN on post by fetch.
            send_data(form_data,csrftoken).then(response => {
                if (!response.ok){
                    return;
                }
                response.json().then(json => {
                    setStars(stars,index);
                    document.getElementById("average_rating").innerText = `Average rating: ${json["average_rating"]}`;
                });
            })
        });
    });
}

function setupRequestPublish(csrftoken){
    let creator_visibility_control = document.getElementById("creator_visibility_control");
    creator_visibility_control.addEventListener("click",() => {
        if (creator_visibility_control.dataset["action"] === "make-private"){
            let form_data = new FormData();
            form_data.append("set_public","false");
            send_data(form_data,csrftoken).then(response => {
                if (!response.ok){
                    return;
                }
                else {
                    creator_visibility_control.innerText = "Request to make public";
                    creator_visibility_control.setAttribute("data-action","make-public");
                }
            });
        }
        else if (creator_visibility_control.dataset["action"] === "cancel-public"){
            let form_data = new FormData();
            form_data.append("set_requested_publish","false");
            send_data(form_data,csrftoken).then(response => {
                if(!response.ok){
                    return;
                }
                creator_visibility_control.innerText = "Request to make public";
                creator_visibility_control.setAttribute("data-action","make-public");
            });
        }
        else if(creator_visibility_control.dataset["action"] === "make-public" ){
            let form_data = new FormData();
            form_data.append("set_requested_publish","true");
            send_data(form_data,csrftoken).then(response => {
                if(!response.ok){
                    return;
                }
                creator_visibility_control.innerText = "Cancel request to make public";
                creator_visibility_control.setAttribute("data-action","cancel-public");
            });
        }
    });
}

function setupPublicModeratorControl(csrftoken){
    let moderator_visibility_control = document.getElementById("moderator_visibility_control");
    moderator_visibility_control.addEventListener("click",() => {
        console.log(moderator_visibility_control.dataset["action"]);
        if (moderator_visibility_control.dataset["action"] === "remove-from-public") {
            let form_data = new FormData();
            form_data.append("set_public","false");
            send_data(form_data,csrftoken).then(response => {
                if (!response.ok){
                    return;
                }
                moderator_visibility_control.remove();
            });
        }
        else if(moderator_visibility_control.dataset["action"] === "make-public"){
            let form_data = new FormData();
            form_data.append("set_public","true");
            send_data(form_data,csrftoken).then(
                response => {
                    if(!response.ok){
                        return;
                    }
                    moderator_visibility_control.innerText = "Remove from public";
                    moderator_visibility_control.setAttribute("data-action","remove-from-public");
                }
            );
        }
    });
}

function send_data(form_data,csrftoken){
    return fetch(document.URL,
        {
            method:"POST",
            headers: {
                "X-CSRFToken": csrftoken,
            },
            body: form_data,
            mode: "same-origin",
        }
    );
}