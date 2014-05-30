from xlrd import open_workbook
from mmap import mmap, ACCESS_READ
import json
import math

# Voltage: a + bi, current: c + di
# => Power: (ac - bd) + (bc + ad)i
def get_power(voltage, current):
    a = float(voltage.split()[0])
    b = float(voltage.split()[1])
    c = float(current.split()[0])
    d = float(current.split()[1])
    re = a * c - b * d
    img = b * c + a * d
    return math.sqrt(re * re + img * img)

# Number of nodes
N = 2065
# Number of transformers
N_trans = 195

# Read names
name = open('../raw_data/name.txt', 'r')
names = []
for i in range(N):
    line = name.readline()
    names.append(line[1:-2])
name.close()

# Read info about what nodes each line connects
nodes = []
lines = open('../raw_data/lines.txt', 'r')
for i in range(N - 1):
    line = lines.readline().split()
    nodes.append([int(line[0]), int(line[1])])
lines.close()

# Read current on each line
I = [[], [], []]
phase = ['A', 'B', 'C']
for k in range(3):
    current = open('../raw_data/current_' + phase[k] + '.txt', 'r')
    for i in range(N - 1):
        line = current.readline().split(',')
        I[k].append(line[:-1])
    current.close()

wb = open_workbook('../raw_data/network.xlsx')
lim = {}     
for s in wb.sheets():
    if s.name == 'XLine':
        for row in range(2, s.nrows):
            c = 0
            for col in range(s.ncols):
                c += 1
                if c == 5:
                    val = s.cell(row,col).value
                    from_val = val
                elif c == 6:
                    val = s.cell(row,col).value
                    to_val = val
                elif c == 14:
                    IA = int(s.cell(row,col).value)
                elif c == 15:
                    IB = int(s.cell(row,col).value)
                elif c == 16:
                    IC = int(s.cell(row,col).value)
            if IA == 0:
                IA = -1
            if IB == 0:
                IB = -1
            if IC == 0:
                IC = -1
            lim[(from_val, to_val)] = [IA, IB, IC]

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
                    from_val = val
                elif c == 5:
                    val = s.cell(row,col).value
                    to_val = val
                elif c == 14:
                    IA = int(s.cell(row,col).value)
                elif c == 15:
                    IB = int(s.cell(row,col).value)
                elif c == 16:
                    IC = int(s.cell(row,col).value)
            if IA == 0:
                IA = -1
            if IB == 0:
                IB = -1
            if IC == 0:
                IC = -1
            lim[(from_val, to_val)] = [IA, IB, IC]

# Compute power 
phase = [[], [], []]
for k in range(3):
    for j in range(288):
        contents = []
        for i in range(N - 1):
            # Filter out houses
            if nodes[i][1] < 525:
                entry = {}
                from_val = names[nodes[i][0] - 1]
                to_val = names[nodes[i][1] - 1]
                a = float(I[k][i][j].split()[0])
                b = float(I[k][i][j].split()[1])
                amps = math.sqrt(a * a + b * b)
                if (from_val, to_val) in lim:
                    phase[k].append([from_val, to_val, amps, lim[(from_val, to_val)][k], j])

# Sort by each phase
phase[0].sort(key=lambda tup: tup[2] / tup[3], reverse=True)
phase[1].sort(key=lambda tup: tup[2] / tup[3], reverse=True)
phase[2].sort(key=lambda tup: tup[2] / tup[3], reverse=True)


# Top transformers in phase A
count = 0
i = 0
topA = open('toppercent_current_A.json', 'w')
contents = []
entry = {}
while count < 15:
    entry['from'] = phase[0][i][0]
    entry['to'] = phase[0][i][1]
    entry['amps'] = phase[0][i][2]
    entry['limit'] = phase[0][i][3]
    entry['time'] = phase[0][i][4]
    contents.append(entry)
    count += 1
topA.write(json.dumps(contents))
topA.close()

phase[0].sort(key=lambda tup: tup[2], reverse=True)
count = 0
i = 0
topA = open('topcurrent_A.json', 'w')
contents = []
entry = {}
while count < 15:
    entry['from'] = phase[0][i][0]
    entry['to'] = phase[0][i][1]
    entry['amps'] = phase[0][i][2]
    entry['limit'] = phase[0][i][3]
    entry['time'] = phase[0][i][4]
    contents.append(entry)
    count += 1
topA.write(json.dumps(contents))
topA.close()



# Top transformers in phase B
count = 0
i = 0
topB = open('toppercent_current_B.json', 'w')
contents = []
entry = {}
while count < 15:
    entry['from'] = phase[0][i][0]
    entry['to'] = phase[0][i][1]
    entry['amps'] = phase[0][i][2]
    entry['limit'] = phase[0][i][3]
    entry['time'] = phase[0][i][4]
    contents.append(entry)
    count += 1
topB.write(json.dumps(contents))
topB.close()

phase[0].sort(key=lambda tup: tup[2], reverse=True)
count = 0
i = 0
topB = open('topcurrent_B.json', 'w')
contents = []
entry = {}
while count < 15:
    entry['from'] = phase[0][i][0]
    entry['to'] = phase[0][i][1]
    entry['amps'] = phase[0][i][2]
    entry['limit'] = phase[0][i][3]
    entry['time'] = phase[0][i][4]
    contents.append(entry)
    count += 1
topB.write(json.dumps(contents))
topB.close()



# Top transformers in phase C
count = 0
i = 0
topC = open('toppercent_current_C.json', 'w')
contents = []
entry = {}
while count < 15:
    entry['from'] = phase[0][i][0]
    entry['to'] = phase[0][i][1]
    entry['amps'] = phase[0][i][2]
    entry['limit'] = phase[0][i][3]
    entry['time'] = phase[0][i][4]
    contents.append(entry)
    count += 1
topC.write(json.dumps(contents))
topC.close()

phase[0].sort(key=lambda tup: tup[2], reverse=True)
count = 0
i = 0
topC = open('topcurrent_C.json', 'w')
contents = []
entry = {}
while count < 15:
    entry['from'] = phase[0][i][0]
    entry['to'] = phase[0][i][1]
    entry['amps'] = phase[0][i][2]
    entry['limit'] = phase[0][i][3]
    entry['time'] = phase[0][i][4]
    contents.append(entry)
    count += 1
topC.write(json.dumps(contents))
topC.close()




