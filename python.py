import sys
import pandas as pd
import json
print('sys',sys.version)
# Read the Excel file into a DataFrame
df = pd.read_excel('/Users/rajatkumar/Desktop/SiteAnalyzer/Company_Permid_Ticker_2.xlsx', engine='openpyxl')

# Convert to JSON
json_data = df.to_json('/Users/rajatkumar/Desktop/SiteAnalyzer/src/assets/Permline.json', orient='records', indent=None)
# dp1=open('/root/loadURL/SiteAnalyzer/test_lookup_all2.txt',mode='r')
'''with open('/root/loadURL/SiteAnalyzer/test_lookup_all2.txt', mode='r') as dp1:
    result =[]
    for x in dp1:
        y=x.split('permid_company_id,')
        if len(y)>1:
            result.append({
                'Company Name':y[0],
                'PermId':y[1],
                'Ticker':''
            })
with open('/root/loadURL/SiteAnalyzer/test_lookup_all2.json', mode='w') as json_file:
    json.dump(result,json_file,indent=2)

print("Data json completed ")'''

# print(dp1.read())
# Print or write to a file
print(json_data)
# Display the first few rows
# print(df.head())
