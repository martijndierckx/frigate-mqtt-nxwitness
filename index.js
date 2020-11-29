//fs = require('fs');
const mqtt = require('mqtt');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Load configuration
var config = require('/config/config.json');

// Setup MQTT connection
var client  = mqtt.connect('mqtt://'+ config.mqtt.host);
client.on('connect', function () {
    client.subscribe(config.mqtt.topic +'/#', function (err) {
        console.log('Subscribed to MQTT topic: '+ config.mqtt.topic);
    });
});

// On receive MQTT message
client.on('message', function (topic, message) {
    try {
        var topicPath = topic.split('/');

        // Skip initial status message
        if(topicPath[1] != 'available') {
            var camera = topicPath[1];
            var mappedCamera = config.cameraMap.find(i => i.frigateName == camera);

            // Only handle events from mapped cameras
            if(mappedCamera !== undefined) {
            
                // Only handle 'events'
                if(topicPath[2] == 'events') {
                    var eventData = JSON.parse(message);

                    // Only hanle 'end' event
                    if(topicPath[3] == 'end') {
                        
                        // Skip false positives
                        if(!eventData.false_positive) {

                            // Gather event data
                            var event = {
                                guid: uuidv4(),
                                cameraId: mappedCamera.nxwId,
                                name: eventData.label,
                                startTimeMs: Math.round(eventData.start_time * 1000),
                                durationMs: Math.round((eventData.end_time - eventData.start_time) * 1000),
                                tag: 'frigate'
                            };

                            // Send data to NX Witness
                            axios.request({
                                method: 'get',
                                url: 'http://'+ config.nxwitness.host +':'+ config.nxwitness.port +'/ec2/bookmarks/add',
                                auth: {
                                    username: config.nxwitness.username,
                                    password: config.nxwitness.password
                                },
                                responseType: 'json',
                                params: Object.assign({ format: 'json' }, event)
                            })
                            .then(function (response) {
                                console.log('Notified NX Witness of "'+ event.name +'" event on "'+ camera +'"');
                            })
                            .catch(function (error) {
                                console.log('Something went wrong trying to notify NX Witness');
                                console.log(error);
                            });

                        }
                        else {
                            console.log('Skipping false positive event from: '+ camera);
                        }
                    }
                }            
            }
            else {
                console.log('Received event from unconfigured camera: '+ camera);
            }
        }
    }
    catch (e) {
        console.log('Something went wrong');
        console.log(e);
    }
});