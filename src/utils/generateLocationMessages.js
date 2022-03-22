const generateLocationMessage = (text) =>{
  return {url: text, createdAt: new Date().getTime()}
}

module.exports = generateLocationMessage