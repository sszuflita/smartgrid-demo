
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

# Read names of transformers
trans_ids = {}
trans = open('../raw_data/trans_ids.txt', 'r')
for i in range(N_trans):
    line = trans.readline()
    trans_ids[line[:-1]] = 0
trans.close()

# Read voltages
V = [[], [], []]
phase = ['A', 'B', 'C']
for k in range(3):
    voltage = open('../raw_data/voltage_' + phase[k] + '.txt', 'r')
    for i in range(N):
        line = voltage.readline().split(',')
        V[k].append(line[:-1])
    voltage.close()


# Read current on each line
I = [[], [], []]
for k in range(3):
    current = open('../raw_data/current_' + phase[k] + '.txt', 'r')
    for i in range(N - 1):
        line = current.readline().split(',')
        I[k].append(line[:-1])
    current.close()


wb = open_workbook('../raw_data/network.xlsx')
lim = {}
for s in wb.sheets():
    if s.name == 'Load':
        for row in range(2, s.nrows):
            c = 0
            phase = ''
            for col in range(s.ncols):
                c += 1
                if c == 3:
                    name = s.cell(row,col).value
                elif c == 4:
                    phase = s.cell(row,col).value
                elif 'A' in phase and c == 6:
                    L_A = float(s.cell(row,col).value)
                elif 'B' in phase and c == 7:
                    L_B = float(s.cell(row,col).value)
                elif 'C' in phase and c == 8:
                    L_C = float(s.cell(row,col).value)
            if L_A == 0:
                L_A = -1
            if L_B == 0:
                L_B = -1
            if L_C == 0:
                L_C = -1
            lim[name] = [L_A, L_B, L_C]


# Compute power 
phase = [[], [], []]
for k in range(3):
    for j in range(288):
        # Get power for all transformers in the 5 min window
        for i in range(N - 1):
            entry = {}
            n1 = names[nodes[i][0] - 1]
            n2 = names[nodes[i][1] - 1]            
            if n2 in trans_ids:
                if trans_ids[n2] == j + 288 * k:
                    trans_ids[n2] += 1
                    power = get_power(V[k][nodes[i][1] - 1][j], I[k][i][j])
                    phase[k].append([n2, power, lim[n2][k], j])            

# Sort by each phase
phase[0].sort(key=lambda tup: tup[1] / tup[2], reverse=True)
phase[1].sort(key=lambda tup: tup[1] / tup[2], reverse=True)
phase[2].sort(key=lambda tup: tup[1] / tup[2], reverse=True)


f = open('../../transformers.dta', 'r')
known = []
for i in range(63):
    line = f.readline()
    name = line.split()[0]
    known.append(name)
f.close()

# Top transformers in phase A
count = 0
i = 0
topA = open('toppercent_trans_A.json', 'w')
contents = []
entry = {}
while count < 15:
    if phase[0][i][0] in known:
        entry['id'] = phase[0][i][0]
        entry['power'] = phase[0][i][1]
        entry['limit'] = phase[0][i][2]
        entry['time'] = phase[0][i][3]
        contents.append(entry)
        count += 1
    i += 1
topA.write(json.dumps(contents))
topA.close()

phase[0].sort(key=lambda tup: tup[1], reverse=True)
count = 0
i = 0
topA = open('toppower_trans_A.json', 'w')
contents = []
entry = {}
while count < 15:
    if phase[0][i][0] in known:
        entry['id'] = phase[0][i][0]
        entry['power'] = phase[0][i][1]
        entry['limit'] = phase[0][i][2]
        entry['time'] = phase[0][i][3]
        contents.append(entry)
        count += 1
    i += 1
topA.write(json.dumps(contents))
topA.close()



# Top transformers in phase B
count = 0
i = 0
topB = open('toppercent_trans_B.json', 'w')
contents = []
entry = {}
while count < 15:
    if phase[1][i][0] in known:
        entry['id'] = phase[1][i][0]
        entry['power'] = phase[1][i][1]
        entry['limit'] = phase[1][i][2]
        entry['time'] = phase[1][i][3]
        contents.append(entry)
        count += 1
    i += 1
topB.write(json.dumps(contents))
topB.close()

phase[1].sort(key=lambda tup: tup[1], reverse=True)
count = 0
i = 0
topB = open('toppower_trans_B.json', 'w')
contents = []
entry = {}
while count < 15:
    if phase[1][i][0] in known:
        entry['id'] = phase[1][i][0]
        entry['power'] = phase[1][i][1]
        entry['limit'] = phase[1][i][2]
        entry['time'] = phase[1][i][3]
        contents.append(entry)
        count += 1
    i += 1
topB.write(json.dumps(contents))
topB.close()

# Top transformers in phase C
count = 0
i = 0
topC = open('toppercent_trans_C.json', 'w')
contents = []
while count < 15:
    if phase[2][i][0] in known:
        entry = {}
        entry['id'] = phase[2][i][0]
        entry['power'] = phase[2][i][1]
        entry['limit'] = phase[2][i][2]
        entry['time'] = phase[2][i][3]
        contents.append(entry)
        count += 1
    i += 1
topC.write(json.dumps(contents))
topC.close()

phase[2].sort(key=lambda tup: tup[1], reverse=True)
count = 0
i = 0
topC = open('toppower_trans_C.json', 'w')
contents = []
entry = {}
while count < 15:
    if phase[1][i][0] in known:
        entry['id'] = phase[1][i][0]
        entry['power'] = phase[1][i][1]
        entry['limit'] = phase[1][i][2]
        entry['time'] = phase[1][i][3]
        contents.append(entry)
        count += 1
    i += 1
topC.write(json.dumps(contents))
topC.close()


