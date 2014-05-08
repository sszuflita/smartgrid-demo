import json
import math

# Voltage: a + bi, current: c + di
def get_power(voltage, current):
    a = float(voltage.split()[0])
    b = float(voltage.split()[1])
    c = float(current.split()[0])
    d = float(current.split()[1])
    x = math.atan2(b, a)
    y = math.atan2(d, c)
    v = math.sqrt(a * a + b * b)
    i = math.sqrt(c * c + d * d)
    return v * i * math.cos(x - y)

# Number of nodes
N = 2065

# Read names
name = open('../raw_data/name.txt', 'r')
names = []
for i in range(N):
    line = name.readline()
    # Strip '_15452'
    if i > 0 and i < 329 or i >= 346 and i <= 381:
    	pos = line.find('_')
        names.append(line[1:pos])
    else:
       names.append(line[1:-2])
name.close()

# Read info about what nodes each line connects
nodes = []
lines = open('../raw_data/lines.txt', 'r')
for i in range(N - 1):
    line = lines.readline().split()
    nodes.append([int(line[0]), int(line[1])])
lines.close()

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
'''
for k in range(3):
    for j in range(288):
        contents = []
        for i in range(N - 1):
            entry = {}
            entry["from"] = names[nodes[i][0] - 1]
            entry["to"] = names[nodes[i][1] - 1]
            entry["pow"] = get_power(V[k][nodes[i][0] - 1][j], I[k][i][j])
            contents.append(entry)
        # Write to file
        f = open(phase[k] + '/line' + str(j) + '.json', 'w')
        f.write(json.dumps({"contents":contents}))    
        f.close()
'''
for k in range(3):
    for j in range(288):
        contents = []
        for i in range(N - 1):
            # Filter out houses
            if nodes[i][1] < 525:
                entry = {}
                entry["from"] = names[nodes[i][0] - 1]
                entry["to"] = names[nodes[i][1] - 1]
                entry["amps"] = float(I[k][i][j].split()[0])
                contents.append(entry)
        # Write to file
        f = open("../" + phase[k] + '/line' + str(j) + '.json', 'w')
        f.write(json.dumps({"contents":contents}))    
        f.close()


'''
contents = []
for i in range(N - 1):
    entry = {}
    entry["from"] = names[nodes[i][0] - 1]
    entry["to"] = names[nodes[i][1] - 1]
    entry["pow"] = 1
    contents.append(entry)
# Write to file
f = open('all_lines.json', 'w')
f.write(json.dumps({"contents":contents}))    
f.close()
'''