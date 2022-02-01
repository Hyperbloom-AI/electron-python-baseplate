from sys import argv
import sys, io, json
import pandas as pd
# print(sys.path)

def calc(stream):
    print(stream)
#    try:
#        c = SimpleCalculator()
#        c.run(text)
#        return c.log[-1]
#    except Exception as e:
#        print(e)
#        return 0.0

if __name__ == '__main__':
    print(calc(argv[1]))