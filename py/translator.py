from sys import argv
import datetime
import pandas as pd

def translate(path):
    df = pd.read_csv(path)
    try:
        d = datetime.datetime.now()
        filename = f"Public_Health_{d.year}{d.strftime('%m')}{d.strftime('%d')}{d.strftime('%H')}{d.strftime('%M')}{d.strftime('%S')}.csv"
        path = df.to_csv(filename)
        return filename
    except Exception as e:
        print(e)

if __name__ == '__main__':
    print(translate(argv[1]))