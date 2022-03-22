const socket = io();

const messageForm = document.querySelector("#message-form");
const formInput = document.querySelector("#form-input");
const formButton = document.querySelector("#form-button");
const sendLocationButton = document.querySelector("#send-location");
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const messages = document.querySelector("#messages");

//^OPTIONS taking from URL
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

//^automatic scolling
const autoscroll = () => {
  // New message element
  const newMessage = messages.lastElementChild

  // Height of the new message
  const newMessageStyles = getComputedStyle(newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin

  // Visible height
  const visibleHeight = messages.offsetHeight

  // Height of messages container
  const containerHeight = messages.scrollHeight

  // How far have I scrolled?
  const scrollOffset = messages.scrollTop + visibleHeight

  if (containerHeight - newMessageHeight <= scrollOffset) {
      messages.scrollTop = messages.scrollHeight
  }
}



socket.on("message", message => {
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format("H:mm a")
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoscroll()
});

messageForm.addEventListener("submit", e => {
  e.preventDefault();

  //disable form
  formButton.setAttribute("disabled", "disabled");

  const message = formInput.value;

  socket.emit(
    "sendMessage",
    message,
    //third argument in emit is for acknowledgement
    //client(emit) => server(receives) --acknowledgement => client
    error => {
      //enable
      formButton.removeAttribute("disabled");
      //clear input
      formInput.value = "";
      //refocus to input
      formInput.focus();
      //callback 
      if (error) {
        return console.log(error);
      }
      console.log("Message delivered");
    }
  );
});

socket.on("locationMessage", message => {
  console.log(message);
  const html = Mustache.render(locationTemplate, {
    url: message.url,
    createdAt: moment(message.createdAt).format("H:mm a")
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoscroll()
});

socket.emit('join', {username, room})

sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Browser does not support your location");
  }

  //disable button
  sendLocationButton.setAttribute("disabled", "disabled");

  //get location
  navigator.geolocation.getCurrentPosition(posistion => {
    const { latitude, longitude } = posistion.coords;

    socket.emit("sendLocation", { latitude, longitude }, acknowledgement => {
      //enable button
      sendLocationButton.removeAttribute("disabled");
      console.log(acknowledgement);
    });
  });
});
