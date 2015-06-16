#!/usr/bin/env bash
# Dump Mongo Dbs database every night using mongodump
# Author: Michael McDermott

BAK="dump"

## Binary path ##
#MONGO="/usr/bin/mongo"
#MONGODUMP="/usr/bin/mongodump"

echo $BAK

mongodump -h elizabeth --port 27017 --db LDR --out $BAK/`date +"%Y_%m_%d__"`LDR
