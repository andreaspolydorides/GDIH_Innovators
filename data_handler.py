# %%

import numpy as np
import pandas as pd
import geopandas as gpd
import folium
import matplotlib.pyplot as plt
from scipy.stats import linregress



data_path = '/home/andreas/Programming/GDIH_Innovators/Organisations_AT2030_Innovators.csv'
inno_df = pd.read_csv(data_path)


world_filepath = gpd.datasets.get_path('naturalearth_lowres')
world = gpd.read_file(world_filepath)


inno_df['geometry'] = np.nan

for i in range(inno_df.shape[0]):
    # get the row index of the country 
    country = inno_df.loc[i]['Country']
    # use that index to get the boundary polygon
    row = world.index[world['name']==country].tolist()
    # set that country's geometry to that polygon
    inno_df.at[row, 'geometry'] = world.loc[row]['geometry']

# %%
