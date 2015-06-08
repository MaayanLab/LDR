__author__ = 'mmcdermott'

from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime
import requests
import json

lorettaClient = MongoClient('mongodb://mmcdermott:kroyweN@loretta')

lincsDb = lorettaClient['LINCS']
lorettaMd = lincsDb['milestones']

ldrClient = MongoClient('mongodb://elizabeth')
ldrDb = ldrClient['LDR']
releases = ldrDb['dataReleases']
releases.drop()

nsUrl = 'http://146.203.54.165:7078/form'
headers = {'Content-Type': 'application/json'}

for doc in lorettaMd.find({}):
    out = {
        'approved': True,
        'dateModified': datetime.now().isoformat(),
        'metadata': {
            'assay': [],
            'cellLines': [],
            'perturbagens': [],
            'readouts': [],
            'manipulatedGene': [],
            'organism': [],
            'relevantDisease': [],
            'analysisTools': [],
            'tagsKeywords': [],
            'experiment': ''
        },
        'releaseDates': {
            'level1': '',
            'level2': '',
            'level3': '',
            'level4': ''
        },
        'urls': {
            'qcDocumentUrl': '',
            'pubMedUrl': '',
            'metadataUrl': '',
            'dataUrl': ''
        }
    }

    group = ''
    if doc['center'] == 'DTOXS':
        out['group'] = ObjectId('5519bd94ea7e106fc6784162')
        out['user'] = ObjectId('5519bd94ea7e106fc678416c')
        groupAbbr = 'd'
    elif doc['center'] == 'LINCS Transcriptomics':
        out['group'] = ObjectId('5519bd94ea7e106fc6784163')
        out['user'] = ObjectId('5519bd94ea7e106fc678416e')
        groupAbbr = 't'
    elif doc['center'] == 'HMS LINCS':
        out['group'] = ObjectId('5519bd94ea7e106fc6784164')
        out['user'] = ObjectId('5519bd94ea7e106fc6784170')
        groupAbbr = 'h'
    elif doc['center'] == 'LINCS PCCSE':
        out['group'] = ObjectId('5519bd94ea7e106fc6784165')
        out['user'] = ObjectId('5519bd94ea7e106fc678416b')
        groupAbbr = 'p'
    elif doc['center'] == 'NeuroLINCS':
        out['group'] = ObjectId('5519bd94ea7e106fc6784166')
        out['user'] = ObjectId('5519bd94ea7e106fc678416a')
        groupAbbr = 'n'
    elif doc['center'] == 'MEP LINCS':
        out['group'] = ObjectId('5519bd94ea7e106fc6784167')
        out['user'] = ObjectId('5519bd94ea7e106fc678416d')
        groupAbbr = 'm'

    print('GROUP: ' + groupAbbr)
    gPar = '&group=' + groupAbbr

    assay = doc['assay']
    assayName = assay.replace('+', '\%2B').replace('(', '\(').replace(')', '\)')
    print('ASSAY: ' + assayName)
    assayArr = requests.get(nsUrl + '/assay?name=' + assayName + gPar).json()
    if len(assayArr) == 0:
        assayData = {
            'name': assayName,
            'info': doc['assay-info'],
            'group': groupAbbr
        }
        assayReq = requests.post(nsUrl + '/assay', data=json.dumps(assayData), headers=headers)
        assayId = assayReq.json()
    else:
        assayReq = requests.post(nsUrl + '/assay', data=json.dumps(assayArr[0]), headers=headers)
        assayId = assayReq.json()
    out['metadata']['assay'] = [assayId]

    for cLineObj in doc['cell-lines']:
        if 'name' not in cLineObj:
            continue
        cLineName = cLineObj['name'].replace('+', '\%2B').replace('(', '\(').replace(')', '\)')
        if 'Which four?' in cLineName:
            continue
        print('CELL LINE: ' + cLineName)
        cLineArr = requests.get(nsUrl + '/cell?name=' + cLineName + gPar).json()
        if len(cLineArr) == 0:
            cLineObj['group'] = groupAbbr
            cLineReq = requests.post(nsUrl + '/cell', data=json.dumps(cLineObj), headers=headers)
            cLineId = cLineReq.json()
        else:
            cLineReq = requests.post(nsUrl + '/cell', data=json.dumps(cLineArr[0]), headers=headers)
            cLineId = cLineReq.json()
        out['metadata']['cellLines'].append(cLineId)

    if 'perturbagens' in doc:
        for pertObj in doc['perturbagens']:
            if 'name' not in pertObj:
                continue
            pertName = pertObj['name'].replace('+', '\%2B').replace('(', '\(').replace(')', '\)')
            print('PERTURBAGEN: ' + pertName)
            pertArr = requests.get(nsUrl + '/perturbagen?name=' + pertName + gPar).json()
            if len(pertArr) == 0:
                pertObj['group'] = groupAbbr
                pertReq = requests.post(nsUrl + '/perturbagen', data=json.dumps(pertObj), headers=headers)
                pertId = pertReq.json()
            else:
                pertReq = requests.post(nsUrl + '/perturbagen', data=json.dumps(pertArr[0]), headers=headers)
                pertId = pertReq.json()
            out['metadata']['perturbagens'].append(pertId)

    for rOutObj in doc['readouts']:
        rOutName = rOutObj['name'].replace('+', '\%2B').replace('(', '\(').replace(')', '\)')
        print('READOUT: ' + rOutName)
        rOutArr = requests.get(nsUrl + '/readout?name=' + rOutName + gPar).json()
        if len(rOutArr) == 0:
            rOutObj['group'] = groupAbbr
            rOutReq = requests.post(nsUrl + '/readout', data=json.dumps(rOutObj), headers=headers)
            rOutId = rOutReq.json()
        else:
            rOutReq = requests.post(nsUrl + '/readout', data=json.dumps(rOutArr[0]), headers=headers)
            rOutId = rOutReq.json()
        out['metadata']['readouts'].append(rOutId)

    for dateObj in doc['release-dates']:
        if dateObj['releaseLevel'] == 1:
            out['releaseDates']['level1'] = dateObj['date']
        elif dateObj['releaseLevel'] == 2:
            out['releaseDates']['level2'] = dateObj['date']
        elif dateObj['releaseLevel'] == 3:
            out['releaseDates']['level3'] = dateObj['date']
        elif dateObj['releaseLevel'] == 4:
            out['releaseDates']['level4'] = dateObj['date']

    if 'release-link' in doc:
        out['urls']['dataUrl'] = doc['release-link']

    releases.insert(out)
