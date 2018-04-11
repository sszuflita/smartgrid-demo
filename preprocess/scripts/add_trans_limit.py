from xlrd import open_workbook
from mmap import mmap, ACCESS_READ
import json

wb = open_workbook('../raw_data/network.xlsx')
f = open('../../transformers.dta', 'r')
trans = open('trans_limit.dta', 'w')
ids = open('../transformer/trans_ids.txt', 'r')
names = []
for i in range(195):
    line = ids.readline()[:-1]
    names.append(line)
ids.close()
A = {}
B = {}
C = {}
for s in wb.sheets():
    if s.name == 'Load':
        for row in range(2, s.nrows):
            c = 0
            phase = ''
            for col in range(s.ncols):
                c += 1
                if c == 3:
                    name = s.cell(row,col).value
                    A[name] = 0
                    B[name] = 0
                    C[name] = 0
                elif c == 4:
                    phase = s.cell(row,col).value
                elif 'A' in phase and c == 6:
                    A[name] = float(s.cell(row,col).value)
                elif 'B' in phase and c == 7:
                    B[name] = float(s.cell(row,col).value)
                elif 'C' in phase and c == 8:
                    C[name] = float(s.cell(row,col).value)
         
for i in range(63):
    line = f.readline()
    name = line.split()[0]
    for j in range(195):
        if name in names[j]:
            name = names[j]
            break        
    trans.write(line[:-1] + ' ' + str(A[name]) + ' ' + str(B[name]) + ' ' + str(C[name]) + '\n')   
f.close()
trans.close()

