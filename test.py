# %%
import numpy as np
import pandas as pd
import geopandas as gpd
import folium
import matplotlib.pyplot as plt
from scipy.stats import linregress

# %%
data_path = '.../Organisation_AT2030_Innovators.csv'
orgs = pd.read_csv(data_path)
orgs.head()