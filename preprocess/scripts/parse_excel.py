from xlrd import open_workbook
from mmap import mmap, ACCESS_READ
import json

wb = open_workbook('../raw_data/network.xlsx')
A = open('line_current_A.json', 'w')
B = open('line_current_B.json', 'w')
C = open('line_current_C.json', 'w')
contents_A = []
contents_B = []
contents_C = []        
for s in wb.sheets():
    if s.name == 'XLine':
        for row in range(2, s.nrows):
            c = 0
            for col in range(s.ncols):
                c += 1
                if c == 5:
                    val = s.cell(row,col).value
                    pos = val.find('_')
                    if pos != -1:
                        val = val[:pos]
                    from_val = val
                elif c == 6:
                    val = s.cell(row,col).value
                    pos = val.find('_')
                    if pos != -1:
                        val = val[:pos]
                    to_val = val
                elif c == 14:
                    IA = int(s.cell(row,col).value)
                elif c == 15:
                    IB = int(s.cell(row,col).value)
                elif c == 16:
                    IC = int(s.cell(row,col).value)
            contents_A.append({"to":to_val, "from":from_val, "amps":IA})
            contents_B.append({"to":to_val, "from":from_val, "amps":IB})
            contents_C.append({"to":to_val, "from":from_val, "amps":IC})



    if s.name == "Cable":
        contents = []
        for row in range(2, s.nrows):
            entry = {}
            c = 0
            IA = 0
            IB = 0
            IC = 0
            for col in range(s.ncols):
                c += 1
                if c == 4:
                    val = s.cell(row,col).value
                    pos = val.find('_')
                    if pos != -1:
                        val = val[:pos]
                    from_val = val
                elif c == 5:
                    val = s.cell(row,col).value
                    pos = val.find('_')
                    if pos != -1:
                        val = val[:pos]
                    to_val = val
                elif c == 14:
                    IA = int(s.cell(row,col).value)
                elif c == 15:
                    IB = int(s.cell(row,col).value)
                elif c == 16:
                    IC = int(s.cell(row,col).value)
            contents_A.append({"to":to_val, "from":from_val, "amps":IA})
            contents_B.append({"to":to_val, "from":from_val, "amps":IB})
            contents_C.append({"to":to_val, "from":from_val, "amps":IC})

print contents_A

A.write(json.dumps({"contents":contents_A}))
B.write(json.dumps({"contents":contents_B}))
C.write(json.dumps({"contents":contents_C}))
A.close()
B.close()
C.close()