import pandas as pd

df = pd.read_csv("./online-classes/src/raw_data/undergrad_sections.csv")
unique_depts = df["dept"].unique()
print(len(unique_depts))
category_dict = {
    "Natural Sciences":["ANTHRBIO","APPPHYS","ASTRO","BIOLOGY","BIOPHYS","CHEM","CMPLXSYS","DATASCI","EARTH","EEB","GEOG","MACROMOL","MATH","MCDB","MICRBIOL","PHYSICS","RCNSCI","STATS"],
    "Social Sciences":["ANTHRARC","COMM","DIGITAL","ECON","LING","MENAS","ORGSTUDY","POLSCI","PSYCH","QMSS","RCSSCI","REEES","ROMLING","SOC"],
    "Humanities":["AAS","AMCULT","ARABAM","ARABIC","ARMENIAN","ASIAN","ASIANLAN","ASIANPAM","BCS","CATALAN","CJS","CLARCH","CLCIV","COMPLIT","CZECH","DUTCH","ELI","ENGLISH","FRENCH","FTVM","GERMAN","GREEK","GREEKMOD","GTBOOKS","HEBREW","HISTART","HISTORY","INSTHUM","INTLSTD","ISLAM","ITALIAN","JUDAIC","KRSTD","LATIN","LATINOAM","MELANG","MEMS","MIDEAST","MUSEUMS","MUSMETH","NATIVEAM","PERSIAN","PHIL","POLISH","PORTUG","RCASL","RCHUMS","RCLANG","RELIGION","ROMLANG","RUSSIAN","SCAND","SEAS","SLAVIC","SPANISH","TURKISH","UKR","WGS","WRITING","YIDDISH"],
    "Engineering":["AEROSP","AUTO","BIOMEDE","CEE","CHE","CLIMATE","EECS","ENGR","ENS","ENSCEN","ESENG","IOE","MATSCIE","MECHENG","MFG","NAVARCH","NERS"],
    "Medicine":["ANATOMY","BIOINF","BIOLCHEM","HUMGEN","INTMED","PATH","PHRMACOL","PHYSIOL","PIBS","SPACE","TCHNCLCM","UARTS"],
    "Other":["AERO","AES","ARCH","ARTDES","ARTSADMN","BA","BIOSTAT","COMP","DANCE","EAS","EDCURINS","EDUC","ES","HS","JAZZ","KINESLGY","LACS","MEDCHEM","MILSCI","MKT","MOVESCI","MUSICOL","MUSTHTRE","NAVSCI","NURS","PAT","PHARMACY","PHARMSCI","PUBHLTH","PUBPOL","RCARTS","RCCORE","RCMUSIC","SI","STRATEGY","THEORY","THTREMUS","TO","URP"],
    "Interdisciplinary":["ALA","COGSCI","CSP","ENVIRON","HONORS","LSWA","PPE","RCIDIV","STDABRD","UC"]
}
subject_list = []
for dept in df["dept"]:
    if dept in category_dict["Natural Sciences"]:
        subject_list.append("Natural Sciences")
    elif dept in category_dict["Social Sciences"]:
        subject_list.append("Social Sciences")
    elif dept in category_dict["Humanities"]:
        subject_list.append("Humanities")
    elif dept in category_dict["Engineering"]:
        subject_list.append("Engineering")
    elif dept in category_dict["Medicine"]:
        subject_list.append("Medicine")
    elif dept in category_dict["Other"]:
        subject_list.append("Other")
    else:
        subject_list.append("Interdisciplinary")
df.insert(2,"subject area", subject_list,True)
df.to_csv("./online-classes/src/data/undergrad_sections_processed.csv")
