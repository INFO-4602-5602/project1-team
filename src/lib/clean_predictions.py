#!/usr/bin/env python
# -*- coding: utf-8 -*-

import pandas as pd
import numpy as np
import pickle
import re

import json

accts = pd.read_csv("data/ZayoHackathonData_Accounts.csv",names=["Account ID","Industry","Vertical","Total BRR","AnnualRevenue","NumberOfEmployees","DandB Revenue","DandB Total Employees"])
cpqs = pd.read_csv("data/ZayoHackathonData_CPQs.csv",names=["CPQ ID","Account ID","CreatedDate","Product Group","X36 MRC List","X36 NRR List","X36 NPV List","Building ID","Market","Street Address","City","State","Postal Code","Network Proximity","On Zayo Network Status"])
opps = pd.read_csv("data/ZayoHackathonData_Opportunities.csv",names=["index","Opportunity ID","Account ID","StageName","IsClosed","IsWon","CreatedDate","Term in Months","Service","Opportunity Type","Product Group","Building ID","Market","Street Address","City","State","Postal Code","Network Proximity","On Zayo Network Status","Latitude","Longitude"],skiprows=1)
bldgs = pd.read_csv("data/ZayoHackathonData_Buildings.csv",names=["Building ID","Market","Street Address","City","State","Postal Code","Latitude","Longitude","On Zayo Network Status","Net Classification","Building Type","Network Proximity","Estimated Build Cost"])

def output_bubbles_json():  # this creates the necessary file for the circle packing vis
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

    with open('../viz/bubbles/result.json', 'wb') as fp:
        json.dump(data,fp)



def label_encoder():  # only run if absolutely necessary lol
    global opp
    global to_predict
    global features
    print "Encoding labels..."
    
    from sklearn import preprocessing

    # Sklearn's decision trees do not like features which are strings. We need 
    # to convert any features which are strings into numerical values. We'll use
    # Sklearn's built in label encoding. We'll store these encoders for our 
    # understanding later.

    le = {}
    for feature in features:
        le[feature] = preprocessing.LabelEncoder()

        if opp[feature].dtype == np.dtype(np.float64):
            # We only need to encode strings
            continue

        le[feature].fit(pd.concat([opp[feature], to_predict[feature]]))
        
        index = opp.index.values
        for row in index:
            
            v=le[feature].transform([opp[feature][int(row)]])[0]
            opp.set_value(int(row),feature,v)

        index = to_predict.index.values
        for row in index:
            v=le[feature].transform([to_predict[feature][int(row)]])[0]
            to_predict.set_value(int(row),feature,v)
        
        
    with open('data/label_encoding.p', 'wb') as handle:
        pickle.dump(le, handle)

def make_classifier(print_importances=False):
    print "Building classifier"
    global features
    global prediction
    global opp

    from sklearn import ensemble
    clf = ensemble.RandomForestClassifier()
    fraction = 1
    shuffled = opp.sample(frac=1)

    trainX = shuffled[features][:int(round(fraction*len(shuffled)))].values
    trainY = shuffled[prediction][:int(round(fraction*len(shuffled)))].values
    
    clf = clf.fit(trainX, trainY)
    with open('data/clf.p', 'wb') as handle:
        pickle.dump(clf, handle)

    if print_importances:
        importances = clf.feature_importances_
        std = np.std([tree.feature_importances_ for tree in clf.estimators_], axis=0)
        indices = np.argsort(importances)[::-1]

        print("Feature ranking:")
        for f in range(opp[features].shape[1]):
            print("%d.\tfeature %d\t(%f, %s)" % (f + 1, indices[f], importances[indices[f]], opp[features].columns[indices[f]].strip()))

def print_tree():
    print "Printing tree"
    global features
    from sklearn import tree

    from IPython.display import Image  
    import pydotplus

    with open('data/clf.p', 'rb') as handle:
        clf = pickle.load(handle)

    dot_data = tree.export_graphviz(clf.estimators_[0], out_file='data/tree.dot', impurity=False, filled=True, rounded=True, max_depth=3, class_names=['Is Not Committed', 'Is Committed'], special_characters=True, feature_names= features)  

