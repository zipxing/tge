var player = require('play-sound')(opts = {})
player.play('1.mp3', function(err){
  if (err) throw err
})
