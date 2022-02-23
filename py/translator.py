from fileinput import filename
from sys import argv
import datetime, pandas as pd, json, os

def translate(path, config):
    df = pd.read_csv(path) # path contains an absolute path to read
    config_reader = {}
    states_list = {}
    ga_counties_list = {}
    ga_counties_list
    __location__ = os.path.realpath(os.path.join(os.getcwd(), os.path.dirname(__file__)))
    with open(config) as json_file:
        config_reader = json.load(json_file)
    with open(os.path.join(__location__, 'states.json')) as json_file_st:
    # with open('C:\\Users\\Charles McNamara\\OneDrive\\Documents\\Work\\electron-poc\\py\\states.json') as json_file_st:
        states_list = list((json.load(json_file_st)).keys())
    with open(os.path.join(__location__, 'ga-counties.json')) as json_file_co:
    #with open('C:\\Users\\Charles McNamara\\OneDrive\\Documents\\Work\\electron-poc\\py\\ga-counties.json') as json_file_co:
         ga_counties_list = json.load(json_file_co)

    
    config_functions = config_reader["FUNCTIONS"]
    for function in config_functions:
        transformation_list = function["transformations"]
        for transformation in transformation_list:
            if(transformation["type"] == "changeColName"):
                change_column_name(df, transformation["original"], transformation["new"])

            elif(transformation["type"] == "replace"):
                replace_values(df, function["columnName"], transformation["replacements"])

            elif(transformation["type"] == "replaceEmpty"):
                replace_empty_values(df, function["columnName"], transformation["replacement"])

            elif(transformation["type"] == "removeIfNotInList"):
                if(transformation["list"] == "US States"):
                    check_list_remove(df, function["columnName"], states_list)

            elif(transformation["type"] == "convertToZip"):
                convert_zip(df, function["columnName"])

            elif(transformation["type"] == "formatPhoneNumber"):
                format_phone(df, function["columnName"])

            elif(transformation["type"] == "removeValuesInSeparateColumnBasedOnThisColumn"):
                remove_values_in_other_column_based_on_initial(df, function["columnName"], transformation["separateColumnName"], transformation["replaceNot"])

            elif(transformation["type"] == "replaceWithValueInList"):
                replace_with_listval(df, function["columnName"], ga_counties_list)
            else:
                print("Hit default!")
    try:
        d = datetime.datetime.now()
        file_name = ""
        # filename = f"Public_Health_{d.year}{d.strftime('%m')}{d.strftime('%d')}{d.strftime('%H')}{d.strftime('%M')}{d.strftime('%S')}.csv" # Dev Note: This autogenerates for UGA College of Public Health. This should be able to manipulated to a specific format in a .config.json file in the future
        config_formatting = config_reader["OUTPUT_FILE_NAME_FORMAT"]
        cf_parts = config_formatting['formatting_parts']

        for part in cf_parts:
            if(part['type'] == "string"):
                file_name = file_name + part['value']
            elif(part['type'] == 'time_year'):
                file_name = file_name + str(d.year)
            elif(part['type'] == 'time_strftime'):
                file_name = file_name + str(d.strftime(part['value']))

        path = df.to_csv(file_name, index=False)
        return file_name
    except Exception as e:
        print(e)

def change_column_name(frame, column_name, new_col_name):
    frame.rename(columns={column_name: new_col_name}, inplace=True)

def replace_values(frame, column_name, replaceArray):
    for replacement in replaceArray:
        frame[column_name].replace([replacement["original"]], [replacement["new"]], inplace=True)

def replace_empty_values(frame, column_name, replacement):
    frame.loc[frame[column_name].isnull(), column_name] = replacement

def check_list_remove(frame, column_name, arr):
    frame.loc[~frame[column_name].isin(arr), column_name] = ''

def convert_zip(frame, column_name):
    frame[column_name] = frame[column_name].apply(convert_to_fivedigit_zip_or_remove)

def convert_to_fivedigit_zip_or_remove(x):
    hyphen_index = x.find('-')
    if(hyphen_index != -1):
        return x[0:(hyphen_index)]
    elif(len(x) != 5):
        return ""
    else:
        return x

def format_phone(frame, column_name):
    frame[column_name] = frame[column_name].apply(convert_to_formatted_phone)

def convert_to_formatted_phone(x):
    strx = str(x)
    return float(strx[(len(str(x))-12):(len(str(x))-1)])

def remove_values_in_other_column_based_on_initial(frame, column_name, column_name_to_change, value):
    frame.loc[frame[column_name] != value, column_name_to_change] = ""

def replace_with_listval(frame, column_name, arr):
    frame[column_name] = frame[column_name].apply(replacement_lists, args=([arr]))

def replacement_lists(x, a):
    if (x.upper().replace("COUNTY", "").replace(" ", "")) in list(a.keys()):
        return a[x.upper().replace("COUNTY", "").replace(" ", "")]
    else:
        return ""

if __name__ == '__main__':
    print(translate(argv[1], argv[2]))