def test_classifier():
    print "Testing classifier"
    global features
    global prediction
    global opp

    from sklearn import ensemble

    shuffled = opp.sample(frac=1)
    clf = ensemble.RandomForestClassifier()
    fraction = 9.0/10.0

    trainX = shuffled[features][:int(round(fraction*len(shuffled)))].values
    trainY = shuffled[prediction][:int(round(fraction*len(shuffled)))].values
    
    clf = clf.fit(trainX, trainY)

    testX = shuffled[features][int(round(fraction*len(shuffled))):].values
    testY = shuffled[prediction][int(round(fraction*len(shuffled))):].values
    
    print(clf.score(testX, testY))

def merge_clean_data():
    global bldgs
    global accts
    global opps
    print "Cleaning and merging data..."
    #global opp_filtered
    
    # merge on different tables    
    opps["DandB Total Employees"]=pd.Series(dtype=int)
    opps["Latitude"] = pd.Series(dtype=float)
    opps["Longitude"] = pd.Series(dtype=float)
    opps['Net Classification']=pd.Series(dtype=str)
    opps['Building Type']=pd.Series(dtype=str)
    opps["Estimated Build Cost"]=pd.Series(dtype=float)
    opps['X36 MRC List']=pd.Series(dtype=float)
    opps['X36 NRR List']=pd.Series(dtype=float)
    opps['X36 NPV List']=pd.Series(dtype=float)
    opps['Industry']=pd.Series(dtype=str)
    opps['Vertical']=pd.Series(dtype=str)
    opps['Total BRR']=pd.Series(dtype=float)
    opps['AnnualRevenue']=pd.Series(dtype=float)
    opps['NumberOfEmployees']=pd.Series(dtype=int)
    
    
    for i in range(0,len(opps)):
        a = opps["Account ID"][i]
        b = opps["Building ID"][i]
        n1 = list(accts[accts["Account ID"]==a]["DandB Total Employees"])
        n2 = list(bldgs[bldgs["Building ID"]==b]["Net Classification"])
        n3 = list(bldgs[bldgs["Building ID"]==b]["Building Type"])
        n4 = list(bldgs[bldgs["Building ID"]==b]["Estimated Build Cost"])
        
        n5 = list(cpqs[cpqs["Account ID"]==a]["X36 MRC List"])
        n6 = list(cpqs[cpqs["Account ID"]==a]["X36 NRR List"])
        n7 = list(cpqs[cpqs["Account ID"]==a]["X36 NPV List"])
        n8 = list(accts[accts["Account ID"]==a]["Industry"])
        n9 = list(accts[accts["Account ID"]==a]["Vertical"])
        n10 = list(accts[accts["Account ID"]==a]["Total BRR"])
        n11 = list(accts[accts["Account ID"]==a]["AnnualRevenue"])
        n12 = list(accts[accts["Account ID"]==a]["NumberOfEmployees"])
        n13 = list(bldgs[bldgs["Building ID"]==b]["Latitude"])
        n14 = list(bldgs[bldgs["Building ID"]==b]["Longitude"])
        if type(opps["City"][i])!=str:
            opps.set_value(i,"City","unknown")

        if len(n1)==1:
            opps.set_value(i,"DandB Total Employees",int(n1[0]))
        else:
            opps.set_value(i,"DandB Total Employees",0)

        if len(n2)==1:
            opps.set_value(i,"Net Classification",n2[0])
        else:
            opps.set_value(i,"Net Classification",'unknown')

        if len(n3)==1:
            opps.set_value(i,"Building Type",n3[0])
        else:
            opps.set_value(i,"Building Type",'unknown')

        if len(n4)==1:
            n4 = re.sub('[\$,]','',n4[0])
            n4 = re.sub('[\-]','0',n4)
            n4 =float(n4)
            if np.isnan(n4):
                n4 = 0
            opps.set_value(i,"Estimated Build Cost",n4)
        else:
            opps.set_value(i,"Estimated Build Cost",0.)

        if len(n5)==1:
           n5 = re.sub('[\$,]','',n5[0])
           n5 = re.sub('[\-]','0',n5)
           n5 =float(n5)
           opps.set_value(i,"X36 MRC List",n5)
        else:
            opps.set_value(i,"X36 MRC List",0)

        if len(n6)==1:
           n6 = re.sub('[\$,]','',n6[0])
           n6 = re.sub('[\-]','0',n6)
           n6 =float(n6)
           opps.set_value(i,"X36 NRR List",n6)
        else:
            opps.set_value(i,"X36 NRR List",0)

        if len(n7)==1:
           n7 = re.sub('[\$,]','',n7[0])
           n7 = re.sub('[\-]','0',n7)
           n7 =float(n7)
           opps.set_value(i,"X36 NPV List",n7)
        else:
            opps.set_value(i,"X36 NPV List",0)

        if len(n8)==1:
            if type(n8[0])!=str:
                opps.set_value(i,"Industry",'unknown')
            else:
                opps.set_value(i,"Industry",n8[0])
        else:
            opps.set_value(i,"Industry",'unknown')

        if len(n9)==1:
            if type(n8[0])!=str:
                opps.set_value(i,"Vertical",'unknown')    
            else:
                opps.set_value(i,"Vertical",n9[0])
        else:
            opps.set_value(i,"Vertical",'unknown')

        if len(n10)==1:
           n10 = re.sub('[\$,]','',n10[0])
           n10 = re.sub('[\-]','0',n10)
           n10 =float(n10)
           opps.set_value(i,"Total BRR",n10)
        else:
            opps.set_value(i,"Total BRR",0)

        if len(n11)==1:
           n11 = re.sub('[\$,]','',n11[0])
           n11 = re.sub('[\-]','0',n11)
           n11 =float(n11)
           opps.set_value(i,"AnnualRevenue",n11)
        else:
            opps.set_value(i,"AnnualRevenue",0)

        if len(n12)==1:
            opps.set_value(i,"NumberOfEmployees",int(n12[0]))
        else:
            opps.set_value(i,"NumberOfEmployees",0)

        if len(n13)==1:
           if np.isnan(float(n13[0])):
               opps.set_value(i,"Latitude",0)
           else:    
               opps.set_value(i,"Latitude",float(n13[0]))
        else:
            opps.set_value(i,"Latitude",0)

        if len(n14)==1:
            
            if np.isnan(float(n14[0])):
                opps.set_value(i,"Longitude",0)
            else:
                opps.set_value(i,"Longitude",float(n14[0]))
        else:
            opps.set_value(i,"Longitude",0)
        
        if np.isnan(opps["Network Proximity"][i]):
            opps.set_value(i,"Network Proximity",-1)
        
        if type(opps["Opportunity Type"][i])==float:
            opps.set_value(i,"Opportunity Type","unknown")
        
        if np.isnan(float(opps["Term in Months"][i])):
            opps.set_value(i,"Term in Months",-1)
        else:
            opps.set_value(i,"Term in Months",float(opps["Term in Months"][i]))

    opps.to_csv("data/concat_data.csv")


