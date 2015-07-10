__author__ = 'mmcdermott'

from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime
import requests
import json

hannahClient = MongoClient('mongodb://hannah')

lincsDb = hannahClient['LINCS']
hannahMd = lincsDb['milestones']

hannahDiseases = hannahClient['LDR']['diseases']
hannahOrganisms = hannahClient['suggest-general']['Organism']
hannahGenes = hannahClient['suggest-general']['Gene']

ldrClient = MongoClient('mongodb://mmcdermott:kroyweN@localhost')
ldrDb = ldrClient['LDR']
assays = ldrDb['assays']
cellLines = ldrDb['cellLines']
perturbagens = ldrDb['perturbagens']
readouts = ldrDb['readouts']
genes = ldrDb['genes']
diseases = ldrDb['diseases']
organisms = ldrDb['organisms']
tools = ldrDb['tools']
releases = ldrDb['dataReleases']
assays.drop()
cellLines.drop()
perturbagens.drop()
readouts.drop()
genes.drop()
diseases.drop()
organisms.drop()
tools.drop()
releases.drop()


for doc in hannahMd.find({}):
    assay = {
        'name': doc['assay'],
        'description': doc['assay-info']
    }
    assayId = assays.insert(assay)

    cLIds = []
    for line in doc['cell-lines']:
        cLine = {
            'name': line['name'],
            'type': line['type'],
            'class': line['class'],
            'tissue': line['tissue']
        }
        cLIds.append(cellLines.insert(cLine))

    pertIds = []
    for pert in doc['perturbagens']:
        pertDict = {
            'name': pert['name'],
            'type': pert['type']
        }
        pertIds.append(perturbagens.insert(pertDict))

    rOutIds = []
    for rOut in doc['readouts']:
        ro = {
            'name': rOut['name'],
            'datatype': rOut['datatype']
        }
        rOutIds.append(readouts.insert(ro))

    geneIds = []
    for geneDoc in hannahGenes:
        gene = {
            'name': geneDoc['name'],
            'organism': geneDoc['organism'],
            'reference': geneDoc['ref'],
            'url': geneDoc['url'],
            'description': geneDoc['desc']
        }
        geneIds.append(genes.insert(gene))

    disIds = []
    for disDoc in hannahDiseases:
        dis = {
            'name': disDoc['name']
        }
        disIds.append(diseases.insert(dis))

    orgIds = []
    for org in hannahOrganisms:
        orgDict = {
            'name': org['name']
        }
        orgIds.append(organisms.insert(orgDict))

    out = {
        'approved': True,
        'released': False,
        'dateModified': datetime.now().isoformat(),
        'datasetName': doc['dcic-assay-name'],
        'description': doc['assay-info'],
        'metadata': {
            'assay': [assayId],
            'cellLines': [cLIds],
            'perturbagens': [pertIds],
            'readouts': [],
            'manipulatedGene': [],
            'organism': [],
            'relevantDisease': [],
            'analysisTools': [],
            'tagsKeywords': []
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
