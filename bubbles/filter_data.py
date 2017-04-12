import pandas as pd
import numpy as np
import json
from multiprocessing import Pool
opps = pd.read_csv("../../ZayoHackathonData_Opportunities.csv")

data={"name":"U.S.","children":[],"size":0,"perc":""}
def get_children(i):
    d={"name":i,"children":[],"size":0,"perc":""}
    state=opps[opps["State"]==i]
    d["size"]=len(state)
    cities = np.unique(state["City"])
    
    for j in cities:
        in_city=state[state["City"]==j]
        if(len(in_city)>1):
            d["children"].append({"name":j,"size":0,"perc":""})
    count = 0
    for j in cities:
        in_city=state[state["City"]==j]
        if(len(in_city)>1):
            d["children"][count]["size"]=len(in_city)
            working = in_city[(in_city["StageName"]=="1 - Working") | (in_city["StageName"]=="2 - Best Case")]
            if(len(working)==0):
                d["children"][count]["perc"]=0. 
        
            else:
                d["children"][count]["perc"] =  '{0:.2f}'.format(float(len(working))/float(len(in_city)))
        
            count+=1
    d["perc"] ='{0:.2f}'.format(float(len(state[(state["StageName"]=="1 - Working") | (state["StageName"]=="2 - Best Case")]))/float(len(state)))  
    return d

for i in np.unique(opps["State"]):
    x=get_children(i)
    if x["name"]!="OR":
        data["children"].append(x)
data["size"] = len(opps)
data["perc"] = '{0:.2f}'.format(float(len(opps[(opps["StageName"]=="1 - Working") | (opps["StageName"]=="2 - Best Case")]))/float(len(opps)))

with open('result.json', 'wb') as fp:
    json.dump(data,fp)