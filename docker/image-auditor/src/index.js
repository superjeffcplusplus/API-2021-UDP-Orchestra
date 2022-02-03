const TCP_PORT = 2205;
const UDP_PORT = 1268;
const IP = "239.255.22.5";
const CHECK_FREQUENCE = 5000;


const RFC4122 = require('rfc4122');
let rfc4122 = new RFC4122();

const Net = require('net');
const server = new Net.Server();

const dgram = require('dgram');


let activeMusicians = [];
let lastRequestTime = [];

const instruments = [
    {name:"piano", sound:"ti-ta-ti"},
    {name:"trumpet", sound:"pouet"},
    {name:"flute", sound:"trulu"},
    {name:"violin", sound:"gzi-gzi"},
    {name:"drum", sound:"boum-boum"}
];

function checkIfStillConnected(id){

    //if already deleted
    if (activeMusicians[id] == null){
        return;
    }

    timeBeforeLastConnection = Date.now() - lastRequestTime[id];
    if (timeBeforeLastConnection > 4500){ // to keep little margin
        console.log(id + " inactive");
        delete activeMusicians[id];
    }
}


function checkIfNewMusician(ip, port, sound){
    const id = ip + ":" + port;
    lastRequestTime[id] = Date.now();

    // check in 5sec if still connected
    setTimeout(checkIfStillConnected, CHECK_FREQUENCE, id); 
    
    // if musician is already known
    if (Object.keys(activeMusicians).includes(id)){
        return;
    }

    // define new musician
    activeMusicians[id] = { 
        uuid: rfc4122.v4(),
        instrument : getInstrumentName(sound),
        activeSince: new Date().toISOString()
    };

    console.log("New instrument joined orchestra");

}


function getInstrumentName(sound){
    for (let i in instruments){
        if (instruments[i].sound === sound){
            return instruments[i].name;
        }
    }
    return "unknown";
}




// TCP server

server.listen(TCP_PORT, function() {
    console.log(`Server listening for connection requests on socket localhost:${TCP_PORT}`);
});

// When a client requests a connection with the server
server.on('connection', function(socket) {
    console.log('A new TCP connection has been established.');

    // server can send data to the client by writing to its socket
    let jsonObj = [];
    for (let i in activeMusicians){
        jsonObj.push(activeMusicians[i]);
    }

    socket.write(JSON.stringify(jsonObj) + "\r\n");

    socket.destroy(); // close connection after having send request
});




// UDP SERVER

// Let's create a datagram socket. 
const s = dgram.createSocket('udp4');
s.bind(UDP_PORT, function() {
    console.log("Waiting for instruments...");
    s.addMembership(IP);
});

// This call back is invoked when a new datagram has arrived.
s.on('message', function(msg, source) {
    console.log("Instrument playing : '" + msg + "'. Source IP: " + source.address +
        ". Source port: " + source.port);
    checkIfNewMusician(source.address, source.port, msg.toString());
});