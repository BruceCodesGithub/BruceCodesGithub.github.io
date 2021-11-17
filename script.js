var i = 0;
var txt = 'BruceDev';
var speed = 75;

function typeWriter() {
  if (i < txt.length) {
    document.getElementById("main-title").innerHTML += txt.charAt(i);
    i++;
    setTimeout(typeWriter, speed);
  }
}

typeWriter();
