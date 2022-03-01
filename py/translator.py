from fileinput import filename
import sys
from sys import argv
import datetime, pandas as pd, json, os
from random import randrange

def translate(path, config):
    df = pd.read_csv(path) # path contains an absolute path to read
    config_reader, states_list, ga_counties_list, banner_codes = {}
    __location__ = os.path.realpath(os.path.join(os.getcwd(), os.path.dirname(__file__)))
    with open(config) as json_file:
        config_reader = json.load(json_file)
    with open(os.path.join(__location__, 'states.json')) as json_file_st:
        states_list = list((json.load(json_file_st)).keys())
    with open(os.path.join(__location__, 'ga-counties.json')) as json_file_co:
         ga_counties_list = json.load(json_file_co)
    with open(os.path.join(__location__, 'banner-codes.json')) as json_file_co:
         banner_codes = json.load(json_file_co)

    
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
                remove_values_in_other_column_based_on_initial(df, function["columnName"], transformation["separateColumnName"], transformation["replace"], transformation["replaceType"])
            
            elif(transformation["type"] == "replaceValuesInSeparateColumnBasedOnThisColumn"):
                replace_values_in_other_column_based_on_initial(df, function["columnName"], transformation["separateColumnName"], transformation["replacements"])

            elif(transformation["type"] == "replaceWithValueInList"):
                if(transformation["list"] == "Georgia Counties"):
                    replace_with_listval_county(df, function["columnName"], ga_counties_list)
                else:
                    replace_with_listval(df, function["columnName"], banner_codes)
            
            elif(transformation["type"] == "groupColumns"):
                df = reorder_columns(df, transformation["columnList"])

            elif(transformation["type"] == "convertToSixDigitFICE"):
                convert_to_fice(df, function["columnName"])

            elif(transformation["type"] == "splitDateColumn"):
                split_date_column(df, function["columnName"], transformation['splitColumnNames'])
                convert_num_to_month(df, transformation['splitColumnNames'][0])
                col_col = transformation['splitColumnNames']
                col_col.insert(0, function["columnName"])
                df = reorder_columns(df, col_col)
                df.drop(columns=function["columnName"], inplace=True)

            elif(transformation["type"] == "dropColumn"):
                df.drop(columns=function["columnName"], inplace=True)

            elif(transformation["type"] == "zFill"):
                pad_with_zeros(df, function["columnName"])

            elif(transformation["type"] == "removeColumnsUntilIndex"):
                unshift_to(df, function["columnName"], transformation["index"])

            elif(transformation["type"] == "combineWithColumn"):
                combine_columns(df, function["columnName"], transformation["secondary"])
                df.drop(columns=transformation["secondary"], inplace=True)
            
            elif(transformation["type"] == "convertToEAID"):
                getEAID(df, function["columnName"])

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
        if(replacement["original"] == "*" and isinstance(column_name, int)):
            frame.iloc[:, column_name] = replacement["new"]
        elif(replacement["original"] == "*"):
            frame[column_name] = replacement["new"]
        elif(isinstance(column_name, int)):
            frame.iloc[:, column_name].replace([replacement["original"]], [replacement["new"]], inplace=True)
        else:
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

def remove_values_in_other_column_based_on_initial(frame, column_name, column_name_to_change, value, replace_type):
    if replace_type == "not":
        frame.loc[frame[column_name] != value, column_name_to_change] = ""
    elif replace_type == "defaultNull":
        frame.loc[frame[column_name].isnull(), column_name_to_change] = ""
        frame.loc[frame[column_name] == "", column_name_to_change] = ""
    else:
        frame.loc[frame[column_name] == value, column_name_to_change] = ""

def replace_values_in_other_column_based_on_initial(frame, column_name, column_name_to_change, replaceArray):
    for replacement in replaceArray:
        frame.loc[frame[column_name] == replacement["value"], column_name_to_change] = replacement["replacement"]

def replace_with_listval(frame, column_name, arr):
    frame[column_name] = frame[column_name].apply(replacement_lists, args=([arr]))

def replacement_lists(x, a):
    if x in list(a.keys()):
        return a[x]
    else:
        return ""

def replace_with_listval_county(frame, column_name, arr):
    frame[column_name] = frame[column_name].apply(replacement_lists_county, args=([arr]))

def replacement_lists_county(x, a):
    if (x.upper().replace("COUNTY", "").replace(" ", "")) in list(a.keys()):
        return a[x.upper().replace("COUNTY", "").replace(" ", "")]
    else:
        return ""

def reorder_columns(frame, column_list):
    cols = list(frame.columns.values)
    try:
        index = cols.index(column_list[0])
        for col in column_list:
            n = cols.index(col)
            if n < index:
                index = n
        for col in column_list:
            cols.remove(col)
            cols.insert(index, col)
            index+=1
        frame = frame.reindex(columns=cols)
        return frame
    except:
        return frame
    
def six_digit_fice(x):
    if(pd.isna(x) or x == ""):
        return ""
    else:
        return f'"{int(x):06d}"'

def convert_to_fice(frame, column_name):
    frame[column_name] = frame[column_name].apply(six_digit_fice)

def split_date_column(frame, column_name, new_columns):
    if(frame[column_name].isnull().all()):
        frame[new_columns] = ""
    else:
        frame[new_columns] = frame[column_name].str.split("/", expand=True)

def convert_num_to_month(frame, column_name):
    frame[column_name] = frame[column_name].apply(n_2_m)

def n_2_m(x):
    if(pd.isna(x) or x == ""):
        return ""
    month_list = ['January', 'February', "March", 'April', 'May', 'June', 'July', 'August', 'Sepetember', 'October', 'November', 'December']
    return month_list[((int(float(x)))-1)]

def pad_with_zeros(frame, column_name):
    frame[column_name] = frame[column_name].apply(pwz)

def pwz(x):
    if(pd.isna(x) or x == ""):
        return ""
    else:
        return f'"{int(x):03d}"'

def unshift_to(frame, column_name, i):
    ci = frame.columns.get_loc(column_name)
    while(ci > i):
        frame.drop(frame.columns[i], axis=1, inplace=True)
        ci = frame.columns.get_loc(column_name)

def combine_columns(frame, primary_column, secondary_column):
    frame[primary_column] = frame[primary_column].astype(str) + frame[secondary_column].astype(str)

def getEAID(frame, column_name):
    frame[column_name] = frame[column_name].apply(EAID)

def EAID(x):
    nc = x.replace(",", "").replace("at 12:00 AM", "").rstrip().lstrip().split(" ")
    month_text = nc[0]
    day = (str(nc[1])).zfill(2)
    year = nc[2]
    datetime_object = datetime.datetime.strptime(month_text, "%b")
    month = (str(datetime_object.month)).zfill(2)
    hour = (str(randrange(13)))
    minute = (str(randrange(61))).zfill(2)
    second = (str(randrange(61))).zfill(2)
    return year + month + day + hour + minute + second



    

if __name__ == '__main__':
    print(translate(argv[1], argv[2]))