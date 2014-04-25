from xlrd import open_workbook
from mmap import mmap, ACCESS_READ
import json

wb = open_workbook('network.xlsx')
xline = open('xline.json', 'w')
cable = open('cable.json', 'w')
amps = [14, 15, 16]
for s in wb.sheets():
    if s.name == 'XLine':
        for row in range(2, s.nrows):
            entry = {}
            c = 0
            max_amp = 0
            for col in range(s.ncols):
                c += 1
                if c == 5:
                    entry["from"] = s.cell(row,col).value
                elif c == 6:
                    entry["to"] = s.cell(row,col).value
                elif c in amps:
                    if int(s.cell(row,col).value) > max_amp:
                        max_amp = int(s.cell(row,col).value) 
            entry["amps"] = max_amp
            xline.write(json.dumps(entry) + '\n')

    if s.name == "Cable":
        for row in range(2, s.nrows):
            entry = {}
            c = 0
            max_amp = 0
            for col in range(s.ncols):
                c += 1
                if c == 4:
                    entry["from"] = s.cell(row,col).value
                elif c == 5:
                    entry["to"] = s.cell(row,col).value
                elif c in amps:
                    if int(s.cell(row,col).value) > max_amp:
                        max_amp = int(s.cell(row,col).value) 
            entry["amps"] = max_amp
            cable.write(json.dumps(entry) + '\n')

xline.close()
cable.close()
