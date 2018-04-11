from xlrd import open_workbook
from mmap import mmap, ACCESS_READ
import json

wb = open_workbook('../raw_data/network.xlsx')
trans = open('trans_limit.json', 'w')
trans_id  = open('trans_id.txt', 'w')
contents_A = []
contents_B = []
contents_C = []
for s in wb.sheets():
    if s.name == 'Load':
        for row in range(2, s.nrows):
            c = 0
            phase = ''
            for col in range(s.ncols):
                c += 1
                if c == 3:
                    name = s.cell(row,col).value
                    trans_id.write(name + '\n')
                elif c == 4:
                    phase = s.cell(row,col).value
                elif 'A' in phase and c == 6:
                    L_A = float(s.cell(row,col).value)
                elif 'B' in phase and c == 7:
                    L_B = float(s.cell(row,col).value)
                elif 'C' in phase and c == 8:
                    L_C = float(s.cell(row,col).value)
            if 'A' in phase:
                contents_A.append({"id":name, "lim":L_A})
            if 'B' in phase:
                contents_B.append({"id":name, "lim":L_B})
            if 'C' in phase:
                contents_C.append({"id":name, "lim":L_C})

trans.write(json.dumps({"A":contents_A, "B": contents_B, "C": contents_C}))
trans.close()
trans_id.close()