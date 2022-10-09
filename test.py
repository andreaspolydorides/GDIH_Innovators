# %%
import numpy as np
import pandas as pd
import geopandas as gpd
import folium
import matplotlib.pyplot as plt
from scipy.stats import linregress

# %%
# IMPORTING THE DATA CSV INTO A PANDA DATAFRAME
data_path = '/home/andreas/Programming/GDIH_Innovators/Organisations_AT2030_Innovators.csv'
inno_df = pd.read_csv(data_path)
inno_df.columns
 
# %%
# GETTING A LOWRES GEODATAFRAME
world = gpd.read_file('/home/andreas/Programming/GDIH_Innovators/World_Countries_(Generalized)/World_Countries__Generalized_.shp')
world.to_csv('world.csv', index = False, mode = 'w')
# world.to_csv('world.csv', index = False, mode = 'w')
# world.index[world['name']=='United States of America'].tolist()

# %%
innoworld_df = world.merge(inno_df, on='country')
innoworld_df.head()
#innoworld_df.plot()
# %%
world.boundary.plot(figsize=(12,8))
# %%
world.explore(column='pop_est', cmap='Set2')
# %%
asia = world[world['continent'] == 'Asia']
asia.explore(column='gdp_md_est', cmap='Set2')
# %%
asia = world[world['continent'] == 'Asia']
asia.explore(column ='gdp_md_est',
                    cmap='Set2',
                    legend = False,
                    tooltip = False,
                    popup=['name', 'gdp_md_est'])
# %%