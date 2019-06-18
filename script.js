function ready() {

    var boxes = document.getElementsByClassName('box');
    Array.prototype.forEach.call(boxes, function(box) {
        box.addEventListener("click", event => console.log(event.target.className));
    });
}

document.addEventListener("DOMContentLoaded", ready);