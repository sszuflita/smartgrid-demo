from xlrd import open_workbook
from mmap import mmap, ACCESS_READ
import json

wb = open_workbook('network.xlsx')
xline = open('xline.json', 'w')
cable = open('cable.json', 'w')
amps = [14, 15, 16]
for s in wb.sheets():
    if s.name == 'XLine':
        contents = []
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
                elif c in amps:
                    if int(s.cell(row,col).value) > max_amp:
                        max_amp = int(s.cell(row,col).value) 
            entry["amps"] = max_amp
            contents.append(entry)
        xline.write(json.dumps({"contents":contents}))

    if s.name == "Cable":
        contents = []
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
                elif c in amps:
                    if int(s.cell(row,col).value) > max_amp:
                        max_amp = int(s.cell(row,col).value) 
            entry["amps"] = max_amp
            contents.append(entry)
        cable.write(json.dumps({"contents":contents}))

xline.close()
cable.close()