def make_prediction():
    with open('data/clf.p', 'rb') as handle:
        clf = pickle.load(handle)
    test_predictions = clf.predict_proba(to_predict[features].values)
    index = [int(i) for i in to_predict.index.values]
    count = 0
    for i in range(0,len(opps)):
        if i in index:
            opps.set_value(i,"Prediction",test_predictions[count][1])
            count+=1
        else:
            if opps["StageName"][i] in ["3 - Committed", "4 - Closed", "5 - Accepted"]:
                opps.set_value(i,"Prediction",1)
            else:
                opps.set_value(i,"Prediction",0)
    


output_bubbles_json()
#opps = pd.read_csv("data/concat_data.csv")
merge_clean_data()

opp = opps[(opps["StageName"] == "3 - Committed") | (opps['StageName'] == "4 - Closed") | (opps['StageName'] == "5 - Accepted") | (opps['StageName'] == "Closed - Lost")].copy()
to_predict = opps[(opps["StageName"] == "1 - Working") | (opps['StageName'] ==" 2 - Best Case")].copy()

opp['IsCommitted'] = pd.Series(dtype=int)
for i in opp.index.values:
    if opp["StageName"][i] in ["3 - Committed", "4 - Closed", "5 - Accepted"]:
        opp.set_value(i, "IsCommitted", 1)
    else:
        opp.set_value(i, "IsCommitted", 0)

features = opp.columns.difference([u'IsCommitted',"Opportunity ID", "Account ID","StageName", "IsClosed", "IsWon","CreatedDate",'Building ID',"index","Service","Unnamed: 0","Street Address", "Longitude", "Latitude", "DandB Total Employees"])
prediction = [u'IsCommitted']

label_encoder()
#test_classifier()
make_classifier(print_importances=False)
#print_tree()
opps["Prediction"]=pd.Series()
make_prediction()

opps.to_csv("data/opps_preds.csv")
















    
