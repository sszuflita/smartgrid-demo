import json

chart = []
for i in range(523):
	chart.append([])

for i in range(279):
	filename = "C/line" + str(i) + ".json"
	file = open(filename)
	json_data = file.read()
	data = json.loads(json_data)
	for j in range(523):
		amps = data["contents"][j]["amps"]
		chart[j].append(amps)

for j in range(523):
	chart.append([])
	outfile = open("C_chart/line" + str(j)+ ".json", "w")
	outfile.write("[")
	for i in range(279):
		if (i > 0):
			outfile.write(", ")
		outfile.write(str(chart[j][i]))
	outfile.write("]")
	outfile.close()

