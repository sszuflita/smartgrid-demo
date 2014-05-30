import json

outfile = open("chart_data.json", "w")
outfile.write("[")
for i in range(279):
    if (i > 0):
        outfile.write(", ")
    filename = "A/line" + str(i) + ".json"
    file = open(filename)
    json_data = file.read()
    data = json.loads(json_data)
    amps = data["contents"][0]["amps"]
    outfile.write(str(amps))
outfile.write("]")

