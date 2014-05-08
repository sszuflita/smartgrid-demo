from xlrd import open_workbook
from mmap import mmap, ACCESS_READ
import json
import random

for i in range(5):
	wb = open_workbook('network.xlsx')
	power = open('power' + str(i + 1) +'.json', 'w')
	amps = [14, 15, 16]
	contents = []
	for s in wb.sheets():
	    if s.name == 'XLine':
	        for row in range(2, s.nrows):
	            entry = {}
	            c = 0
	            max_amp = 0
	            for col in range(s.ncols):
	                c += 1
	                if c == 5:
	                    val = s.cell(row,col).value
	                    pos = val.find('_')
	                    if pos != -1:
	                        val = val[:pos]
	                    entry["from"] = val
	                elif c == 6:
	                    val = s.cell(row,col).value
	                    pos = val.find('_')
	                    if pos != -1:
	                        val = val[:pos]
	                    entry["to"] = val 
	            entry["amps"] = random.randint(500, 1000)
	            contents.append(entry)

	    if s.name == "Cable":
	        for row in range(2, s.nrows):
	            entry = {}
	            c = 0
	            max_amp = 0
	            for col in range(s.ncols):
	                c += 1
	                if c == 4:
	                    val = s.cell(row,col).value
	                    pos = val.find('_')
	                    if pos != -1:
	                        val = val[:pos]
	                    entry["from"] = val
	                elif c == 5:
	                    val = s.cell(row,col).value
	                    pos = val.find('_')
	                    if pos != -1:
	                        val = val[:pos]
	                    entry["to"] = val
	            entry["amps"] = random.randint(500, 1000)
	            contents.append(entry)
	            
	power.write(json.dumps({"contents":contents}))
	power.close()
