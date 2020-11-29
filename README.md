# frigate-mqtt-nxwitness
Bridge between [Frigate](https://github.com/blakeblackshear/frigate) and [NX Witness](https://www.networkoptix.com/nx-witness/)

Creates a bookmark in NX Witness whenever a specifed object is detected by Frigate.

# Installation


1. Install docker and docker-compose
2. Run with docker-compose :-)

# Configuration

Configuration sample:

 ```
{
    "nxwitness": {
        "host": "192.168.0.99",
        "port": "7001",
        "username": "admin",
        "password": "YOURPASSWORD"
    },
    "mqtt": {
        "host": "192.168.0.100",
        "topic": "frigate"
    },
    "cameraMap": [
        {
            "frigateName": "camera1",
            "nxwId": "00000000-0000-0000-0000-000000000000"
        },
        {
            "frigateName": "camera2",
            "nxwId": "00000000-0000-0000-0000-000000000000"
        }
    ]
}
 ```