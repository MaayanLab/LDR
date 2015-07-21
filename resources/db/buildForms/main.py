__author__ = 'mmcdermott'

from pymongo import MongoClient

ldrClient = MongoClient('mongodb://hannah')
tools = ldrClient['LDR']['tools']

for doc in tools.find({}):
    if len(doc['name'].split(' ')) > 1:
        tools.remove({'name': doc['name']})