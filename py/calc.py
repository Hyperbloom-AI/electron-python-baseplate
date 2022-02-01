from sys import argv
import sys, io, json
import pandas as pd
# print(sys.path)

def calc(path):
    df = pd.read_csv(path)
    try:
        filename = "samplefile.csv"
        path = df.to_csv(filename)
        return filename
        #print(path)
    except Exception as e:
        print(e)

if __name__ == '__main__':
    print(calc(argv[1]))