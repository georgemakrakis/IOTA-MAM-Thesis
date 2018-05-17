// Thanks to Lewis -the potatoe- Freiberg for the code, we made some edits :) //
let Mam = require('./lib/mam.node.js');
let IOTA = require('iota.lib.js');
let fs = require('fs');
let sensor = require('node-dht-sensor');

//LIVE NODE !
let iota = new IOTA({ provider: `https://testnet140.tangle.works:443` });

let yourMessage = 'MAM Send from RPi at foss';

//SEED must be 81 chars of A-Z9 //
let seed = fs.readFileSync('s33d.txt', 'utf8');
let side_key = fs.readFileSync('side_key.txt','utf8');

let mamState = null;

async function fetchStartCount(){
    let trytes = iota.utils.toTrytes('START');
    let message = Mam.create(mamState, trytes);
    console.log('The first root:');
    console.log(message.root);
    console.log();
    // Fetch all the messages upward from the first root.
    return await Mam.fetch(message.root, 'restricted',side_key, null);
}

async function publish(packet)
{
    // Create the message.
    let trytes = iota.utils.toTrytes(JSON.stringify(packet));
    let message = Mam.create(mamState, trytes);
    // Set the mam state so we can keep adding messages.
    mamState = message.state;
    console.log('Sending message: ', packet);
    console.log('Root: ', message.root);
    console.log('Address: ', message.address);
    console.log();
    // Attach the message.
    return await Mam.attach(message.payload, message.address);
}

// Initiate the mam state with the given seed at index 0.
mamState = Mam.init(iota, seed, 2, 0);

sensor.read(22, 4, function(err, temperature, humidity) {
    if (!err)
    {
        // Fetch all the messages in the stream.
        fetchStartCount().then(v =>
        {
            // Log the messages.
            let startCount = v.messages.length;
            console.log('Messages already in the stream:');
            for (let i = 0; i < v.messages.length; i++){
                let msg = v.messages[i];
                console.log(JSON.parse(iota.utils.fromTrytes(msg)));
            }
            console.log();

            // To add messages at the end we need to set the startCount for the mam state$
            mamState = Mam.init(iota, seed, 2, startCount);
            mamState = Mam.changeMode(mamState, 'restricted',side_key);

            //let newMessage = Date.now() + ' ' + yourMessage;

            let newMessage = Date.now() + ' '+ 'temp: ' + temperature.toFixed(1) + '  C, ' +
                'humidity: ' + humidity.toFixed(1) + '%';

            // Now the mam state is set, we can add the message.
            publish(newMessage);
        }).catch(ex =>
        {
            console.log(ex);
        });
    }
});