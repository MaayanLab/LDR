# coding=utf-8

import csv
import json
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime
from dateutil.parser import parse

client = MongoClient('mongodb://hannah')
publications = client['LDR']['publications']
publications.drop()
tools = client['LDR']['tools']

with open('publications.json', 'rU') as pubs:
  data = json.load(pubs)
  for pubDict in data:
    toolsArr = []
    for tool in pubDict['compTools']:
      if tools.find(tool).count() > 0:
        toolsArr.append(tools.find_one(tool)['_id'])
      else:
        toolsArr.append(tools.insert(tool))
    pubDict['compTools'] = toolsArr
    publications.insert(pubDict)
