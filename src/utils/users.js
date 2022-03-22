const users = []

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    // Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
  const user = users.find((user)=>{
    return user.id === id
  })
  return user
}

const getUsersInRoom = (room) =>{
  const roomName = room.toLowerCase()
const usersInRoom = users.filter((user)=>{
  return user.room === roomName
})
return usersInRoom
}

addUser({
    id: 22,
    username: 'Andrew  ',
    room: '  mn'
})
addUser({
    id: 24,
    username: 'Connor  ',
    room: '  mn'
})

module.exports = {
  addUser, removeUser, getUser, getUsersInRoom
}