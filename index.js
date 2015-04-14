var Hapi = require('hapi');
var server = new Hapi.Server();

server.connection({
	host: '0.0.0.0',
	port: 8080,
  routes: {
    cors: true
  }
});

var plugins = [
  { 
    register: require('hapi-mongodb'),
    options: {
      url: "mongodb://127.0.0.1/punisher",
      settings:  { db: {native_parser: false} }
    }
  }
];

server.register(plugins, function (err) {
  if (err) { throw err; }

 	server.route([
    //Get random punishment
    {
      method: 'GET',
      path: '/punish/random',
      handler: function(request, reply) {
        var punishArray = [];
        var db = request.server.plugins['hapi-mongodb'].db;
        db.collection('punishments').find().toArray(function(err, result) {
          if (err) {throw err;}
          else {
            punishArray = result;
            var randomIndex = Math.floor(Math.random()*punishArray.length);
            reply(punishArray[randomIndex]);
          }
        });
      }   
    },
    //Add a new punishment
    {
      method: 'POST',
      path: '/punish',
      handler: function(request, reply) {
        var db = request.server.plugins['hapi-mongodb'].db;
        var newPunishment = request.payload.punishment;
        db.collection('punishments').insert(newPunishment, function(err, writeResult) {
          if (err) { reply(Hapi.error.internal('Internal MongoDB Error', err)); }
          else { reply(writeResult); }
        });  
      }
    },
    //Deliver a random person to be punished
    {
      method: 'GET',
      path: '/person/random',
      handler: function(request, reply) {
        var personArray = [];
        var db = request.server.plugins['hapi-mongodb'].db;
        db.collection('people').find().toArray(function(err, result) {
          if (err) {throw err;}
          else {
            personArray = result;
            var randomIndex = Math.floor(Math.random()*personArray.length);
            reply(personArray[randomIndex]);
          }
        });
      }   
    }
  ]);

  server.start(function () {
    server.log('info', 'Server running at: ' + server.info.uri);
  });
});

server.start();