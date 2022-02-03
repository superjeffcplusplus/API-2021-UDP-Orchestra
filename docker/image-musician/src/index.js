const PORT = 1268;
const IP = "239.255.22.5";

const dgram = require("dgram");
const s = dgram.createSocket("udp4");

const instruments = [
    {name:"piano", sound:"ti-ta-ti"},
    {name:"trumpet", sound:"pouet"},
    {name:"flute", sound:"trulu"},
    {name:"violin", sound:"gzi-gzi"},
    {name:"drum", sound:"boum-boum"}
];


function getInstrument(name){
    for (let i in instruments){
        if (instruments[i].name === name){
            return instruments[i];
        }
    }
    return ""; // if specified instrument is unknown
}


const instrument = getInstrument(process.argv[2]);

// if no instrument is specified or is wrong
if (instrument == ""){
    console.log("Error: instrument unknown or undefined");
    return;
}


setInterval(function(){ 
    // Send the payload via UDP (multicast)
    message = new Buffer.from(instrument.sound);
    s.send(message, 0, message.length, PORT, IP,
        function(err, bytes) {
            console.log(instrument.name.toUpperCase() + " playing sound '" + instrument.sound + "'");
    });
}, 5000);