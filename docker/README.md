# Background services

In order for the TMT to run trials, it needs to connect to the Common Information/Simulation Space, which are both based on Apache Kafka. It further assumes that certain message schemas are already defined.

## Usage

To start Apache Kafka and other services, you need to install `Docker` (and `Docker-compose`). Next, you can run the whole stack from this folder using:

```bash
docker-compose up -d
```

To stop, just use

```bash
docker-compose down
```

To inspect the running service, use

```bash
docker ps
```

Or alternatively, you can install a free ASCII client, `npm i -g dockly`, and run `dockly` from the command line to see a list of all services.

## Services

- [Kafka topics UI](http://localhost:3600/#/)
- [Kafka schema registry UI](http://localhost:3601/#/)
- [Time service](http://localhost:8100/): In the (almost hidden) menu at the top left, the simulation time can be set. However, normally, the time is set from the TMT.
- Kafka broker: http://localhost:3501
- Schema registry: http://localhost:3502
- Silent producer: a small Node.js service that registers all topics and uploads the schemas in the schemas folder to the schema registry, so others can use them to send messages across Kafka, before shutting down.
