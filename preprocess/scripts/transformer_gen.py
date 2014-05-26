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

# Compute power and generates json
f = open('trans_power.json', 'w')
frames_A = []
frames_B = []
frames_C = []
for k in range(3):
    for j in range(288):
        frame = []
        # Get power for all transformers in the 5 min window
        for i in range(N - 1):
            entry = {}
            n1 = names[nodes[i][0] - 1]
            n2 = names[nodes[i][1] - 1]
            #if n1 in trans_ids:
            #    if trans_ids[n1] == j + 288 * k:
            #        trans_ids[n1] += 1
            #        entry["id"] = n1
            #        entry["pow"] = get_power(V[k][nodes[i][0] - 1][j], I[k][i][j])
            #elif n2 in trans_ids:
            if n2 in trans_ids:
                if trans_ids[n2] == j + 288 * k:
                    trans_ids[n2] += 1
                    entry["id"] = n2
                    entry["pow"] = get_power(V[k][nodes[i][1] - 1][j], I[k][i][j])
            if entry != {}:
                frame.append(entry)
        if k == 0:
            frames_A.append(frame)
        elif k == 1:
            frames_B.append(frame)
        else:
            frames_C.append(frame)


f.write(json.dumps({"A":frames_A, "B":frames_B, "C":frames_C}))    
f.close()
